<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { cartCount, cartDrawerOpen, authUser } from '$lib/stores';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { fly, fade } from 'svelte/transition';

  let scrolled = false;
  let menuOpen = false;

  $: isHome = $page.url.pathname === '/';
  $: transparent = isHome && !scrolled;

  onMount(() => {
    const h = () => { scrolled = window.scrollY > 60; };
    window.addEventListener('scroll', h, { passive: true });
    scrolled = window.scrollY > 60;
    return () => window.removeEventListener('scroll', h);
  });

  // Close menu on route change
  $: if ($page.url.pathname) menuOpen = false;

  const navLinks = [
    { href: '/',           label: 'Home',        icon: 'home'       },
    { href: '/categories', label: 'Shop',         icon: 'grid'       },
    { href: '/trading',    label: 'Market Prices',icon: 'trending'   },
    { href: '/about-us',   label: 'About Us',     icon: 'star'       },
    { href: '/contact-us', label: 'Contact Us',   icon: 'phone'      },
    { href: '/return-policy', label: 'Return Policy', icon: 'back'   },
  ];

  $: isActive = (h: string) => $page.url.pathname === h || ($page.url.pathname.startsWith(h) && h !== '/');
</script>

<!-- Fixed header - always 64px tall -->
<header class="fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center transition-all duration-400
  {transparent ? 'bg-transparent' : 'bg-[#1A0D05] shadow-nav'}"
  style="backdrop-filter:{transparent?'none':'blur(20px)'};">

  <div class="flex items-center justify-between px-4 w-full">
    <!-- Hamburger --><div class="flex">
 <button on:click={() => menuOpen = !menuOpen} aria-label="Menu"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:bg-white/10 transition-all">
      {#if menuOpen}
        <Icon name="close" size={20} strokeWidth={2.5} color="currentColor"/>
      {:else}
        <Icon name="menu" size={20} strokeWidth={2} color="currentColor"/>
      {/if}
    </button>

    <!-- Logo centered -->
   <a href="/" class="flex items-center gap-2.5 no-underline group">
      <div class="rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 shrink-0" style="width:36px;height:36px;">
        <img src="/logo.png" alt="Mango King Logo" class="w-full h-full object-cover" />
      </div>
      <div>
        <p class="font-display font-semibold text-[15px] text-white leading-none group-hover:text-[#E5B858] transition-colors">Mango King</p>
        <p class="font-body text-[9px] text-[#C8922A]/60 tracking-[0.2em] uppercase mt-0.5">Ratnagiri</p>
      </div>
    </a>

    </div>
   
    <!-- Right: Cart + Profile -->
    <div class="flex items-center gap-0.5">
      <button on:click={() => cartDrawerOpen.set(true)} aria-label="Cart"
        class="relative w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:bg-white/10 transition-all">
        <Icon name="cart" size={19} strokeWidth={2} color="currentColor"/>
        {#if $cartCount > 0}
          <span class="absolute top-1 right-1 w-4 h-4 bg-[#C8922A] text-white text-[9px] font-800 rounded-full flex items-center justify-center leading-none">{$cartCount > 9 ? '9+' : $cartCount}</span>
        {/if}
      </button>
      <button on:click={() => goto($authUser ? '/profile' : '/login')} aria-label="Profile"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:bg-white/10 transition-all">
        {#if $authUser}
          <div class="w-7 h-7 rounded-lg bg-[#C8922A] flex items-center justify-center">
            <span class="font-display text-xs text-white font-semibold">{($authUser.name || 'U')[0].toUpperCase()}</span>
          </div>
        {:else}
          <Icon name="user" size={19} strokeWidth={2} color="currentColor"/>
        {/if}
      </button>
    </div>
  </div>
</header>

<!-- Slide-in side drawer menu -->
{#if menuOpen}
  <!-- Backdrop -->
  <button class="fixed inset-0 bg-black/60 z-40 w-full border-none cursor-default"
    on:click={() => menuOpen = false} aria-label="Close menu"
    transition:fade={{ duration: 250 }}></button>

  <!-- Drawer -->
  <nav class="fixed top-0 left-0 bottom-0 w-[280px] bg-[#1A0D05] z-50 flex flex-col shadow-2xl"
    transition:fly={{ x: -280, duration: 320, easing: (t) => 1 - Math.pow(1-t, 3) }}>

    <!-- Drawer header -->
    <div class="flex items-center justify-between px-5 py-5 border-b border-white/8">
      <div class="flex items-center gap-3">
        <div class="rounded-xl overflow-hidden" style="width:40px;height:40px;">
          <img src="/logo.png" alt="Mango King" class="w-full h-full object-cover"/>
        </div>
        <div>
          <p class="font-display text-[16px] text-white leading-none">Mango King</p>
          <p class="font-body text-[9px] text-[#C8922A]/60 tracking-[0.2em] uppercase mt-0.5">Ratnagiri</p>
        </div>
      </div>
      <button on:click={() => menuOpen = false} aria-label="Close"
        class="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
        <Icon name="close" size={18} strokeWidth={2.5} color="currentColor"/>
      </button>
    </div>

    <!-- User info -->
    {#if $authUser}
      <div class="px-4 py-3 border-b border-white/8">
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/6">
          <div class="w-9 h-9 rounded-xl bg-[#C8922A] flex items-center justify-center shrink-0">
            <span class="font-display text-base text-white">{($authUser.name||'U')[0].toUpperCase()}</span>
          </div>
          <div class="min-w-0">
            <p class="font-body font-700 text-sm text-white truncate">{$authUser.name || 'Mango Lover'}</p>
            <p class="font-body text-[10px] text-[#C8922A]/70">+{$authUser.phone}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Nav links -->
    <div class="flex-1 overflow-y-auto py-3 px-3">
      {#each navLinks as link}
        <button on:click={() => goto(link.href)}
          class="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl mb-1 transition-all duration-200 text-left
            {isActive(link.href)
              ? 'bg-gradient-to-r from-[#C8922A] to-[#E5B858] text-white'
              : 'text-white/60 hover:text-white hover:bg-white/8'}">
          <Icon name={link.icon} size={18} strokeWidth={isActive(link.href) ? 2 : 1.7} color="currentColor"/>
          <span class="font-body font-700 text-[14px]">{link.label}</span>
        </button>
      {/each}

      {#if $authUser && ['SUPER_ADMIN','OPERATOR'].includes($authUser.role)}
        <div class="mt-2 pt-2 border-t border-white/8">
          <button on:click={() => goto('/admin/dashboard')}
            class="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[#C8922A] hover:bg-[#C8922A]/10 transition-all text-left">
            <Icon name="settings" size={18} strokeWidth={1.7} color="currentColor"/>
            <span class="font-body font-700 text-[14px]">Admin Panel</span>
          </button>
        </div>
      {/if}
    </div>

    <!-- Bottom actions -->
    <div class="px-3 pb-6 pt-3 border-t border-white/8 space-y-1">
      {#if $authUser}
        <button on:click={() => goto('/orders')}
          class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/8 transition-all text-left">
          <Icon name="receipt" size={17} strokeWidth={1.7} color="currentColor"/>
          <span class="font-body font-700 text-[13px]">My Orders</span>
        </button>
        <button on:click={() => { authUser.logout(); goto('/'); }}
          class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-left">
          <Icon name="logout" size={17} strokeWidth={1.7} color="currentColor"/>
          <span class="font-body font-700 text-[13px]">Sign Out</span>
        </button>
      {:else}
        <button on:click={() => goto('/login')}
          class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C8922A] text-white font-body font-700 text-[13px]">
          <Icon name="user" size={16} strokeWidth={2} color="white"/>
          Sign In
        </button>
      {/if}
    </div>
  </nav>
{/if}
