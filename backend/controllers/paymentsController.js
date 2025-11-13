
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

exports.listMyInvoices = async (req, res) => {
  const userId = req.user.userId;

  try {
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const invoices = await prisma.invoice.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: invoices });
  } catch (e) {
    console.error('listMyInvoices error', e);
    res.status(500).json({ success: false, message: 'Failed to load invoices' });
  }
};

exports.getInvoice = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const invoice = await prisma.invoice.findFirst({
      where: { id, patientId: patient.id },
      include: { payments: true },
    });

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (e) {
    console.error('getInvoice error', e);
    res.status(500).json({ success: false, message: 'Failed to load invoice' });
  }
};

exports.createCheckoutSession = async (req, res) => {
  const userId = req.user.userId;
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ success: false, message: 'invoiceId is required' });
  }

  try {
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, patientId: patient.id, status: 'DUE' },
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found or already paid' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: { name: invoice.description || 'Medical Invoice' },
            unit_amount: invoice.amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/patient/billings?paid=1`,
      cancel_url: `${APP_URL}/patient/billings?canceled=1`,
      metadata: {
        invoiceId: invoice.id,
        patientId: patient.id,
      },
    });

    // Store session id
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { stripeSessionId: session.id },
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (e) {
    console.error('createCheckoutSession error', e);
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
};
