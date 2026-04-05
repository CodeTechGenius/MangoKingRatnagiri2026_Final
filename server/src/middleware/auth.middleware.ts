import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: 'SUPER_ADMIN' | 'OPERATOR' | 'CUSTOMER';
    name: string | null;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export function signToken(payload: { userId: string; phone: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string; phone: string; role: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.auth_token;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, phone: true, name: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or inactive' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

export const isAdmin = requireRole('SUPER_ADMIN', 'OPERATOR');
export const isSuperAdmin = requireRole('SUPER_ADMIN');

// Alias — some routes use requireAuth instead of authenticate
export const requireAuth = authenticate;
