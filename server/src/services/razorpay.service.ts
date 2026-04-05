import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export async function createOrder(amount: number, receipt: string, notes?: Record<string, string>) {
  return razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt, notes: notes || {} });
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${orderId}|${paymentId}`).digest('hex');
  return expected === signature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(body).digest('hex');
  return expected === signature;
}

export async function fetchPayment(paymentId: string) { return razorpay.payments.fetch(paymentId); }
export async function refundPayment(paymentId: string, amount?: number) {
  return razorpay.payments.refund(paymentId, { amount: amount ? Math.round(amount * 100) : undefined });
}
