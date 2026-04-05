import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'OPERATOR' | 'CUSTOMER';
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthUser | null>(null);

  return {
    subscribe,
    init: async () => {
      if (!browser) return;
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const { api } = await import('$api/client');
        const user = await api.get<AuthUser>('/api/auth/me');
        set(user);
      } catch {
        localStorage.removeItem('auth_token');
        set(null);
      }
    },
    login: (user: AuthUser, token: string) => {
      if (browser) localStorage.setItem('auth_token', token);
      set(user);
    },
    logout: () => {
      if (browser) localStorage.removeItem('auth_token');
      set(null);
      // Fire and forget
      if (browser) {
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      }
    },
    update
  };
}

export const authUser = createAuthStore();
export const isLoggedIn = derived(authUser, $u => $u !== null);
export const isAdmin = derived(
  authUser,
  $u => $u?.role === 'SUPER_ADMIN' || $u?.role === 'OPERATOR'
);
