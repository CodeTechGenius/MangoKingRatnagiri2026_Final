import api from './client';

export const cartApi = {
  get: () => api.get<{ items: any[] }>('/api/cart'),
  add: (productId: string, variantId: string | null, quantity = 1) =>
    api.post('/api/cart', { productId, variantId, quantity }),
  update: (itemId: string, quantity: number) => api.put(`/api/cart/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/api/cart/${itemId}`),
  clear: () => api.delete('/api/cart'),
};
