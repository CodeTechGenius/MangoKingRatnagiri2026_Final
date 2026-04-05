import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const cartDrawerOpen = writable(false);
export const mobileMenuOpen = writable(false);

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  const add = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    update(t => [...t, { ...toast, id }]);
    setTimeout(
      () => update(t => t.filter(x => x.id !== id)),
      toast.duration ?? 3000
    );
  };

  return {
    subscribe,
    add,
    remove: (id: string) => update(t => t.filter(x => x.id !== id)),
    success: (message: string, duration?: number) => add({ type: 'success', message, duration }),
    error:   (message: string, duration?: number) => add({ type: 'error',   message, duration }),
    warning: (message: string, duration?: number) => add({ type: 'warning', message, duration }),
    info:    (message: string, duration?: number) => add({ type: 'info',    message, duration }),
  };
}

export const toasts = createToastStore();

function createWishlistStore() {
  let initial: string[] = [];
  if (browser) {
    try { initial = JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch {}
  }

  const { subscribe, update } = writable<string[]>(initial);

  return {
    subscribe,
    toggle: (productId: string) =>
      update(ids => {
        const next = ids.includes(productId)
          ? ids.filter(i => i !== productId)
          : [...ids, productId];
        if (browser) localStorage.setItem('wishlist', JSON.stringify(next));
        return next;
      })
  };
}

export const wishlist = createWishlistStore();
