import { Router } from 'express';
import prisma from '../config/database';
const router = Router();
router.get('/', async (_req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [todayPrices, history] = await Promise.all([
      prisma.mangoPrice.findMany({ where: { date: { gte: today } }, orderBy: { variety: 'asc' } }),
      prisma.mangoPrice.findMany({ orderBy: { date: 'desc' }, take: 200 })
    ]);
    const varieties = [...new Set(history.map((p: any) => p.variety))];
    res.json({ todayPrices, priceHistory: history, varieties });
  } catch (e) { next(e); }
});
export default router;
