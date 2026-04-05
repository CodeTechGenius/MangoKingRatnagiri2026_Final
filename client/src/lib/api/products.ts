import api from './client';

export const productsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ products: any[]; pagination: any }>(`/api/products${qs}`);
  },
  get: (slug: string) => api.get<{ product: any; related: any[] }>(`/api/products/${slug}`),
  create: (fd: FormData) => api.post<any>('/api/products', fd),
  update: (id: string, data: any) => api.patch<any>(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
};
