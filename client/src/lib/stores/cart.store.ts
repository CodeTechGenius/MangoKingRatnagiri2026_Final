import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  price: number;
  mrp: number;
  quantity: number;
  image: string | null;
  stock: number;
}

function createCartStore() {
  const { subscribe, set, update } = writable<CartItem[]>([]);

  return {
    subscribe,
    set,
    sync: async () => {
      if (!browser) return;
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const { api } = await import('$api/client');
        const data = await api.get<{ items: CartItem[] }>('/api/cart');
        set(data.items || []);
      } catch {}
    },
    addItem: (item: CartItem) => {
      update(items => {
        const ex = items.find(
          i => i.productId === item.productId && i.variantId === item.variantId
        );
        if (ex) {
          return items.map(i =>
            i.productId === item.productId && i.variantId === item.variantId
              ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
              : i
          );
        }
        return [...items, item];
      });
    },
    removeItem: (productId: string, variantId: string | null) =>
      update(items =>
        items.filter(i => !(i.productId === productId && i.variantId === variantId))
      ),
    updateQuantity: (productId: string, variantId: string | null, quantity: number) =>
      update(items =>
        items.map(i =>
          i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
        )
      ),
    clear: () => set([])
  };
}

export const cart = createCartStore();
export const cartCount    = derived(cart, $c => $c.reduce((s, i) => s + i.quantity, 0));
export const cartTotal    = derived(cart, $c => $c.reduce((s, i) => s + i.price * i.quantity, 0));
export const cartMrpTotal = derived(cart, $c => $c.reduce((s, i) => s + i.mrp * i.quantity, 0));
export const cartSavings  = derived([cartMrpTotal, cartTotal], ([$m, $t]) => $m - $t);
