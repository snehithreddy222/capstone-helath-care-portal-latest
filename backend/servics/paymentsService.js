const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Called by Stripe webhook when checkout.session.completed fires.
 * Marks invoice paid and records a payment row idempotently.
 */
exports.updateInvoiceAsPaid = async (session) => {
  const invoiceId = session?.metadata?.invoiceId;
  if (!invoiceId) return;

  const paymentIntentId = session.payment_intent || null;
  const amountTotal = session.amount_total || 0;
  const currency = session.currency ? session.currency.toUpperCase() : 'USD';

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;

  if (invoice.status === 'PAID') return; // idempotency

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        stripePaymentIntentId: paymentIntentId,
        updatedAt: new Date(),
      },
    });

    await tx.payment.create({
      data: {
        invoiceId: invoiceId,
        amountCents: amountTotal,
        currency,
        provider: 'STRIPE',
        providerRef: paymentIntentId || session.id,
        status: 'SUCCEEDED',
      },
    });
  });
};
