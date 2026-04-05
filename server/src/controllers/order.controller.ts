import { Request, Response } from 'express';
import prisma from '../config/database';
import type { AuthRequest } from '../middleware/auth.middleware';

export async function getOrders(req: AuthRequest, res: Response) {
  try {
    const isAdmin = ['SUPER_ADMIN','OPERATOR'].includes(req.user!.role);
    const where = isAdmin ? {} : { userId: req.user!.id };

    const orders = await prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        address: true,
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            variant: true
          }
        }
      }
    });
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrder(req: AuthRequest, res: Response) {
  try {
    const isAdmin = ['SUPER_ADMIN','OPERATOR'].includes(req.user!.role);
    const where: any = { id: req.params.id };
    if (!isAdmin) where.userId = req.user!.id;

    const order = await prisma.order.findFirst({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        address: true,
        items: {
          include: { product: { include: { images: { take: 1 } } }, variant: true }
        },
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createOrderHandler(req: AuthRequest, res: Response) {
  try {
    const { addressId, notes } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: true,
        variant: true
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.id }
    });
    if (!address) return res.status(404).json({ error: 'Address not found' });

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant?.price ?? item.product.discountPrice ?? item.product.mrp;
      return sum + price * item.quantity;
    }, 0);

    const freeShippingSetting = await prisma.setting.findUnique({ where: { key: 'free_shipping_above' } });
    const shippingThreshold = parseFloat(freeShippingSetting?.value || '500');
    const shippingCharge = subtotal >= shippingThreshold ? 0 : 60;
    const totalAmount = subtotal + shippingCharge;

    const orderNumber = `MK${Date.now().toString().slice(-8)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user!.id,
        addressId,
        subtotal,
        shippingCharge,
        totalAmount,
        notes,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            variantLabel: item.variant?.label || null,
            quantity: item.quantity,
            mrp: item.variant?.mrp ?? item.product.mrp,
            price: item.variant?.price ?? item.product.discountPrice ?? item.product.mrp,
          }))
        },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order placed' }
        }
      }
    });

    // Try Razorpay if configured
    let razorpayOrderId = null;
    let razorpayKey = process.env.RAZORPAY_KEY_ID || '';
    try {
      if (razorpayKey) {
        const Razorpay = (await import('razorpay')).default;
        const rp = new Razorpay({ key_id: razorpayKey, key_secret: process.env.RAZORPAY_KEY_SECRET });
        const rpOrder = await rp.orders.create({ amount: Math.round(totalAmount * 100), currency: 'INR', receipt: order.orderNumber });
        razorpayOrderId = rpOrder.id;
        await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId } });
      }
    } catch {
      // Razorpay not configured — COD fallback
    }

    res.status(201).json({
      order,
      razorpayKey,
      razorpayOrderId,
    });
  } catch (err: any) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: err.message });
  }
}
