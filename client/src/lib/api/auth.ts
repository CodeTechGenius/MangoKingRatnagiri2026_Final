import api from './client';

export const authApi = {
  sendOTP: (phone: string) => api.post<{ success: boolean; message: string; otp?: string }>('/api/auth/send-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post<{ token: string; user: any }>('/api/auth/verify-otp', { phone, otp }),
  me: () => api.get<any>('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};
