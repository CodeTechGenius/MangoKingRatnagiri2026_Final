<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ProductCard from '$lib/components/product/ProductCard.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import api from '$lib/api/client';

  let category: any = null, products: any[] = [], pagination: any = null;
  let loading = true, sort = 'latest', minPrice = '', maxPrice = '', showFilters = false;
  let currentSlug = '';

  // Reactively reload whenever the URL slug changes
  $: slug = $page.params.slug;
  $: if (slug && slug !== currentSlug) {
    currentSlug = slug;
    sort = 'latest'; minPrice = ''; maxPrice = '';
    load(slug);
  }

  async function load(s: string) {
    loading = true; category = null; products = [];
    const p = new URLSearchParams({ sort, ...(minPrice && { minPrice }), ...(maxPrice && { maxPrice }) });
    const [cat, res] = await Promise.all([
      api.get<any>(`/api/categories/${s}`).catch(() => null),
      api.get<any>(`/api/products?category=${s}&${p}`).catch(() => ({ products: [], pagination: null }))
    ]);
    category = cat; products = res.products || []; pagination = res.pagination;
    loading = false;
  }

  function applyFilters() { load(currentSlug); showFilters = false; }
  function clearFilters() { minPrice = ''; maxPrice = ''; sort = 'latest'; load(currentSlug); showFilters = false; }
</script>

<svelte:head><title>{category?.name || 'Collection'} — Mango King Ratnagiri</title></svelte:head>

<!-- Page hero -->
<div class="bg-[#1E0F06] relative overflow-hidden">
  <div class="absolute inset-0 opacity-30" style="background:radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,146,42,0.25), transparent)"></div>
  <div class="max-w-[1320px] mx-auto px-5 md:px-10 py-10 md:py-12 relative">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 font-body text-xs text-white/40 mb-4 flex-wrap">
      <button on:click={() => goto('/')} class="hover:text-[#C8922A] transition-colors">Home</button>
      <Icon name="chevronR" size={11} strokeWidth={2.5} color="currentColor"/>
      <button on:click={() => goto('/categories')} class="hover:text-[#C8922A] transition-colors">Categories</button>
      <Icon name="chevronR" size={11} strokeWidth={2.5} color="currentColor"/>
      <span class="text-white/70">{category?.name || '…'}</span>
    </div>
    <h1 class="page-title text-white">{category?.name || 'Loading…'}</h1>
    {#if category?.description}<p class="font-body text-white/50 text-sm mt-1">{category.description}</p>{/if}
    <p class="font-body text-xs text-[#C8922A]/60 mt-2 font-700">{pagination?.total || 0} Products</p>
  </div>
</div>

<div class="max-w-[1320px] mx-auto px-5 md:px-10 py-6 md:py-8">
  <!-- Sort & filter bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
    <div class="flex items-center gap-2 flex-wrap">
      {#each [['latest','Latest'],['price_asc','Price ↑'],['price_desc','Price ↓']] as [val, label]}
        <button on:click={() => { sort = val; load(currentSlug); }}
          class="px-4 py-2 rounded-xl font-body text-sm font-700 transition-all duration-200
            {sort === val
              ? 'bg-[#C8922A] text-white shadow-gold'
              : 'bg-white border border-[#E6D9C0] text-[#1E0F06] hover:border-[#C8922A]/40'}">
          {label}
        </button>
      {/each}
    </div>
    <button on:click={() => showFilters = !showFilters}
      class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E6D9C0] font-body text-sm font-700 text-[#1E0F06] hover:border-[#C8922A]/40 transition-colors {showFilters ? 'border-[#C8922A] bg-[#FBF4E6]' : ''}">
      <Icon name="filter" size={15} strokeWidth={2} color="currentColor"/>
      Filter
    </button>
  </div>

  {#if showFilters}
    <div class="bg-white rounded-2xl p-5 shadow-card border border-[#E6D9C0] mb-6 animate-slide-up">
      <div class="flex gap-4 mb-4">
        <div class="flex-1">
          <label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Min Price (₹)</label>
          <input type="number" bind:value={minPrice} class="input" placeholder="0"/>
        </div>
        <div class="flex-1">
          <label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Max Price (₹)</label>
          <input type="number" bind:value={maxPrice} class="input" placeholder="5000"/>
        </div>
      </div>
      <div class="flex gap-3">
        <button on:click={applyFilters} class="btn-primary btn-sm flex-1">Apply Filters</button>
        <button on:click={clearFilters} class="btn-ghost btn-sm flex-1">Clear</button>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {#each Array(8) as _}
        <div class="rounded-2xl overflow-hidden">
          <div class="skeleton" style="aspect-ratio:4/5"></div>
          <div class="p-4 bg-white space-y-2">
            <div class="h-4 skeleton rounded-lg w-3/4"></div>
            <div class="h-7 skeleton rounded-xl"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if products.length === 0}
    <div class="text-center py-20">
      <div class="w-20 h-20 rounded-2xl bg-[#F2EBD9] flex items-center justify-center mx-auto mb-5 overflow-hidden">
        <img src="/logo.png" alt="" class="w-3/4 h-3/4 object-contain opacity-30"/>
      </div>
      <h3 class="font-display text-2xl text-[#1E0F06] mb-2">Nothing here yet</h3>
      <p class="font-body text-sm text-[#1E0F06]/45 mb-6">Try different filters or browse other collections</p>
      <button on:click={clearFilters} class="btn-ghost btn-sm">Clear Filters</button>
    </div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {#each products as p, i}
        <div class="reveal reveal-delay-{(i%4)+1}"><ProductCard product={p}/></div>
      {/each}
    </div>

    {#if pagination?.totalPages > 1}
      <div class="flex justify-center gap-2 mt-10 flex-wrap">
        {#each Array(pagination.totalPages) as _, i}
          <button on:click={() => goto(`/categories/${currentSlug}?page=${i+1}`)}
            class="w-10 h-10 rounded-xl font-body font-700 text-sm transition-all
              {pagination.page === i+1
                ? 'bg-[#C8922A] text-white shadow-gold'
                : 'bg-white border border-[#E6D9C0] text-[#1E0F06] hover:border-[#C8922A]/40'}">
            {i+1}
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>
