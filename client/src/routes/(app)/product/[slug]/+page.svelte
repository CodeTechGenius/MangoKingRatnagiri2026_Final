<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { cart, toasts, cartDrawerOpen, wishlist } from '$lib/stores';
  import { cartApi } from '$lib/api/cart';
  import { productsApi } from '$lib/api/products';
  import ProductCard from '$lib/components/product/ProductCard.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';

  const API = import.meta.env.PUBLIC_API_URL || '';
  let product: any = null, related: any[] = [], loading = true;
  let selectedVariantId: string | null = null, qty = 1, imgIdx = 0, adding = false;

  $: imgUrl = (url: string) => url ? (url.startsWith('http') ? url : `${API}${url}`) : '';
  $: variant   = product?.variants?.find((v: any) => v.id === selectedVariantId);
  $: price     = variant?.price ?? product?.discountPrice ?? product?.mrp ?? 0;
  $: mrp       = variant?.mrp ?? product?.mrp ?? 0;
  $: disc      = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  $: inStock   = (variant?.stock ?? product?.stock ?? 0) > 0;
  $: wishlisted = $wishlist.includes(product?.id || '');

  onMount(async () => {
    try {
      const data = await productsApi.get($page.params.slug);
      product = data.product; related = data.related || [];
      selectedVariantId = product.variants?.[0]?.id || null;
    } catch { product = null; }
    loading = false;
  });

  async function addToCart() {
    if (!product || adding || !inStock) return;
    adding = true;
    cart.addItem({
      id: crypto.randomUUID(), productId: product.id, variantId: selectedVariantId,
      productName: product.name, variantLabel: variant?.label || null,
      price, mrp, quantity: qty,
      image: imgUrl(product.images?.[imgIdx]?.url || ''),
      stock: variant?.stock ?? product.stock
    });
    try { await cartApi.add(product.id, selectedVariantId, qty); } catch {}
    toasts.success('Added to cart!');
    cartDrawerOpen.set(true);
    setTimeout(() => adding = false, 600);
  }
</script>

