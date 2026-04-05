<script lang="ts">
  import { onMount } from 'svelte';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let today: any[] = [], history: any[] = [], varieties: string[] = [], selected = '', loading = true;

  onMount(async () => {
    const [t, h] = await Promise.all([
      api.get<any[]>('/api/trading/today').catch(() => []),
      api.get<any[]>('/api/trading?limit=200').catch(() => [])
    ]);
    today = Array.isArray(t) ? t : [];
    history = Array.isArray(h) ? h : [];
    varieties = [...new Set(history.map((p: any) => p.variety))] as string[];
    selected = varieties[0] || '';
    loading = false;
  });

  $: filtered = history.filter(p => p.variety === selected).slice(0, 30).reverse();
  $: maxP = Math.max(...filtered.map(p => p.avgPrice), 1);
</script>

<svelte:head><title>Mango Market Prices — Mango King Ratnagiri</title></svelte:head>

<!-- Hero -->
<div class="bg-[#1E0F06] relative overflow-hidden">
  <div class="absolute inset-0 opacity-30" style="background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,146,42,0.25), transparent)"></div>
  <div class="max-w-[1320px] mx-auto px-5 md:px-10 py-14 relative">
    <p class="label-tag mb-3" style="justify-content:flex-start">Live Market Data</p>
    <h1 class="page-title text-white mb-2">Mango Trading Prices</h1>
    <p class="font-body text-white/50 text-base">Daily wholesale rates from Ratnagiri market</p>
  </div>
</div>

<div class="max-w-[1320px] mx-auto px-5 md:px-10 py-10">
  {#if loading}
    <div class="flex justify-center py-16"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
  {:else}
    <!-- Today's prices -->
    {#if today.length > 0}
      <div class="mb-10">
        <h2 class="font-display text-2xl text-[#1E0F06] mb-6">Today's Rates</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {#each today as price}
            <div class="bg-white rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-display text-xl text-[#1E0F06]">{price.variety}</h3>
                  <p class="font-body text-xs text-[#1E0F06]/40 mt-0.5">per {price.unit}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#C8922A]/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path d="M12 3C10 7 7 9 8 13C9 16 12 18 12 18C12 18 15 16 16 13C17 9 14 7 12 3Z" fill="#C8922A" opacity="0.8"/>
                  </svg>
                </div>
              </div>
              <div class="flex items-end gap-2 mb-4">
                <span class="font-display text-3xl text-[#1E0F06]">₹{price.avgPrice}</span>
                <span class="font-body text-sm text-[#1E0F06]/40 mb-1">avg</span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-[#F2EBD9] rounded-xl p-3 text-center">
                  <p class="font-display text-lg text-[#173422]">₹{price.minPrice}</p>
                  <p class="font-body text-[10px] text-[#1E0F06]/40 uppercase tracking-wider mt-0.5">Min</p>
                </div>
                <div class="bg-[#F2EBD9] rounded-xl p-3 text-center">
                  <p class="font-display text-lg text-[#C94F18]">₹{price.maxPrice}</p>
                  <p class="font-body text-[10px] text-[#1E0F06]/40 uppercase tracking-wider mt-0.5">Max</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Price history chart -->
    {#if varieties.length > 0}
      <div class="bg-white rounded-2xl shadow-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-display text-xl text-[#1E0F06]">Price History</h2>
          <select bind:value={selected}
            class="input font-body text-sm py-2 px-4 w-auto border border-[#E6D9C0] rounded-xl">
            {#each varieties as v}<option value={v}>{v}</option>{/each}
          </select>
        </div>
        {#if filtered.length > 0}
          <div class="flex items-end gap-1 h-40 mb-3">
            {#each filtered as row}
              <div class="flex-1 flex flex-col items-center gap-0.5 group relative">
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1E0F06] text-white text-[10px] rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-body">₹{row.avgPrice}</div>
                <div class="w-full rounded-t-lg bg-gradient-to-t from-[#C8922A] to-[#E5B858] transition-all duration-300 group-hover:from-[#956A18]"
                  style="height:{(row.avgPrice/maxP)*100}%"></div>
              </div>
            {/each}
          </div>
          <div class="flex justify-between font-body text-[10px] text-[#1E0F06]/30">
            <span>{new Date(filtered[0]?.date).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</span>
            <span>{new Date(filtered[filtered.length-1]?.date).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</span>
          </div>
        {/if}
      </div>
    {/if}

    <!-- CTA -->
    <div class="mt-10 bg-[#1E0F06] rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
      <div class="absolute inset-0 opacity-20" style="background:radial-gradient(ellipse at 100% 50%, rgba(200,146,42,0.4), transparent 60%)"></div>
      <div class="relative">
        <h3 class="font-display text-2xl text-white mb-1">Need bulk quantity?</h3>
        <p class="font-body text-white/50 text-sm">Special wholesale rates for 100kg+ orders. Connect with us on WhatsApp.</p>
      </div>
      <a href="https://wa.me/919999999999?text=Hi, I need bulk mango inquiry" target="_blank"
        class="btn-primary relative shrink-0">
        <Icon name="whatsapp" size={18} strokeWidth={0} color="white"/>
        Enquire Now
      </a>
    </div>
  {/if}
</div>
