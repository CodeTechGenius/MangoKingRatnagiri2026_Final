import { Router, Request, Response, NextFunction } from 'express';
import { verifyPaymentSignature, verifyWebhookSignature, createOrder as createRazorpayOrder, refundPayment } from '../services/razorpay.service';
import { createShiprocketOrder, processShiprocketWebhook } from '../services/shiprocket.service';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// ─── Get active payment gateways (for checkout page) ──────────────────────────
router.get('/gateways/active', async (_req: Request, res: Response) => {
  const gateways = await prisma.paymentGatewayConfig.findMany({
    where: { isActive: true },
    orderBy: { isDefault: 'desc' },
  });
  res.json(gateways);
});

// ─── Create Razorpay order ────────────────────────────────────────────────────
router.post('/create-razorpay', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const rpOrder = await createRazorpayOrder(order.totalAmount, order.orderNumber, { orderId });
    await prisma.order.update({ where: { id: orderId }, data: { razorpayOrderId: rpOrder.id } });
    res.json({ razorpayOrderId: rpOrder.id, amount: rpOrder.amount, key: process.env.RAZORPAY_KEY_ID });
  } catch (e) { next(e); }
});

// ─── Verify Razorpay payment ──────────────────────────────────────────────────
router.post('/verify', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature))
      return res.status(400).json({ error: 'Invalid payment signature' });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus:  'PAID',
        paymentId:      razorpayPaymentId,
        paymentGateway: 'RAZORPAY',
        status:         'CONFIRMED',
        statusHistory:  { create: { status: 'CONFIRMED', note: `Razorpay payment confirmed (${razorpayPaymentId})` } },
      },
      include: { items: { include: { product: true } }, address: true, user: { select: { name: true, email: true, phone: true } } },
    });

    // Auto-push to Shiprocket
    autoSyncShiprocket(order);

    res.json({ success: true, order });
  } catch (e) { next(e); }
});

// ─── COD order confirm ────────────────────────────────────────────────────────
router.post('/cod-confirm', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentGateway: 'COD',
        status: 'CONFIRMED',
        statusHistory: { create: { status: 'CONFIRMED', note: 'COD order confirmed' } },
      },
      include: { items: { include: { product: true } }, address: true, user: { select: { name: true, email: true, phone: true } } },
    });

    // Auto-push to Shiprocket for COD too
    autoSyncShiprocket(order);

    res.json({ success: true, order });
  } catch (e) { next(e); }
});

// ─── Refund payment ──────────────────────────────────────────────────────────
router.post('/refund', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, amount } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order?.paymentId) return res.status(400).json({ error: 'No payment found for refund' });
    const refund = await refundPayment(order.paymentId, amount);
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'REFUNDED',
        statusHistory: { create: { status: 'RETURNED', note: `Refund processed: ${refund.id}` } },
      },
    });
    res.json({ success: true, refundId: refund.id });
  } catch (e) { next(e); }
});

// ─── Razorpay Webhook ─────────────────────────────────────────────────────────
router.post('/webhook', async (req: Request, res: Response) => {
  const sig  = req.headers['x-razorpay-signature'] as string;
  const body = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);

  if (!verifyWebhookSignature(body, sig)) return res.status(400).json({ error: 'Invalid signature' });

  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const order   = await prisma.order.findFirst({ where: { razorpayOrderId: payment.order_id } });
    if (order && order.paymentStatus !== 'PAID') {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus:  'PAID',
          paymentId:      payment.id,
          paymentGateway: 'RAZORPAY',
          status:         'CONFIRMED',
          statusHistory:  { create: { status: 'CONFIRMED', note: `Razorpay webhook (${payment.id})` } },
        },
        include: { items: { include: { product: true } }, address: true, user: { select: { name: true, email: true, phone: true } } },
      });
      autoSyncShiprocket(updated);
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity;
    await prisma.order.updateMany({
      where: { razorpayOrderId: payment.order_id, paymentStatus: 'PENDING' },
      data: { paymentStatus: 'FAILED', statusHistory: { create: { status: 'CANCELLED', note: `Payment failed: ${payment.error_description}` } } as any },
    });
  }

  res.json({ received: true });
});

// ─── Shiprocket Webhook ───────────────────────────────────────────────────────
router.post('/shiprocket-webhook', async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;
    if (event && data) await processShiprocketWebhook(event, data);
  } catch (e) { console.error('SR webhook error:', e); }
  res.json({ received: true });
});

// ─── Helper: auto push to Shiprocket after payment ───────────────────────────
async function autoSyncShiprocket(order: any) {
  try {
    if (order.shiprocketOrderId) return; // already synced
    const sr = await createShiprocketOrder(order);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shiprocketOrderId: sr.order_id?.toString(),
        status: 'PROCESSING',
        statusHistory: { create: { status: 'PROCESSING', note: 'Auto-synced to Shiprocket' } },
      },
    });
    console.log(`✅ Shiprocket sync: order ${order.orderNumber} → SR#${sr.order_id}`);
  } catch (e: any) {
    console.error(`⚠️  Shiprocket auto-sync failed for ${order.orderNumber}:`, e?.response?.data?.message || e?.message);
  }
}

export default router;
