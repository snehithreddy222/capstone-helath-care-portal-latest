// backend/controllers/billingController.js
const { PrismaClient } = require("@prisma/client");
const stripe = require("../lib/stripe");

const prisma = new PrismaClient();

async function getPatientIdForUser(userId) {
  const pat = await prisma.patient.findUnique({ where: { userId } });
  return pat?.id || null;
}

// GET /api/billing/invoices
exports.listInvoices = async (req, res) => {
  try {
    const patientId = await getPatientIdForUser(req.user.userId);
    if (!patientId) return res.status(404).json({ success: false, message: "Patient not found" });

    const invoices = await prisma.invoice.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: invoices });
  } catch (e) {
    console.error("listInvoices", e);
    res.status(500).json({ success: false, message: "Failed to load invoices" });
  }
};

// GET /api/billing/balance
exports.balance = async (req, res) => {
  try {
    const patientId = await getPatientIdForUser(req.user.userId);
    if (!patientId) return res.status(404).json({ success: false, message: "Patient not found" });

    const due = await prisma.invoice.findMany({
      where: { patientId, status: "DUE" },
      select: { amountCents: true },
    });
    const total = due.reduce((a, b) => a + b.amountCents, 0);
    res.json({ success: true, data: total });
  } catch (e) {
    console.error("balance", e);
    res.status(500).json({ success: false, message: "Failed to compute balance" });
  }
};

// GET /api/billing/invoices/:id/receipt
exports.receipt = async (req, res) => {
  try {
    const patientId = await getPatientIdForUser(req.user.userId);
    if (!patientId) return res.status(404).json({ success: false, message: "Patient not found" });

    const inv = await prisma.invoice.findFirst({
      where: { id: req.params.id, patientId },
    });
    if (!inv) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, data: { receiptUrl: inv.receiptUrl || null } });
  } catch (e) {
    console.error("receipt", e);
    res.status(500).json({ success: false, message: "Failed to load receipt" });
  }
};

// POST /api/billing/checkout   body: { invoiceId }
exports.checkout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = await getPatientIdForUser(userId);
    if (!patientId) return res.status(404).json({ success: false, message: "Patient not found" });

    const { invoiceId } = req.body || {};
    if (!invoiceId) return res.status(400).json({ success: false, message: "invoiceId is required" });

    const inv = await prisma.invoice.findFirst({ where: { id: invoiceId, patientId } });
    if (!inv) return res.status(404).json({ success: false, message: "Invoice not found" });
    if (inv.status !== "DUE") return res.status(400).json({ success: false, message: "Invoice is not due" });

    const appUrl = process.env.APP_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${appUrl}/patient/billings?paid=1`,
      cancel_url: `${appUrl}/patient/billings?canceled=1`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: inv.amountCents,
            product_data: { name: inv.description || "Medical invoice" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: inv.id,
        patientId,
      },
    });

    // Record a payment row in REQUIRES_PAYMENT state
    await prisma.payment.create({
      data: {
        invoiceId: inv.id,
        provider: "STRIPE",
        stripeSessionId: session.id,
        amountCents: inv.amountCents,
        status: "REQUIRES_PAYMENT",
      },
    });

    res.status(201).json({ success: true, data: { url: session.url } });
  } catch (e) {
    console.error("checkout", e);
    res.status(500).json({ success: false, message: "Failed to create checkout session" });
  }
};

// POST /api/billing/webhook (mounted with raw body in server.js)
exports.webhook = async (req, res) => {
  const stripe = require("../lib/stripe");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionId = session.id;

      // find payment by session
      const pay = await prisma.payment.findFirst({ where: { stripeSessionId: sessionId } });
      if (!pay) {
        console.warn("No payment row for session", sessionId);
      } else {
        // fetch payment intent to get receipt_url
        let receiptUrl = null;
        if (session.payment_intent) {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ["latest_charge"] });
          receiptUrl = pi?.latest_charge?.receipt_url || null;
        }

        await prisma.$transaction([
          prisma.payment.update({
            where: { id: pay.id },
            data: {
              status: "SUCCEEDED",
              stripePaymentIntentId: session.payment_intent || null,
            },
          }),
          prisma.invoice.update({
            where: { id: pay.invoiceId },
            data: { status: "PAID", receiptUrl },
          }),
        ]);
      }
    }
    // you can handle other events if needed
    res.json({ received: true });
  } catch (e) {
    console.error("webhook handler error", e);
    res.status(500).json({ ok: false });
  }
};
