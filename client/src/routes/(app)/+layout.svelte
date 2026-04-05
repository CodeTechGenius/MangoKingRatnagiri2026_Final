<script lang="ts">
  import '../../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { authUser, cart } from '$lib/stores';
  import MobileHeader   from '$lib/components/layout/MobileHeader.svelte';
  import DesktopNavbar  from '$lib/components/layout/DesktopNavbar.svelte';
  import BottomNav      from '$lib/components/layout/BottomNav.svelte';
  import CartDrawer     from '$lib/components/cart/CartDrawer.svelte';
  import Toast          from '$lib/components/ui/Toast.svelte';

  onMount(async () => {
    await authUser.init();
    await cart.sync();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    const observe = () => document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
    observe();
    const interval = setInterval(observe, 800);
    return () => { io.disconnect(); clearInterval(interval); };
  });

  $: isHome   = $page.url.pathname === '/';
  $: noBottom = ['/checkout','/login'].some(s => $page.url.pathname.startsWith(s));
</script>

<svelte:head><title>Mango King Ratnagiri — Premium Alphonso Mangoes</title></svelte:head>

<div class="block md:hidden"><MobileHeader /></div>
<div class="hidden md:block"><DesktopNavbar /></div>

<!-- 
  Mobile always needs 64px padding (fixed header).
  Desktop: 0 on homepage (transparent hero), 72px on other pages.
-->
<main
  class="min-h-screen page-enter bg-[#FBF8F2] main-content"
  class:is-home={isHome}
>
  <slot />
</main>

{#if !noBottom}
  <BottomNav />
{/if}

<CartDrawer />
<Toast />

<style>
  /* Mobile: always 64px top padding — fixed header height */
  .main-content { padding-top: 64px; }

  /* Desktop breakpoint */
  @media (min-width: 768px) {
    /* Homepage: 0 — hero goes full screen, transparent nav overlaps */
    .main-content.is-home { padding-top: 0; }
    /* All other pages: 72px for the fixed dark navbar */
    .main-content:not(.is-home) { padding-top: 72px; }
  }
</style>
