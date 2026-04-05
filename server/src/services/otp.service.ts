import prisma from '../config/database';
import crypto from 'crypto';

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000;
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5');

// ─── Generate OTP ────────────────────────────────────────────────────────────
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Get active WhatsApp config from DB (set by admin) ───────────────────────
async function getWhatsAppConfig(): Promise<{ provider: string; apiUrl: string; apiKey: string; from: string } | null> {
  try {
    const [provider, apiUrl, apiKey, from] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'whatsapp_provider' } }),
      prisma.setting.findUnique({ where: { key: 'whatsapp_api_url' } }),
      prisma.setting.findUnique({ where: { key: 'whatsapp_api_key' } }),
      prisma.setting.findUnique({ where: { key: 'whatsapp_number' } }),
    ]);
    if (!provider?.value || provider.value === 'dummy') return null;
    return {
      provider: provider.value,
      apiUrl: apiUrl?.value || '',
      apiKey: apiKey?.value || '',
      from: from?.value || '',
    };
  } catch {
    return null;
  }
}

// ─── Send via Gupshup ────────────────────────────────────────────────────────
async function sendGupshup(phone: string, otp: string, config: any): Promise<boolean> {
  const res = await fetch(config.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'apikey': config.apiKey },
    body: new URLSearchParams({
      channel: 'whatsapp', source: config.from, destination: phone,
      message: JSON.stringify({ isHSM: 'true', templateId: 'otp', params: [otp] }),
      'src.name': 'MangoKing',
    }).toString(),
  });
  return res.ok;
}

// ─── Send via Wati ───────────────────────────────────────────────────────────
async function sendWati(phone: string, otp: string, config: any): Promise<boolean> {
  const res = await fetch(`${config.apiUrl}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      template_name: 'otp_message',
      broadcast_name: 'otp',
      parameters: [{ name: 'otp', value: otp }],
    }),
  });
  return res.ok;
}

// ─── Send via Twilio WhatsApp ─────────────────────────────────────────────────
async function sendTwilio(phone: string, otp: string, config: any): Promise<boolean> {
  const accountSid = config.apiKey.split(':')[0];
  const authToken = config.apiKey.split(':')[1];
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      From: `whatsapp:${config.from}`, To: `whatsapp:+${phone}`,
      Body: `Your Mango King OTP is: *${otp}*\n\nValid for 10 minutes. Do not share with anyone.`,
    }).toString(),
  });
  return res.ok;
}

// ─── Main send function ───────────────────────────────────────────────────────
export async function sendOTP(phone: string): Promise<{ success: boolean; otp?: string }> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY);

  // Save OTP to DB
  await prisma.otpRequest.create({
    data: { phone, otp, expiresAt, userId: null },
  });

  const config = await getWhatsAppConfig();

  // DUMMY / DEV mode — always works, prints OTP to console
  if (!config || process.env.NODE_ENV !== 'production') {
    console.log(`\n🔑 OTP for ${phone}: ${otp} (DEV MODE - not sent via WhatsApp)\n`);
    return { success: true, otp }; // return OTP in dev so frontend can show it
  }

  // Production — try configured provider
  let sent = false;
  try {
    switch (config.provider) {
      case 'gupshup': sent = await sendGupshup(phone, otp, config); break;
      case 'wati':    sent = await sendWati(phone, otp, config); break;
      case 'twilio':  sent = await sendTwilio(phone, otp, config); break;
    }
  } catch (err) {
    console.error('WhatsApp send error:', err);
  }

  if (!sent) {
    console.error(`Failed to send OTP via ${config.provider} to ${phone}`);
    // Don't fail — OTP is saved, user can try again
  }

  return { success: true };
}

// ─── Verify OTP ──────────────────────────────────────────────────────────────
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const record = await prisma.otpRequest.findFirst({
    where: { phone, otp: code, verified: false, expiresAt: { gte: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return false;
  if (record.attempts >= MAX_ATTEMPTS) return false;

  await prisma.otpRequest.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return true;
}
