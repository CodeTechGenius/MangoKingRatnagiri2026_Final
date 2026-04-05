import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, isAdmin, isSuperAdmin, AuthRequest } from '../middleware/auth.middleware';
import { startOfMonth, subMonths } from 'date-fns';

const router = Router();

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', authenticate, isAdmin, async (_req, res: Response) => {
  const now       = new Date();
  const thisMonth = startOfMonth(now);
  const lastMonth = startOfMonth(subMonths(now, 1));

  const [revThis, revLast, ordersThis, ordersLast, totalCustomers, expenses, recentOrders] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: thisMonth } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: lastMonth, lt: thisMonth } }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.expense.aggregate({ where: { date: { gte: thisMonth } }, _sum: { amount: true } }),
    prisma.order.findMany({
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' }, take: 10,
    }),
  ]);

  const revenue    = revThis._sum.totalAmount || 0;
  const revenuePrev = revLast._sum.totalAmount || 1;
  const expTotal   = expenses._sum.amount || 0;
  const pct        = (c: number, p: number) => p === 0 ? 100 : Math.round(((c - p) / p) * 100);

  res.json({
    stats: {
      revenue,       revenueChange: pct(revenue, revenuePrev),
      orders: ordersThis, ordersChange: pct(ordersThis, ordersLast),
      profit: revenue - expTotal, customers: totalCustomers, expenses: expTotal,
    },
    recentOrders,
  });
});

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', authenticate, isSuperAdmin, async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, phone: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' }, take: 200,
  });
  res.json(users);
});

router.patch('/users/:id', authenticate, isSuperAdmin, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
    select: { id: true, name: true, phone: true, role: true, isActive: true },
  });
  res.json(user);
});

// ─── Payment Gateways ─────────────────────────────────────────────────────────
router.get('/payment-gateways', authenticate, isAdmin, async (_req, res: Response) => {
  const gateways = await prisma.paymentGatewayConfig.findMany({ orderBy: { isDefault: 'desc' } });
  res.json(gateways);
});

// Toggle gateway on/off
router.patch('/payment-gateways/:gateway', authenticate, isSuperAdmin, async (req: AuthRequest, res: Response) => {
  if (req.body.isDefault) {
    await prisma.paymentGatewayConfig.updateMany({ data: { isDefault: false } });
  }
  const config = await prisma.paymentGatewayConfig.upsert({
    where:  { gateway: req.params.gateway as any },
    create: { gateway: req.params.gateway as any, isActive: false, isDefault: false, config: {}, ...req.body, updatedAt: new Date() },
    update: { ...req.body, updatedAt: new Date() },
  });
  res.json(config);
});

// Save gateway credentials (Razorpay key, Cashfree etc.)
router.patch('/payment-gateways/:gateway/credentials', authenticate, isSuperAdmin, async (req: AuthRequest, res: Response) => {
  const { credentials } = req.body; // { keyId, keySecret, webhookSecret, ... }
  const config = await prisma.paymentGatewayConfig.upsert({
    where:  { gateway: req.params.gateway as any },
    create: { gateway: req.params.gateway as any, isActive: false, isDefault: false, config: credentials, updatedAt: new Date() },
    update: { config: credentials, updatedAt: new Date() },
  });
  res.json({ success: true, gateway: config.gateway });
});

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', authenticate, isAdmin, async (_req, res: Response) => {
  const rows = await prisma.setting.findMany();
  const obj: Record<string, string> = {};
  rows.forEach(r => { obj[r.key] = r.value; });
  res.json(obj);
});

router.patch('/settings', authenticate, isSuperAdmin, async (req: AuthRequest, res: Response) => {
  const settings = req.body as Record<string, string>;
  const ops = Object.entries(settings).map(([key, value]) =>
    prisma.setting.upsert({
      where:  { key },
      create: { key, value, updatedAt: new Date() },
      update: { value, updatedAt: new Date() },
    })
  );
  await Promise.all(ops);
  res.json({ updated: ops.length });
});

// ─── Orders management ────────────────────────────────────────────────────────
router.patch('/orders/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const { status, trackingNumber, courierName, costPrice, profit, note } = req.body;
  const data: any = {};
  if (status)          data.status         = status;
  if (trackingNumber)  data.trackingNumber  = trackingNumber;
  if (courierName)     data.courierName     = courierName;
  if (costPrice != null) data.costPrice     = costPrice;
  if (profit    != null) data.profit        = profit;
  if (status) {
    data.statusHistory = { create: { status, note: note || `Status updated to ${status}` } };
  }
  const order = await prisma.order.update({ where: { id: req.params.id }, data });
  res.json(order);
});

export default router;
