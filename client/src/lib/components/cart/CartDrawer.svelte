<script lang="ts">
  import { cart, cartCount, cartTotal, cartSavings, cartDrawerOpen, toasts } from '$lib/stores';
  import { cartApi } from '$lib/api/cart';
  import { goto } from '$app/navigation';
  import { fly, fade } from 'svelte/transition';

  const API = import.meta.env.PUBLIC_API_URL || '';
  const imgSrc = (url: string) => url ? (url.startsWith('http') ? url : `${API}${url}`) : '';

  async function updateQty(item: any, delta: number) {
    const q = item.quantity + delta;
    if (q <= 0) {
      cart.removeItem(item.productId, item.variantId);
      await cartApi.remove(item.id).catch(() => {});
    } else if (q <= item.stock) {
      cart.updateQuantity(item.productId, item.variantId, q);
      await cartApi.update(item.id, q).catch(() => {});
    }
  }

  function handleBackdropKey(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      cartDrawerOpen.set(false);
    }
  }
</script>

{#if $cartDrawerOpen}
  <!-- Backdrop — button is the correct element for click-to-close -->
  <button
    class="fixed inset-0 bg-[#1E0F06]/60 backdrop-blur-[6px] z-50 cursor-default w-full border-none"
    aria-label="Close cart"
    on:click={() => cartDrawerOpen.set(false)}
    transition:fade={{ duration: 300 }}>
  </button>

  <!-- Drawer -->
  <aside
    aria-label="Shopping cart"
    class="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-[#FBF8F2] z-50 flex flex-col"
    transition:fly={{ x: 400, duration: 380, easing: (t) => 1 - Math.pow(1-t,3) }}>

    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-5 border-b border-[#E6D9C0]">
      <div>
        <h2 class="font-serif text-2xl text-[#1E0F06] leading-none">Your Basket</h2>
        {#if $cartCount > 0}
          <p class="font-sans text-xs text-[#1E0F06]/40 mt-1">{$cartCount} item{$cartCount!==1?'s':''}</p>
        {/if}
      </div>
      <button
        on:click={() => cartDrawerOpen.set(false)}
        aria-label="Close cart"
        class="w-9 h-9 rounded-full bg-[#F2EBD9] hover:bg-[#E6D9C0] flex items-center justify-center transition-colors">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1E0F06" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Items -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      {#if $cart.length === 0}
        <div class="flex flex-col items-center justify-center h-full gap-5 px-8 py-16 text-center">
          <div class="w-20 h-20 rounded-full bg-[#F2EBD9] flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#C8922A" stroke-width="1.4" opacity="0.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path stroke-linecap="round" d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div>
            <h3 class="font-serif text-2xl text-[#1E0F06] mb-1">Empty Basket</h3>
            <p class="font-sans text-sm text-[#1E0F06]/45">Discover our premium mangoes</p>
          </div>
          <button
            on:click={() => { cartDrawerOpen.set(false); goto('/categories'); }}
            class="inline-flex items-center justify-content: center gap-2 px-7 py-3.5 rounded-full bg-[#C8922A] text-white font-sans text-[13px] font-500 tracking-wider uppercase shadow-gold hover:bg-[#956A18] transition-all">
            Browse Collection
          </button>
        </div>
      {:else}
        <div class="divide-y divide-[#E6D9C0]">
          {#each $cart as item (item.productId + (item.variantId||''))}
            <div class="flex gap-4 px-6 py-5">
              <div class="w-[68px] h-[68px] rounded-xl overflow-hidden bg-[#F2EBD9] shrink-0">
                {#if item.image}
                  <img src={imgSrc(item.image)} alt={item.productName} class="w-full h-full object-cover"/>
                {:else}
                  <div class="w-full h-full flex items-center justify-center">
                    <img src="/logo.png" alt="Mango King" width="28" height="28" class="object-contain w-full h-full" style="display:block;" />
                  </div>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-sans font-500 text-sm text-[#1E0F06] line-clamp-2 leading-snug">{item.productName}</p>
                {#if item.variantLabel}<p class="font-sans text-xs text-[#1E0F06]/40 mt-0.5">{item.variantLabel}</p>{/if}
                <div class="flex items-center justify-between mt-3">
                  <div class="flex items-baseline gap-1.5">
                    <span class="font-serif text-lg text-[#1E0F06]">₹{item.price}</span>
                    {#if item.mrp > item.price}<span class="font-sans text-xs text-[#1E0F06]/30 line-through">₹{item.mrp}</span>{/if}
                  </div>
                  <!-- Qty control -->
                  <div class="flex items-center gap-1 bg-[#F2EBD9] rounded-full p-1">
                    <button
                      on:click={() => updateQty(item, -1)}
                      aria-label="Remove one {item.productName}"
                      class="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-[#E6D9C0] shadow-soft transition-colors">
                      {#if item.quantity === 1}
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#C94F18" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                      {:else}
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#1E0F06" stroke-width="2.5"><path d="M5 12h14"/></svg>
                      {/if}
                    </button>
                    <span class="w-6 text-center font-sans font-500 text-sm text-[#1E0F06]">{item.quantity}</span>
                    <button
                      on:click={() => updateQty(item, 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Add one more {item.productName}"
                      class="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-[#E6D9C0] shadow-soft transition-colors disabled:opacity-30">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#1E0F06" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if $cartSavings > 0}
          <div class="mx-6 mb-2 bg-[#173422]/6 border border-[#173422]/15 rounded-xl px-4 py-2.5 flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#173422" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <p class="font-sans text-[12.5px] text-[#173422]">You save <strong>₹{$cartSavings.toFixed(0)}</strong> on this order</p>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Footer -->
    {#if $cart.length > 0}
      <div class="border-t border-[#E6D9C0] px-6 pt-5 pb-6 space-y-4 bg-white">
        <div class="space-y-2">
          <div class="flex justify-between font-sans text-sm text-[#1E0F06]/55"><span>Subtotal</span><span>₹{$cartTotal.toFixed(0)}</span></div>
          <div class="flex justify-between font-sans text-sm text-[#1E0F06]/55">
            <span>Shipping</span>
            <span class="{$cartTotal >= 500 ? 'text-[#173422] font-500' : ''}">{$cartTotal >= 500 ? 'Free' : '₹60'}</span>
          </div>
          {#if $cartTotal < 500}
            <p class="font-sans text-[11.5px] text-[#C8922A] bg-[#FBF4E6] rounded-lg px-3 py-1.5">Add ₹{(500-$cartTotal).toFixed(0)} more for free delivery</p>
          {/if}
          <div class="flex justify-between pt-2 border-t border-[#E6D9C0]">
            <span class="font-serif text-lg text-[#1E0F06]">Total</span>
            <span class="font-serif text-xl text-[#1E0F06]">₹{($cartTotal + ($cartTotal >= 500 ? 0 : 60)).toFixed(0)}</span>
          </div>
        </div>
        <button
          on:click={() => { cartDrawerOpen.set(false); goto('/checkout'); }}
          class="inline-flex w-full items-center justify-center gap-2 py-4 rounded-full bg-[#C8922A] text-white font-sans text-[13px] font-500 tracking-wider uppercase shadow-gold hover:bg-[#956A18] transition-all duration-300">
          Proceed to Checkout
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <p class="text-center font-sans text-[11px] text-[#1E0F06]/30 flex items-center justify-center gap-1.5">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Secured by Razorpay
        </p>
      </div>
    {/if}
  </aside>
{/if}
