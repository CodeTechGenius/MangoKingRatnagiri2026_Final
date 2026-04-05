import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendOTP, verifyOTP } from '../services/otp.service';
import { signToken } from '../middleware/auth.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';

// POST /api/auth/send-otp
export async function sendOTPHandler(req: Request, res: Response) {
  try {
    const { phone } = req.body;
    if (!phone || !/^91[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Enter a valid Indian mobile number' });
    }

    const result = await sendOTP(phone);
    res.json(result);
  } catch (err: any) {
    console.error('sendOTP error:', err);
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
}

// POST /api/auth/verify-otp
export async function verifyOTPHandler(req: Request, res: Response) {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const valid = await verifyOTP(phone, otp);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please try again.' });
    }

    // Get or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, role: 'CUSTOMER', isActive: true }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact support.' });
    }

    const token = signToken({ userId: user.id, phone: user.phone, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err: any) {
    console.error('verifyOTP error:', err);
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
}

// POST /api/auth/logout
export async function logoutHandler(_req: Request, res: Response) {
  res.clearCookie('auth_token');
  res.json({ success: true });
}

// GET /api/auth/me
export async function meHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, phone: true, name: true, email: true, role: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
