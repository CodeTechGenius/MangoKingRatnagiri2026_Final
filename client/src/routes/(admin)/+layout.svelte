<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authUser } from '$lib/stores';
  import Toast from '$lib/components/ui/Toast.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import '../../app.css';

  let ready = false, sidebarOpen = false;

  onMount(async () => {
    await authUser.init();
    if (!$authUser) { goto('/login'); return; }
    if (!['SUPER_ADMIN','OPERATOR'].includes($authUser.role)) { goto('/'); return; }
    ready = true;
  });

  const nav = [
    { href:'/admin/dashboard', icon:'dashboard',  label:'Dashboard' },
    { href:'/admin/orders',    icon:'receipt',     label:'Orders' },
    { href:'/admin/products',  icon:'package',     label:'Products' },
    { href:'/admin/categories',icon:'grid',        label:'Categories' },
    { href:'/admin/banners',   icon:'banner',      label:'Banners' },
    { href:'/admin/trading',   icon:'trending',    label:'Trading Prices' },
    { href:'/admin/expenses',  icon:'expenses',    label:'Expenses' },
    { href:'/admin/shipping',  icon:'truck',       label:'Shipping' },
    { href:'/admin/payments',  icon:'card',        label:'Payments & OTP' },
  ];

  $: path = $page.url.pathname;
  const isActive = (href: string) => path === href || (href !== '/admin/dashboard' && path.startsWith(href));
</script>

{#if !ready}
  <div class="min-h-screen bg-[#FBF8F2] flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div>
      <p class="font-body text-sm text-[#1E0F06]/50">Loading admin panel…</p>
    </div>
  </div>
{:else}
<div class="flex min-h-screen bg-[#F5F0E8]">

  <!-- Sidebar -->
  <aside class="fixed inset-y-0 left-0 z-50 w-[260px] bg-[#1E0F06] flex flex-col
    transform transition-transform duration-300
    {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex">

    <!-- Sidebar header -->
    <div class="flex items-center gap-3 px-5 py-5 border-b border-white/8">
      <div class="rounded-xl overflow-hidden shrink-0" style="width:42px;height:42px;">
        <img src="/logo.png" alt="Mango King Logo" class="w-full h-full object-cover" />
      </div>
      <div>
        <p class="font-display text-[15px] text-white leading-none">Mango King</p>
        <p class="font-body text-[9px] text-[#C8922A]/60 tracking-[0.2em] uppercase mt-0.5">Admin Panel</p>
      </div>
      <button class="ml-auto lg:hidden text-white/40 hover:text-white transition-colors" on:click={() => sidebarOpen = false}>
        <Icon name="close" size={18} strokeWidth={2.5} color="currentColor"/>
      </button>
    </div>

    <!-- User badge -->
    {#if $authUser}
      <div class="px-4 py-3 border-b border-white/8">
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/6">
          <div class="w-8 h-8 rounded-xl bg-[#C8922A] flex items-center justify-center shrink-0">
            <span class="font-display text-sm text-white font-semibold">{($authUser.name||'A')[0].toUpperCase()}</span>
          </div>
          <div class="min-w-0">
            <p class="font-body font-700 text-sm text-white truncate">{$authUser.name||'Admin'}</p>
            <p class="font-body text-[10px] text-[#C8922A]/70 uppercase tracking-wider">{$authUser.role?.replace('_',' ')}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
      {#each nav as item}
        <button on:click={() => { goto(item.href); sidebarOpen = false; }}
          class="admin-sidebar-item w-full {isActive(item.href) ? 'active' : 'text-white/55'}">
          <Icon name={item.icon} size={18} strokeWidth={isActive(item.href) ? 2 : 1.7} color="currentColor"/>
          {item.label}
        </button>
      {/each}
    </nav>

    <!-- Bottom actions -->
    <div class="px-3 pb-4 space-y-0.5 border-t border-white/8 pt-3">
      <button on:click={() => goto('/')}
        class="admin-sidebar-item w-full text-white/55">
        <Icon name="home" size={18} strokeWidth={1.7} color="currentColor"/>
        View Store
      </button>
      <button on:click={() => { authUser.logout(); goto('/login'); }}
        class="admin-sidebar-item w-full text-red-400 hover:!text-red-300 hover:!bg-red-500/10">
        <Icon name="logout" size={18} strokeWidth={1.7} color="currentColor"/>
        Sign Out
      </button>
    </div>
  </aside>

  <!-- Backdrop (mobile) -->
  {#if sidebarOpen}
    <button class="fixed inset-0 bg-black/60 z-40 lg:hidden w-full border-none cursor-default"
      aria-label="Close menu" on:click={() => sidebarOpen = false}></button>
  {/if}

  <!-- Main content -->
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
    <!-- Mobile topbar -->
    <div class="lg:hidden sticky top-0 z-30 flex items-center gap-4 px-4 py-3.5 bg-[#1E0F06] shadow-nav">
      <button on:click={() => sidebarOpen = true} aria-label="Open menu"
        class="text-white/70 hover:text-white transition-colors">
        <Icon name="menu" size={22} strokeWidth={2} color="currentColor"/>
      </button>
      <span class="font-display text-[#C8922A] text-lg">Admin</span>
    </div>

    <main class="flex-1 overflow-auto p-5 md:p-8">
      <slot />
    </main>
  </div>
</div>
{/if}

<Toast />
