<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ProductCard from '$lib/components/product/ProductCard.svelte';
  import { productsApi } from '$lib/api/products';
  import Icon from '$lib/components/ui/Icon.svelte';

  function debounce<T extends (...a: any[]) => any>(fn: T, ms: number) {
    let t: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  let q = '', results: any[] = [], loading = false, inputEl: HTMLInputElement;
  const popular = ['Alphonso Mango', 'Aamras', 'Gift Box', 'Kesar Mango', 'Mango Pickle'];

  const doSearch = debounce(async (query: string) => {
    if (!query.trim()) { results = []; loading = false; return; }
    loading = true;
    const data = await productsApi.list({ q: query, limit: '20' }).catch(() => ({ products: [] }));
    results = data.products || [];
    loading = false;
  }, 350);

  onMount(() => {
    q = $page.url.searchParams.get('q') || '';
    if (q) doSearch(q);
    setTimeout(() => inputEl?.focus(), 100);
  });

  $: doSearch(q);
</script>

<svelte:head><title>{q ? `"${q}" — Search` : 'Search'} — Mango King Ratnagiri</title></svelte:head>

<div class="max-w-[1320px] mx-auto px-5 md:px-10 py-8">
  <!-- Search bar -->
  <div class="relative max-w-2xl mx-auto mb-10">
    <div class="absolute left-5 top-1/2 -translate-y-1/2 text-[#C8922A]">
      <Icon name="search" size={20} strokeWidth={2} color="currentColor"/>
    </div>
    <input bind:this={inputEl} bind:value={q}
      on:input={() => goto(`/search?q=${encodeURIComponent(q)}`, { replaceState: true })}
      type="text" placeholder="Search mangoes, products, gifts…"
      class="w-full pl-14 pr-14 py-4.5 bg-white border-2 border-[#E6D9C0] focus:border-[#C8922A] rounded-2xl font-body text-base text-[#1E0F06] placeholder-[#1E0F06]/30 outline-none transition-all shadow-soft"
      style="padding-top:16px;padding-bottom:16px" />
    {#if q}
      <button on:click={() => { q = ''; results = []; }} aria-label="Clear search"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F2EBD9] hover:bg-[#E6D9C0] flex items-center justify-center transition-colors">
        <Icon name="close" size={14} strokeWidth={2.5} color="#1E0F06"/>
      </button>
    {/if}
  </div>

  {#if !q}
    <!-- Popular -->
    <div class="text-center mb-6">
      <p class="font-body text-sm font-700 text-[#1E0F06]/50 uppercase tracking-wider mb-4">Popular Searches</p>
      <div class="flex flex-wrap justify-center gap-2.5">
        {#each popular as term}
          <button on:click={() => q = term}
            class="px-5 py-2.5 bg-white border-2 border-[#E6D9C0] hover:border-[#C8922A] hover:bg-[#FBF4E6] rounded-full font-body text-sm font-600 text-[#1E0F06] hover:text-[#C8922A] transition-all shadow-soft">
            {term}
          </button>
        {/each}
      </div>
    </div>

  {:else if loading}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {#each Array(8) as _}
        <div class="rounded-2xl overflow-hidden">
          <div class="skeleton" style="aspect-ratio:4/5"></div>
          <div class="p-4 bg-white space-y-2"><div class="h-4 skeleton rounded-lg w-3/4"></div><div class="h-7 skeleton rounded-xl mt-2"></div></div>
        </div>
      {/each}
    </div>

  {:else if results.length === 0}
    <div class="text-center py-20">
      <Icon name="search" size={52} strokeWidth={1} color="#C8922A" />
      <h2 class="font-display text-2xl text-[#1E0F06] mt-5 mb-2">No results for "{q}"</h2>
      <p class="font-body text-[#1E0F06]/50 mb-6">Try different keywords or browse our categories</p>
      <button on:click={() => goto('/categories')} class="btn-primary btn-sm">Browse Categories</button>
    </div>

  {:else}
    <p class="font-body text-sm text-[#1E0F06]/50 mb-6 text-center">
      <strong class="text-[#1E0F06]">{results.length}</strong> results for "<span class="text-[#C8922A]">{q}</span>"
    </p>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {#each results as product}<ProductCard {product}/>{/each}
    </div>
  {/if}
</div>
