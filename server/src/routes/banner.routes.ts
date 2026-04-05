import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.middleware';
import { upload } from '../config/multer';
import { saveBanner } from '../services/image.service';

const router = Router();

router.get('/', async (_req, res: Response) => {
  const now = new Date();
  const banners = await prisma.banner.findMany({
    where: { isActive: true, OR: [{ publishAt: null }, { publishAt: { lte: now } }], AND: [{ OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }] }] },
    orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }]
  });
  res.json(banners);
});

router.get('/all', authenticate, isAdmin, async (_req, res: Response) => {
  const banners = await prisma.banner.findMany({ orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }] });
  res.json(banners);
});

router.post('/', authenticate, isAdmin, upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Image required' });
  const imageUrl = await saveBanner(req.file.buffer);
  const { title, subtitle, link, position = 'HERO', publishAt, unpublishAt } = req.body;
  const banner = await prisma.banner.create({ data: { title, subtitle, link, image: imageUrl, position: position as any, publishAt: publishAt ? new Date(publishAt) : null, unpublishAt: unpublishAt ? new Date(unpublishAt) : null } });
  res.status(201).json(banner);
});

router.patch('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  const banner = await prisma.banner.update({ where: { id: req.params.id }, data: { ...req.body, updatedAt: new Date() } });
  res.json(banner);
});

router.delete('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
