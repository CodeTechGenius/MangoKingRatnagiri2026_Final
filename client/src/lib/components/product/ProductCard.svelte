<script lang="ts">
  import { goto } from '$app/navigation';
  import { cart, toasts, cartDrawerOpen, wishlist } from '$lib/stores';
  import { cartApi } from '$lib/api/cart';

  export let product: any;
  export let badge: string | null = null;
  export let badgeColor: 'gold' | 'green' | 'red' = 'gold';

  const API = import.meta.env.PUBLIC_API_URL || '';
  let adding = false, imgEl: HTMLImageElement;

  $: img    = product.images?.[0]?.url || '';
  $: imgUrl = img.startsWith('http') ? img : img ? `${API}${img}` : '';
  $: v      = product.variants?.[0];
  $: price  = v?.price ?? product.discountPrice ?? product.mrp;
  $: mrp    = v?.mrp ?? product.mrp;
  $: disc   = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  $: stock  = (v?.stock ?? product.stock) > 0;
  $: liked  = $wishlist.includes(product.id);

  function fly() {
    if (!imgEl) return;
    const ir = imgEl.getBoundingClientRect();
    const btn = document.querySelector('[aria-label="Cart"],[aria-label="Open cart"]');
    if (!btn) return;
    const cr = btn.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'fly-clone';
    el.style.cssText = `left:${ir.left+ir.width/2-20}px;top:${ir.top+ir.height/2-20}px;width:40px;height:40px;background:radial-gradient(circle,#E5B858,#C8922A);--dx:${cr.left+cr.width/2-(ir.left+ir.width/2)}px;--dy:${cr.top+cr.height/2-(ir.top+ir.height/2)}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }

  async function addCart(e: MouseEvent) {
    e.stopPropagation();
    if (adding || !stock) return;
    adding = true; fly();
    cart.addItem({ id: crypto.randomUUID(), productId: product.id, variantId: v?.id||null, productName: product.name, variantLabel: v?.label||null, price, mrp, quantity: 1, image: imgUrl, stock: v?.stock ?? product.stock });
    try { await cartApi.add(product.id, v?.id||null, 1); } catch {}
    toasts.success(`Added to cart`);
    setTimeout(() => adding = false, 700);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') goto(`/product/${product.slug}`);
  }
</script>

<!-- Use div instead of article with role=button (fixes A11y warning) -->
<div class="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-soft transition-all duration-350 hover:shadow-elevated hover:-translate-y-[3px] will-change-transform"
  on:click={() => goto(`/product/${product.slug}`)}
  on:keydown={handleKeydown}
  role="button"
  tabindex="0"
  aria-label="View {product.name}">

  <!-- Image zone -->
  <div class="relative overflow-hidden bg-[#F2EBD9]" style="aspect-ratio:4/5">
    {#if imgUrl}
      <img bind:this={imgEl} src={imgUrl} alt={product.name}
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07] will-change-transform" loading="lazy"/>
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <img src="/logo.png" alt="Mango King Logo" class="w-16 h-16 opacity-20 object-contain" />
      </div>
    {/if}

    <!-- Hover overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-[#1E0F06]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

    <!-- Badge -->
    {#if badge}
      <div class="absolute top-3 left-3 z-10">
        <span class="font-sans text-[10px] font-500 px-2.5 py-1 rounded-full border
          {badgeColor==='green' ? 'bg-[#173422]/10 text-[#173422] border-[#173422]/20' :
           badgeColor==='red'   ? 'bg-[#C94F18]/10 text-[#C94F18] border-[#C94F18]/20' :
                                  'bg-[#C8922A]/10 text-[#956A18] border-[#C8922A]/25'}">
          {badge}
        </span>
      </div>
    {/if}

    <!-- Out of stock -->
    {#if !stock}
      <div class="absolute inset-0 bg-[#1E0F06]/55 backdrop-blur-[2px] flex items-center justify-center z-10">
        <span class="font-sans text-xs font-500 text-white tracking-wider2 uppercase bg-white/12 border border-white/20 px-4 py-2 rounded-full">Sold Out</span>
      </div>
    {/if}

    <!-- Wishlist -->
    <button
      on:click|stopPropagation={() => wishlist.toggle(product.id)}
      aria-label="{liked ? 'Remove from wishlist' : 'Add to wishlist'}"
      class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center
        opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-soft hover:scale-110">
      <svg viewBox="0 0 24 24" width="15" height="15"
        fill="{liked ? '#C94F18' : 'none'}" stroke="{liked ? '#C94F18' : '#1E0F06'}" stroke-width="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    </button>

    <!-- Quick Add -->
    <div class="absolute bottom-0 left-0 right-0 p-3 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.34,1.1,0.64,1)]">
      <button
        on:click={addCart}
        disabled={!stock || adding}
        aria-label="Add {product.name} to cart"
        class="w-full bg-[#C8922A] hover:bg-[#956A18] text-white font-sans text-[12px] font-500 tracking-wider2 uppercase py-2.5 rounded-xl shadow-gold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
        {#if adding}
          <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" stroke-opacity="0.3" stroke-width="3"/>
            <path d="M12 2a10 10 0 0110 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
          </svg>
          Adding…
        {:else}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Add to Cart
        {/if}
      </button>
    </div>
  </div>

  <!-- Info -->
  <div class="p-4 pb-5">
    {#if product.variants?.length > 1}
      <div class="flex gap-1.5 mb-2.5 flex-wrap">
        {#each product.variants.slice(0, 3) as vv}
          <span class="font-sans text-[10.5px] font-500 text-[#956A18] bg-[#FBF4E6] border border-[#C8922A]/20 rounded-md px-2 py-0.5">{vv.label}</span>
        {/each}
      </div>
    {/if}

    <h3 class="font-sans font-400 text-[#1E0F06] text-sm leading-snug line-clamp-2 mb-3">{product.name}</h3>

    <div class="flex items-center justify-between">
      <div class="flex items-baseline gap-2">
        <span class="font-serif text-xl text-[#1E0F06] leading-none">₹{price}</span>
        {#if disc > 0}
          <span class="font-sans text-xs text-[#1E0F06]/35 line-through">₹{mrp}</span>
          <span class="font-sans text-[10px] font-500 text-[#173422] bg-[#173422]/8 px-1.5 py-0.5 rounded-md">{disc}% off</span>
        {/if}
      </div>
      <span class="w-2 h-2 rounded-full {stock ? 'bg-[#173422]' : 'bg-[#1E0F06]/15'}"></span>
    </div>
  </div>
</div>
