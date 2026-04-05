import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();
router.use(authenticate);

router.get('/', async (req: any, res) => {
  try {
    const [user, orderCount, deliveredCount, addressCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, phone: true, email: true, role: true } }),
      prisma.order.count({ where: { userId: req.user.id } }),
      prisma.order.count({ where: { userId: req.user.id, status: 'DELIVERED' } }),
      prisma.address.count({ where: { userId: req.user.id } }),
    ]);
    res.json({ user, orderCount, deliveredCount, addressCount });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/', async (req: any, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(name !== undefined && { name }), ...(email !== undefined && { email }) },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    res.json(user);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
