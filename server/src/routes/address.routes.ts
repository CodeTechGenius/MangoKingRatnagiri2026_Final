import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();
router.use(authenticate);

router.get('/', async (req: any, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });
    res.json(addresses);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req: any, res) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, isDefault = false } = req.body;
    const count = await prisma.address.count({ where: { userId: req.user.id } });
    if (isDefault || count === 0) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const addr = await prisma.address.create({
      data: { userId: req.user.id, name, phone, line1, line2, city, state, pincode, isDefault: isDefault || count === 0 }
    });
    res.status(201).json(addr);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req: any, res) => {
  try {
    const { isDefault, ...rest } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const addr = await prisma.address.update({ where: { id: req.params.id }, data: { ...rest, ...(isDefault !== undefined && { isDefault }) } });
    res.json(addr);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req: any, res) => {
  try {
    await prisma.address.delete({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
