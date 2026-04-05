import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, isAdmin, isSuperAdmin, AuthRequest } from '../middleware/auth.middleware';
import { startOfMonth } from 'date-fns';

const router = Router();

router.get('/', authenticate, isAdmin, async (_req, res: Response) => {
  const thisMonth = startOfMonth(new Date());
  const [expenses, monthlyAgg, revenueAgg] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: 'desc' }, take: 100 }),
    prisma.expense.aggregate({ where: { date: { gte: thisMonth } }, _sum: { amount: true } }),
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: thisMonth } }, _sum: { totalAmount: true } })
  ]);
  const monthlyRevenue = revenueAgg._sum.totalAmount || 0;
  const monthlyExpenses = monthlyAgg._sum.amount || 0;
  res.json({ expenses, monthlyExpenses, monthlyRevenue, profit: monthlyRevenue - monthlyExpenses });
});

router.post('/', authenticate, isSuperAdmin, async (req: AuthRequest, res: Response) => {
  const expense = await prisma.expense.create({ data: { ...req.body, date: new Date(req.body.date) } });
  res.status(201).json(expense);
});

router.delete('/:id', authenticate, isSuperAdmin, async (_req, res: Response) => {
  res.json({ success: true });
});

export default router;
