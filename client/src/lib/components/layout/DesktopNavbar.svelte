<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { cartCount, cartDrawerOpen, authUser } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';
  import LogoMark from '$lib/components/ui/LogoMark.svelte';

  let scrolled = false;
  let cats: any[] = [];
  let megaOpen = false;
  let profileOpen = false;

  $: isHome = $page.url.pathname === '/';
  $: transparent = isHome && !scrolled;
  $: navBg = transparent ? 'bg-transparent' : 'bg-[#1A0D05]';

  onMount(() => {
    const onScroll = () => { scrolled = window.scrollY > 60; };
    window.addEventListener('scroll', onScroll, { passive: true });
    scrolled = window.scrollY > 60;
    api.get<any[]>('/api/categories').then(d => cats = d || []).catch(() => {});
    return () => window.removeEventListener('scroll', onScroll);
  });

  $: isActive = (h: string) => $page.url.pathname === h || ($page.url.pathname.startsWith(h) && h !== '/');
  function closeAll() { megaOpen = false; profileOpen = false; }
</script>

<header class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 {navBg} {scrolled || !isHome ? 'shadow-nav' : ''}"
  style="backdrop-filter:{transparent?'none':'blur(20px)'};">
  <div class="max-w-[1320px] mx-auto px-8 flex items-center gap-6 h-[72px]">

    <!-- Logo -->
    <a href="/" class="flex items-center gap-3 shrink-0 no-underline group">
      <!-- Logo mark - the mango icon from uploaded image -->
      <div class="shrink-0 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105" style="width:40px;height:40px;">
        <img src="/logo.png" alt="Mango King Logo" class="w-full h-full object-cover" />
      </div>
      <div>
        <p class="font-display font-semibold text-[17px] text-white leading-none tracking-wide group-hover:text-[#E5B858] transition-colors">Mango King</p>
        <p class="font-body text-[9px] text-[#C8922A]/70 tracking-[0.25em] uppercase mt-0.5">Ratnagiri • Est. 1998</p>
      </div>
    </a>

    <!-- Nav links -->
    <nav class="flex items-center gap-0.5 flex-1">
      {#each [['/', 'Home'], ['/categories', 'Shop']] as [href, label]}
        <a {href} class="px-4 py-2.5 rounded-xl font-body text-[13.5px] font-600 transition-all duration-200 no-underline
          {isActive(href) ? 'text-[#C8922A] bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/8'}">
          {label}
        </a>
      {/each}

      <!-- Browse dropdown -->
      <div role="navigation" aria-label="Browse categories"
        on:mouseenter={() => megaOpen = true}
        on:mouseleave={() => megaOpen = false}
        class="relative">
        <button aria-expanded={megaOpen} aria-haspopup="true"
          class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-body text-[13.5px] font-600 text-white/80 hover:text-white hover:bg-white/8 transition-all duration-200">
          Browse
          <Icon name="chevronD" size={13} strokeWidth={3} color="currentColor"/>
        </button>
        {#if megaOpen}
          <div class="absolute top-full left-0 pt-3 w-[260px] animate-scale-in z-50">
            <div class="bg-white rounded-2xl shadow-elevated border border-[#E6D9C0] overflow-hidden">
              <div class="p-2">
                {#each cats as cat}
                  <a href="/categories/{cat.slug}" on:click={closeAll}
                    class="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FBF4E6] transition-colors no-underline group/item">
                    <!-- Logo icon in dropdown -->
                    <div class="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style=" solid rgba(200,146,42,0.25);">
                      <img src="/logo.png" alt="Mango King" width="28" height="28" class="object-contain w-full h-full" style="display:block;" />
                    </div>
                    <div>
                      <p class="font-body font-700 text-[13px] text-[#1E0F06] group-hover/item:text-[#C8922A] transition-colors">{cat.name}</p>
                      {#if cat.description}<p class="font-body text-[11px] text-[#1E0F06]/40 mt-0.5 line-clamp-1">{cat.description}</p>{/if}
                    </div>
                  </a>
                {/each}
              </div>
              <div class="p-2 border-t border-[#E6D9C0]">
                <a href="/categories" on:click={closeAll}
                  class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C8922A]/8 text-[#C8922A] font-body text-[12px] font-700 tracking-wider uppercase hover:bg-[#C8922A]/15 transition-colors no-underline">
                  View All Categories
                  <Icon name="forward" size={13} strokeWidth={2.5} color="currentColor"/>
                </a>
              </div>
            </div>
          </div>
        {/if}
      </div>

      {#each [['/trading', 'Prices'], ['/about-us', 'About'], ['/contact-us', 'Contact']] as [href, label]}
        <a {href} class="px-4 py-2.5 rounded-xl font-body text-[13.5px] font-600 transition-all duration-200 no-underline
          {isActive(href) ? 'text-[#C8922A] bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/8'}">
          {label}
        </a>
      {/each}
    </nav>

    <!-- Right actions -->
    <div class="flex items-center gap-1.5 shrink-0">
      <button on:click={() => goto('/search')} aria-label="Search"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
        <Icon name="search" size={18} strokeWidth={2} color="currentColor"/>
      </button>

      <button on:click={() => cartDrawerOpen.set(true)} aria-label="Cart"
        class="relative flex items-center gap-2 bg-[#C8922A] hover:bg-[#956A18] text-white pl-4 pr-4 py-2.5 rounded-xl font-body font-700 text-[12.5px] shadow-gold hover:shadow-gold-lg transition-all duration-300">
        <Icon name="cart" size={16} strokeWidth={2} color="white"/>
        {#if $cartCount > 0}
          <span class="bg-white text-[#C8922A] text-[10px] font-800 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{$cartCount > 99 ? '99+' : $cartCount}</span>
        {:else}
          <span>Cart</span>
        {/if}
      </button>

      {#if $authUser}
        <div role="navigation" aria-label="User menu"
          on:mouseenter={() => profileOpen = true}
          on:mouseleave={() => profileOpen = false}
          class="relative">
          <button aria-expanded={profileOpen} aria-haspopup="true" aria-label="User menu"
            class="w-10 h-10 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center font-display text-sm text-white hover:border-[#C8922A]/60 hover:bg-white/15 transition-all font-semibold">
            {($authUser.name || 'U')[0].toUpperCase()}
          </button>
          {#if profileOpen}
            <div class="absolute top-full right-0 pt-3 w-52 animate-scale-in z-50">
              <div class="bg-white rounded-2xl shadow-elevated border border-[#E6D9C0] p-1.5">
                <a href="/profile" on:click={closeAll} class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-[13px] font-600 text-[#1E0F06] hover:bg-[#FBF4E6] hover:text-[#C8922A] transition-colors no-underline"><Icon name="user" size={15} strokeWidth={2} color="currentColor"/>Profile</a>
                <a href="/orders"  on:click={closeAll} class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-[13px] font-600 text-[#1E0F06] hover:bg-[#FBF4E6] hover:text-[#C8922A] transition-colors no-underline"><Icon name="receipt" size={15} strokeWidth={2} color="currentColor"/>My Orders</a>
                {#if ['SUPER_ADMIN','OPERATOR'].includes($authUser.role)}
                  <a href="/admin/dashboard" on:click={closeAll} class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-[13px] font-700 text-[#C8922A] hover:bg-[#FBF4E6] transition-colors no-underline"><Icon name="settings" size={15} strokeWidth={2} color="currentColor"/>Admin Panel</a>
                {/if}
                <hr class="my-1 border-[#E6D9C0]"/>
                <button on:click={() => { authUser.logout(); goto('/'); closeAll(); }}
                  class="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-[13px] font-600 text-red-500 hover:bg-red-50 transition-colors">
                  <Icon name="logout" size={15} strokeWidth={2} color="currentColor"/>Sign Out
                </button>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <a href="/login" class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 text-white/80 hover:text-white hover:border-white/50 hover:bg-white/8 font-body font-600 text-[13px] transition-all no-underline">
          <Icon name="user" size={15} strokeWidth={2} color="currentColor"/>Sign In
        </a>
      {/if}
    </div>
  </div>
</header>
