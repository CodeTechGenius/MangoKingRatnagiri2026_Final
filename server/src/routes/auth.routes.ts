import { Router } from 'express';
import { sendOTPHandler, verifyOTPHandler, logoutHandler, meHandler } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.post('/send-otp', sendOTPHandler);
router.post('/verify-otp', verifyOTPHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticate, meHandler);
export default router;
