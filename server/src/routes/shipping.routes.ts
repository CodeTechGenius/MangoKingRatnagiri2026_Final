import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.middleware';
import {
  createShiprocketOrder, getAvailableCouriers, assignCourier,
  schedulePickup, generateLabel, generateInvoice,
  trackByAWB, trackByOrderId, cancelShiprocketOrder, checkServiceability,
} from '../services/shiprocket.service';

const router = Router();

// ─── List orders pending Shiprocket sync ─────────────────────────────────────
router.get('/pending', authenticate, isAdmin, async (_req, res: Response) => {
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: { in: ['PAID', 'PENDING'] },
      shiprocketOrderId: null,
      status: { notIn: ['CANCELLED', 'RETURNED'] },
    },
    include: { user: { select: { name: true, phone: true } }, address: true, items: true },
    orderBy: { createdAt: 'desc' }, take: 100,
  });
  res.json(orders);
});

// ─── Manual push single order to Shiprocket ──────────────────────────────────
router.post('/sync/:orderId', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.orderId },
    include: { address: true, items: { include: { product: true } }, user: { select: { name: true, email: true, phone: true } } },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.shiprocketOrderId) return res.status(409).json({ error: 'Already synced to Shiprocket', shiprocketOrderId: order.shiprocketOrderId });

  try {
    const sr = await createShiprocketOrder(order);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shiprocketOrderId: sr.order_id?.toString(),
        status: 'PROCESSING',
        statusHistory: { create: { status: 'PROCESSING', note: 'Manually synced to Shiprocket' } },
      },
    });
    res.json({ success: true, shiprocketOrderId: sr.order_id, shipmentId: sr.shipment_id });
  } catch (e: any) {
    res.status(500).json({ error: e?.response?.data?.message || e?.message || 'Sync failed' });
  }
});

// ─── Get available couriers for an order ─────────────────────────────────────
router.get('/couriers/:orderId', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.orderId } });
  if (!order?.shiprocketOrderId) return res.status(404).json({ error: 'Order not synced to Shiprocket yet' });
  try {
    const couriers = await getAvailableCouriers(order.shiprocketOrderId);
    res.json(couriers);
  } catch (e: any) {
    res.status(500).json({ error: e?.response?.data?.message || 'Failed to fetch couriers' });
  }
});

// ─── Assign courier (MANUAL step) ────────────────────────────────────────────
router.post('/assign-courier', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const { orderId, shipmentId, courierId } = req.body;
  try {
    const result = await assignCourier(shipmentId, courierId);
    if (result.awb_assign_status === 1) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          trackingNumber: result.response?.data?.awb_code,
          courierName:    result.response?.data?.courier_name,
          status: 'PACKED',
          statusHistory: { create: { status: 'PACKED', note: `Courier assigned: ${result.response?.data?.courier_name} AWB: ${result.response?.data?.awb_code}` } },
        },
      });
    }
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.response?.data?.message || 'Courier assignment failed' });
  }
});

// ─── Schedule pickup ──────────────────────────────────────────────────────────
router.post('/schedule-pickup', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const { shipmentIds, orderIds } = req.body;
  try {
    const result = await schedulePickup(shipmentIds);
    if (orderIds?.length) {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: 'PACKED' },
      });
      for (const id of orderIds) {
        await prisma.orderStatusHistory.create({ data: { orderId: id, status: 'PACKED', note: 'Pickup scheduled' } });
      }
    }
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.response?.data?.message || 'Pickup scheduling failed' });
  }
});

// ─── Generate shipping label ──────────────────────────────────────────────────
router.post('/generate-label', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const { shipmentIds } = req.body;
  try {
    const result = await generateLabel(shipmentIds);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.response?.data?.message || 'Label generation failed' });
  }
});

// ─── Generate invoice ─────────────────────────────────────────────────────────
router.post('/generate-invoice', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const { srOrderIds } = req.body;
  try {
    const result = await generateInvoice(srOrderIds);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.response?.data?.message || 'Invoice generation failed' });
  }
});

// ─── Track by AWB ─────────────────────────────────────────────────────────────
router.get('/track/awb/:awb', async (req, res: Response) => {
  try {
    const result = await trackByAWB(req.params.awb);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: 'Tracking failed' });
  }
});

// ─── Track order (for customers) ──────────────────────────────────────────────
router.get('/track/order/:orderId', authenticate, async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.orderId },
    select: { trackingNumber: true, shiprocketOrderId: true, courierName: true, status: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  let tracking = null;
  try {
    if (order.trackingNumber) tracking = await trackByAWB(order.trackingNumber);
    else if (order.shiprocketOrderId) tracking = await trackByOrderId(order.shiprocketOrderId);
  } catch {}

  res.json({ order, tracking });
});

// ─── Cancel on Shiprocket ─────────────────────────────────────────────────────
router.post('/cancel', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const { srOrderIds, orderId } = req.body;
  try {
    const result = await cancelShiprocketOrder(srOrderIds);
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', statusHistory: { create: { status: 'CANCELLED', note: 'Cancelled on Shiprocket' } } },
      });
    }
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.response?.data?.message || 'Cancellation failed' });
  }
});

// ─── Serviceability check ─────────────────────────────────────────────────────
router.get('/serviceability', authenticate, isAdmin, async (req, res: Response) => {
  const { pickup, delivery, weight = '1', cod = 'false' } = req.query as Record<string, string>;
  const result = await checkServiceability(pickup, delivery, parseFloat(weight), cod === 'true');
  res.json(result);
});

// ─── Dashboard summary ────────────────────────────────────────────────────────
router.get('/summary', authenticate, isAdmin, async (_req, res: Response) => {
  const [pending, synced, shipped, delivered] = await Promise.all([
    prisma.order.count({ where: { shiprocketOrderId: null, status: { notIn: ['CANCELLED', 'RETURNED', 'DELIVERED'] }, paymentStatus: { in: ['PAID', 'PENDING'] } } }),
    prisma.order.count({ where: { shiprocketOrderId: { not: null }, status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
  ]);
  res.json({ pending, synced, shipped, delivered });
});

export default router;