<svelte:head><title>{product?.name || 'Product'} — Mango King Ratnagiri</title></svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div>
  </div>
{:else if !product}
  <div class="text-center py-20 px-5">
    <Icon name="package" size={52} strokeWidth={1} color="#C8922A"/>
    <h2 class="font-display text-2xl text-[#1E0F06] mt-5 mb-2">Product not found</h2>
    <button on:click={() => goto('/categories')} class="btn-primary mt-4">Browse Categories</button>
  </div>
{:else}
  <div class="max-w-[1320px] mx-auto">
    <!-- Breadcrumb -->
    <div class="px-5 md:px-10 py-4 flex items-center gap-2 font-body text-xs text-[#1E0F06]/40">
      <a href="/" class="hover:text-[#C8922A] transition-colors no-underline">Home</a>
      <Icon name="chevronR" size={11} strokeWidth={2.5} color="currentColor"/>
      <a href="/categories/{product.category?.slug}" class="hover:text-[#C8922A] transition-colors no-underline">{product.category?.name}</a>
      <Icon name="chevronR" size={11} strokeWidth={2.5} color="currentColor"/>
      <span class="text-[#1E0F06]/70 truncate max-w-[160px]">{product.name}</span>
    </div>

    <div class="md:grid md:grid-cols-2 md:gap-10 px-5 md:px-10 pb-10">
      <!-- Images -->
      <div>
        <div class="rounded-2xl overflow-hidden bg-[#F2EBD9] relative" style="aspect-ratio:1/1">
          {#if product.images?.[imgIdx]?.url}
            <img src={imgUrl(product.images[imgIdx].url)} alt={product.name} class="w-full h-full object-cover"/>
          {:else}
            <div class="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 120 150" class="w-32 h-32 opacity-15" fill="none">
                <ellipse cx="60" cy="105" rx="52" ry="42" fill="#C8922A"/>
                <path d="M60 10 C46 38 28 48 34 82 C40 110 60 128 60 128C60 128 80 110 86 82 C92 48 74 38 60 10Z" fill="#E5B858"/>
              </svg>
            </div>
          {/if}
          <!-- Wishlist button -->
          <button on:click={() => wishlist.toggle(product.id)} aria-label="{wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
            class="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover:bg-white hover:scale-110 transition-all">
            <Icon name="heart" size={18} strokeWidth={2} color="{wishlisted ? '#C94F18' : '#1E0F06'}"/>
          </button>
        </div>
        {#if product.images?.length > 1}
          <div class="flex gap-2.5 mt-3 overflow-x-auto no-scrollbar">
            {#each product.images as img, i}
              <button on:click={() => imgIdx = i} aria-label="View image {i+1}"
                class="w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all {i === imgIdx ? 'border-[#C8922A]' : 'border-transparent hover:border-[#C8922A]/40'}">
                <img src={imgUrl(img.url)} alt="" class="w-full h-full object-cover"/>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Info -->
      <div class="pt-6 md:pt-0">
        <!-- Badges -->
        <div class="flex gap-2 mb-3 flex-wrap">
          {#if product.isNewLaunch}<span class="badge badge-green font-body text-[10px]">✦ New Season</span>{/if}
          {#if product.isTrending}<span class="badge badge-orange font-body text-[10px]">↑ Trending</span>{/if}
          {#if product.isFeatured}<span class="badge badge-gold font-body text-[10px]">★ Featured</span>{/if}
        </div>

        <h1 class="font-display text-3xl md:text-4xl text-[#1E0F06] leading-tight mb-4">{product.name}</h1>

        <!-- Price -->
        <div class="flex items-baseline gap-3 mb-6">
          <span class="font-display text-4xl text-[#1E0F06]">₹{price}</span>
          {#if disc > 0}
            <span class="font-body text-xl text-[#1E0F06]/35 line-through">₹{mrp}</span>
            <span class="badge badge-green font-body font-700">{disc}% OFF</span>
          {/if}
        </div>

        <!-- Variants -->
        {#if product.variants?.length > 0}
          <div class="mb-6">
            <p class="font-body text-xs font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-3">Select Quantity</p>
            <div class="flex flex-wrap gap-2.5">
              {#each product.variants as v}
                <button on:click={() => { selectedVariantId = v.id; qty = 1; }} disabled={v.stock <= 0}
                  class="px-5 py-3 rounded-xl border-2 font-body text-sm font-700 transition-all disabled:opacity-40
                    {selectedVariantId === v.id ? 'border-[#C8922A] bg-[#FBF4E6] text-[#C8922A]' : 'border-[#E6D9C0] text-[#1E0F06] hover:border-[#C8922A]/40'}">
                  {v.label}
                  <span class="block text-xs font-500 {selectedVariantId === v.id ? 'text-[#956A18]' : 'text-[#1E0F06]/40'} mt-0.5">₹{v.price}</span>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Qty + stock -->
        <div class="flex items-center gap-4 mb-7">
          <div class="flex items-center gap-2 bg-[#F2EBD9] rounded-xl p-1">
            <button on:click={() => qty = Math.max(1, qty - 1)} aria-label="Decrease quantity"
              class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-[#FBF4E6] transition-colors">
              <Icon name="minus" size={16} strokeWidth={2.5} color="#1E0F06"/>
            </button>
            <span class="w-10 text-center font-body font-800 text-lg text-[#1E0F06]">{qty}</span>
            <button on:click={() => qty = Math.min(qty + 1, variant?.stock ?? product.stock)} aria-label="Increase quantity"
              class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-[#FBF4E6] transition-colors">
              <Icon name="plus" size={16} strokeWidth={2.5} color="#1E0F06"/>
            </button>
          </div>
          <span class="font-body text-sm font-700 {inStock ? 'text-[#173422]' : 'text-red-500'}">
            {inStock ? `✓ In stock (${variant?.stock ?? product.stock})` : '✗ Out of stock'}
          </span>
        </div>

        <!-- Add to cart -->
        <div class="flex gap-3 mb-7">
          <button on:click={addToCart} disabled={!inStock || adding}
            class="flex-1 btn-primary py-4 text-base">
            {#if adding}
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>
              Adding…
            {:else}
              <Icon name="cart" size={18} strokeWidth={2} color="white"/>
              Add to Cart
            {/if}
          </button>
          <button on:click={() => wishlist.toggle(product.id)} aria-label="Wishlist"
            class="w-14 h-14 rounded-xl border-2 border-[#E6D9C0] hover:border-[#C8922A]/40 hover:bg-[#FBF4E6] flex items-center justify-center transition-all">
            <Icon name="heart" size={22} strokeWidth={2} color="{wishlisted ? '#C94F18' : '#1E0F06'}"/>
          </button>
        </div>

        <!-- Description -->
        {#if product.description}
          <div class="bg-[#F2EBD9] rounded-2xl p-5">
            <h3 class="font-body font-800 text-sm text-[#1E0F06] uppercase tracking-wider mb-2.5">About this product</h3>
            <p class="font-body text-sm text-[#1E0F06]/65 leading-relaxed">{product.description}</p>
          </div>
        {/if}

        <!-- Trust badges -->
        <div class="grid grid-cols-3 gap-3 mt-5">
          {#each [['truck','Free Delivery\nabove ₹500'],['checkCircle','100%\nNatural'],['lock','Secure\nPayment']] as [icon, label]}
            <div class="bg-white rounded-xl p-3 text-center border border-[#E6D9C0]">
              <div class="flex justify-center mb-1.5">
                <Icon name={icon} size={18} strokeWidth={1.8} color="#C8922A"/>
              </div>
              <p class="font-body text-[10px] font-700 text-[#1E0F06]/55 leading-tight whitespace-pre-line">{label}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Related products -->
    {#if related.length > 0}
      <div class="px-5 md:px-10 pb-12">
        <h2 class="font-display text-2xl text-[#1E0F06] mb-6">You May Also Like</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
          {#each related.slice(0, 4) as p}<ProductCard product={p}/>{/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
