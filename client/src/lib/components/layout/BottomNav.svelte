<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { cartCount, cartDrawerOpen } from '$lib/stores';
  import Icon from '$lib/components/ui/Icon.svelte';

  const left  = [
    { href: '/',           label: 'Home',    icon: 'home'   },
    { href: '/categories', label: 'Shop',    icon: 'grid'   },
  ];
  const right = [
    { href: '/search',     label: 'Search',  icon: 'search' },
    { href: '/profile',    label: 'Profile', icon: 'user'   },
  ];

  $: p = $page.url.pathname;
  const isActive = (h: string) => p === h || (h !== '/' && p.startsWith(h));
</script>

<!-- Spacer so content isn't hidden behind the 80px nav -->
<div class="h-[84px] md:hidden"></div>

<nav class="fixed bottom-0 left-0 right-0 z-40 md:hidden" style="height:84px;">
  <!-- Dark background with notch -->
  <svg class="absolute bottom-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 390 84" preserveAspectRatio="none">
    <path d="M0 24 Q0 2 22 2 L155 2 Q169 2 174 13 Q180 28 195 28 Q210 28 216 13 Q221 2 235 2 L368 2 Q390 2 390 24 L390 84 L0 84 Z" fill="#1A1008"/>
  </svg>

  <div class="relative h-full flex items-end justify-around px-1 pb-3 pt-0">
    <!-- Left items -->
    {#each left as item}
      <button on:click={() => goto(item.href)} aria-label={item.label}
        class="flex flex-col items-center justify-end gap-1 w-[72px] pb-1 transition-all duration-200
          {isActive(item.href) ? 'text-[#C8922A]' : 'text-white/45 hover:text-white/75'}">
        <div class="w-6 h-6 flex items-center justify-center transition-transform duration-200 {isActive(item.href) ? 'scale-110' : ''}">
          <Icon name={item.icon} size={22} strokeWidth={isActive(item.href) ? 2.2 : 1.6} color="currentColor"/>
        </div>
        <span class="font-body text-[10px] font-700 tracking-wide leading-none">{item.label}</span>
        <div class="h-1 w-1 {isActive(item.href) ? 'rounded-full bg-[#C8922A]' : ''}"></div>
      </button>
    {/each}

    <!-- Center raised cart -->
    <div class="flex flex-col items-center w-[80px] relative" style="margin-bottom: 6px;">
      <button on:click={() => cartDrawerOpen.set(true)} aria-label="Open cart"
        class="relative w-[62px] h-[62px] rounded-full flex items-center justify-center active:scale-90 transition-transform duration-150"
        style="
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle at 35% 35%, #E5B858, #C8922A 55%, #7A5018);
          box-shadow: 0 0 0 5px rgba(200,146,42,0.18), 0 -2px 20px rgba(200,146,42,0.5), 0 8px 24px rgba(200,146,42,0.4);
        ">
        {#if $cartCount > 0}
          <div class="absolute inset-0 rounded-full bg-[#C8922A] animate-ping opacity-20"></div>
        {/if}
        <Icon name="cart" size={26} strokeWidth={1.8} color="white"/>
        {#if $cartCount > 0}
          <span class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-[#C94F18] text-white text-[10px] font-800 rounded-full flex items-center justify-center px-1 border-2 border-[#1A1008]">
            {$cartCount > 99 ? '99+' : $cartCount}
          </span>
        {/if}
      </button>
      <!-- Cart label below at nav floor -->
      <!-- <span class="font-body text-[10px] font-700 text-[#C8922A]/80 absolute bottom-[3px]">Cart</span> -->
    </div>

    <!-- Right items -->
    {#each right as item}
      <button on:click={() => goto(item.href)} aria-label={item.label}
        class="flex flex-col items-center justify-end gap-1 w-[72px] pb-1 transition-all duration-200
          {isActive(item.href) ? 'text-[#C8922A]' : 'text-white/45 hover:text-white/75'}">
        <div class="w-6 h-6 flex items-center justify-center transition-transform duration-200 {isActive(item.href) ? 'scale-110' : ''}">
          <Icon name={item.icon} size={22} strokeWidth={isActive(item.href) ? 2.2 : 1.6} color="currentColor"/>
        </div>
        <span class="font-body text-[10px] font-700 tracking-wide leading-none">{item.label}</span>
        <div class="h-1 w-1 {isActive(item.href) ? 'rounded-full bg-[#C8922A]' : ''}"></div>
      </button>
    {/each}
  </div>
</nav>
