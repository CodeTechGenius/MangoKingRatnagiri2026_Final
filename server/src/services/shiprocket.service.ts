import axios, { AxiosError } from 'axios';
import prisma from '../config/database';

const BASE = 'https://apiv2.shiprocket.in/v1/external';
let _token: string | null = null;
let _tokenExpiry = 0;

// ─── Auth ────────────────────────────────────────────────────────────────────
export async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error('Shiprocket credentials not configured in .env');

  const res = await axios.post(`${BASE}/auth/login`, { email, password });
  _token       = res.data.token;
  _tokenExpiry = Date.now() + 9 * 86400_000; // 9 days
  return _token as string;
}

function hdrs(t: string) {
  return { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' };
}

function srError(e: unknown): string {
  if (e instanceof AxiosError) return e.response?.data?.message || e.message;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

// ─── Create order on Shiprocket (called after payment OR for COD) ─────────────
export async function createShiprocketOrder(order: any): Promise<any> {
  const t = await getToken();

  const isCOD = order.paymentGateway === 'COD' || order.paymentStatus !== 'PAID';

  const payload = {
    order_id:    order.orderNumber,
    order_date:  order.createdAt.toISOString().split('T')[0],
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',

    // Billing = Shipping
    billing_customer_name: order.address.name.split(' ')[0],
    billing_last_name:     order.address.name.split(' ').slice(1).join(' ') || 'NA',
    billing_address:       order.address.line1,
    billing_address_2:     order.address.line2 || '',
    billing_city:          order.address.city,
    billing_pincode:       order.address.pincode,
    billing_state:         order.address.state,
    billing_country:       'India',
    billing_phone:         order.address.phone.replace(/^\+?91/, ''),
    billing_email:         order.user?.email || '',
    shipping_is_billing:   true,

    order_items: order.items.map((i: any) => ({
      name:          i.productName + (i.variantLabel ? ` (${i.variantLabel})` : ''),
      sku:           i.product?.sku || i.productId.slice(0, 10),
      units:         i.quantity,
      selling_price: i.price,
      discount:      0,
      tax:           0,
    })),

    payment_method: isCOD ? 'COD' : 'Prepaid',
    sub_total:  order.subtotal,
    length:     parseInt(process.env.SR_PACKAGE_LENGTH || '30'),
    breadth:    parseInt(process.env.SR_PACKAGE_BREADTH || '25'),
    height:     parseInt(process.env.SR_PACKAGE_HEIGHT  || '15'),
    weight:     parseFloat(process.env.SR_PACKAGE_WEIGHT || '1.5'),
  };

  const res = await axios.post(`${BASE}/orders/create/adhoc`, payload, { headers: hdrs(t) });
  return res.data;
}

// ─── Get all couriers available for a shipment ────────────────────────────────
export async function getAvailableCouriers(shiprocketOrderId: string): Promise<any[]> {
  const t   = await getToken();
  const res = await axios.get(`${BASE}/courier/courierListWithCounts`, {
    headers: hdrs(t),
    params:  { order_id: shiprocketOrderId },
  });
  return res.data?.data?.available_couriers || [];
}

// ─── Assign courier & generate AWB ───────────────────────────────────────────
export async function assignCourier(shipmentId: string, courierId: number): Promise<any> {
  const t   = await getToken();
  const res = await axios.post(`${BASE}/courier/assign/awb`, {
    shipment_id: shipmentId,
    courier_id:  courierId,
  }, { headers: hdrs(t) });
  return res.data;
}

// ─── Schedule pickup ─────────────────────────────────────────────────────────
export async function schedulePickup(shipmentIds: string[]): Promise<any> {
  const t   = await getToken();
  const res = await axios.post(`${BASE}/courier/generate/pickup`, {
    shipment_id: shipmentIds,
  }, { headers: hdrs(t) });
  return res.data;
}

// ─── Generate shipping label PDF ─────────────────────────────────────────────
export async function generateLabel(shipmentIds: string[]): Promise<any> {
  const t   = await getToken();
  const res = await axios.post(`${BASE}/courier/generate/label`, {
    shipment_id: shipmentIds,
  }, { headers: hdrs(t) });
  return res.data;
}

// ─── Generate invoice PDF ─────────────────────────────────────────────────────
export async function generateInvoice(orderIds: string[]): Promise<any> {
  const t   = await getToken();
  const res = await axios.post(`${BASE}/orders/print/invoice`, {
    ids: orderIds,
  }, { headers: hdrs(t) });
  return res.data;
}

// ─── Track by AWB ─────────────────────────────────────────────────────────────
export async function trackByAWB(awb: string): Promise<any> {
  const t   = await getToken();
  const res = await axios.get(`${BASE}/courier/track/awb/${awb}`, { headers: hdrs(t) });
  return res.data;
}

// ─── Track by Shiprocket Order ID ─────────────────────────────────────────────
export async function trackByOrderId(srOrderId: string): Promise<any> {
  const t   = await getToken();
  const res = await axios.get(`${BASE}/orders/show/${srOrderId}`, { headers: hdrs(t) });
  return res.data;
}

// ─── Cancel order on Shiprocket ───────────────────────────────────────────────
export async function cancelShiprocketOrder(orderIds: string[]): Promise<any> {
  const t   = await getToken();
  const res = await axios.post(`${BASE}/orders/cancel`, { ids: orderIds }, { headers: hdrs(t) });
  return res.data;
}

// ─── Serviceability check ─────────────────────────────────────────────────────
export async function checkServiceability(
  pickup: string, delivery: string, weight: number, cod: boolean
): Promise<any> {
  const t   = await getToken();
  const res = await axios.get(`${BASE}/courier/serviceability/`, {
    headers: hdrs(t),
    params:  { pickup_postcode: pickup, delivery_postcode: delivery, weight, cod: cod ? 1 : 0 },
  });
  return res.data;
}

// Alias for old import
export const createOrder = createShiprocketOrder;
export const getServiceability = checkServiceability;

// ─── Map Shiprocket status → our OrderStatus ──────────────────────────────────
export function mapSRStatus(srStatus: string): string | null {
  const map: Record<string, string> = {
    'NEW':                  'CONFIRMED',
    'PROCESSING':           'PROCESSING',
    'PICKUP PENDING':       'PACKED',
    'PICKUP QUEUED':        'PACKED',
    'PICKED UP':            'SHIPPED',
    'IN TRANSIT':           'SHIPPED',
    'OUT FOR DELIVERY':     'OUT_FOR_DELIVERY',
    'DELIVERED':            'DELIVERED',
    'CANCELLED':            'CANCELLED',
    'RTO INITIATED':        'RETURNED',
    'RTO DELIVERED':        'RETURNED',
    'UNDELIVERED':          'RETURNED',
    'LOST':                 'CANCELLED',
    'DAMAGED':              'RETURNED',
  };
  return map[srStatus?.toUpperCase()] || null;
}

// ─── Process webhook and update order status ──────────────────────────────────
export async function processShiprocketWebhook(event: string, data: any): Promise<void> {
  const awb        = data.awb || data.awb_code;
  const srOrderId  = data.order_id?.toString();
  const srStatus   = data.current_status || data.status;

  // Save raw webhook
  await prisma.shiprocketWebhook.create({
    data: { event, awb, orderId: srOrderId, payload: data as any, receivedAt: new Date() },
  }).catch(() => {});

  if (!srOrderId && !awb) return;

  // Find our order
  const where = srOrderId
    ? { shiprocketOrderId: srOrderId }
    : { trackingNumber: awb };

  const order = await prisma.order.findFirst({ where });
  if (!order) return;

  // Update tracking number if available
  const updates: any = {};
  if (awb && !order.trackingNumber) updates.trackingNumber = awb;
  if (data.courier_name)            updates.courierName    = data.courier_name;

  // Map status
  const newStatus = mapSRStatus(srStatus);
  if (newStatus && newStatus !== order.status) {
    updates.status = newStatus;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.order.update({
      where: { id: order.id },
      data:  {
        ...updates,
        ...(updates.status ? {
          statusHistory: {
            create: {
              status: updates.status as any,
              note:   `Shiprocket: ${srStatus} (${event})`,
            },
          },
        } : {}),
      },
    });
  }
}
