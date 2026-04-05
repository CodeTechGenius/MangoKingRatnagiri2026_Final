import api from './client';

export const ordersApi = {
  list: () => api.get<{ orders: any[] }>('/api/orders'),
  get: (id: string) => api.get<any>(`/api/orders/${id}`),
  create: (addressId: string, notes?: string) => api.post<any>('/api/orders', { addressId, notes }),
  update: (id: string, data: any) => api.patch<any>(`/api/orders/${id}`, data),
  verifyPayment: (data: any) => api.post<any>('/api/payments/verify', data),
};
