<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let categories: any[] = [], loading = true;
  onMount(async () => {
    categories = await api.get<any[]>('/api/categories').catch(() => []);
    loading = false;
  });
</script>

<svelte:head><title>All Categories — Mango King Ratnagiri</title></svelte:head>

<!-- Page hero -->
<div class="bg-[#1E0F06] relative overflow-hidden">
  <div class="absolute inset-0 opacity-30" style="background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,146,42,0.25), transparent)"></div>
  <div class="max-w-[1320px] mx-auto px-5 md:px-10 py-14 relative">
    <div class="flex items-center gap-2 font-body text-xs text-white/40 mb-4">
      <a href="/" class="hover:text-[#C8922A] transition-colors no-underline">Home</a>
      <Icon name="chevronR" size={12} strokeWidth={2.5} color="currentColor"/>
      <span class="text-white/70">Categories</span>
    </div>
    <p class="label-tag mb-3 text-[#C8922A]" style="justify-content:flex-start">Our Collections</p>
    <h1 class="page-title text-white">Browse All Categories</h1>
  </div>
</div>

<div class="max-w-[1320px] mx-auto px-5 md:px-10 py-12">
  {#if loading}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      {#each Array(4) as _}
        <div class="skeleton rounded-2xl" style="aspect-ratio:3/4"></div>
      {/each}
    </div>
  {:else if categories.length === 0}
    <div class="text-center py-20">
      <Icon name="grid" size={48} strokeWidth={1} color="#C8922A" />
      <p class="font-display text-2xl text-[#1E0F06] mt-4">No categories yet</p>
    </div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {#each categories as cat, i}
        <button on:click={() => goto(`/categories/${cat.slug}`)}
          class="group relative rounded-2xl overflow-hidden bg-[#1E0F06] card-hover reveal reveal-delay-{(i%4)+1}"
          style="aspect-ratio:3/4">
          <!-- Gradient bg -->
          <div class="absolute inset-0 bg-gradient-to-br from-[#2C1810] to-[#0D1A12] group-hover:from-[#3D2015] transition-all duration-500"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-[#C8922A]/10 blur-2xl group-hover:bg-[#C8922A]/20 transition-all duration-500"></div>
          <!-- Mango art -->
          <div class="absolute inset-0 flex items-center justify-center opacity-12 group-hover:opacity-20 transition-opacity duration-500">
            <img src="/logo.png" alt="Mango King Logo" class="w-16 h-16 opacity-20 object-contain" />
          </div>
          <!-- Text -->
          <div class="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 text-center">
            <h3 class="font-display text-xl md:text-2xl text-white leading-tight mb-1">{cat.name}</h3>
            {#if cat.description}<p class="font-body text-[11px] text-white/45 line-clamp-1 mb-3">{cat.description}</p>{/if}
            <span class="flex items-center gap-1.5 font-body text-[11px] font-700 text-[#C8922A] tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              Shop Now <Icon name="forward" size={12} strokeWidth={2.5} color="currentColor"/>
            </span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
