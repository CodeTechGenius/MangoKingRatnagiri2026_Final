import { Request, Response } from 'express';
import prisma from '../config/database';
import type { AuthRequest } from '../middleware/auth.middleware';

export async function getCart(req: AuthRequest, res: Response) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
        variant: true
      }
    });

    const mapped = items.map(i => ({
      id: i.id,
      productId: i.productId,
      variantId: i.variantId,
      productName: i.product.name,
      variantLabel: i.variant?.label || null,
      price: i.variant?.price ?? i.product.discountPrice ?? i.product.mrp,
      mrp: i.variant?.mrp ?? i.product.mrp,
      quantity: i.quantity,
      image: i.product.images?.[0]?.url || null,
      stock: i.variant?.stock ?? i.product.stock,
    }));

    res.json({ items: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addToCart(req: AuthRequest, res: Response) {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.user!.id, productId, variantId: variantId || null }
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
      return res.json(updated);
    }

    const item = await prisma.cartItem.create({
      data: { userId: req.user!.id, productId, variantId: variantId || null, quantity }
    });
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateCart(req: AuthRequest, res: Response) {
  try {
    const item = await prisma.cartItem.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    const updated = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity: req.body.quantity }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeFromCart(req: AuthRequest, res: Response) {
  try {
    if (req.params.id === 'all') {
      await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });
      return res.json({ success: true });
    }
    await prisma.cartItem.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
