<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  const API = import.meta.env.PUBLIC_API_URL || '';
  let products: any[] = [], loading = true, search = '';

  onMount(async () => {
    const d = await api.get<any>('/api/products?limit=100').catch(()=>({products:[]}));
    products = d.products||[]; loading = false;
  });

  $: filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function toggle(p: any) {
    await api.patch<any>(`/api/products/${p.id}`, { isActive: !p.isActive });
    products = products.map((x: any) => x.id===p.id ? {...x, isActive:!x.isActive} : x);
    toasts.success(`Product ${p.isActive?'hidden':'activated'}`);
  }
</script>

<svelte:head><title>Products — Admin | Mango King</title></svelte:head>

<div class="mb-6 flex items-center justify-between gap-4">
  <div>
    <h1 class="font-display text-3xl text-[#1E0F06]">Products</h1>
    <p class="font-body text-sm text-[#1E0F06]/45 mt-0.5">{products.length} total</p>
  </div>
  <button on:click={() => goto('/admin/products/new')} class="btn-primary btn-sm">
    <Icon name="plus" size={15} strokeWidth={2.5} color="white"/>
    Add Product
  </button>
</div>

<div class="relative mb-6 max-w-md">
  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8922A]">
    <Icon name="search" size={16} strokeWidth={2} color="currentColor"/>
  </div>
  <input type="text" bind:value={search} placeholder="Search products…" class="input pl-11"/>
</div>

{#if loading}
  <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
{:else}
  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] overflow-hidden">
    <table class="w-full">
      <thead>
        <tr class="bg-[#FBF8F2] border-b border-[#E6D9C0]">
          {#each ['Product','Category','Price','Stock','Status',''] as h}
            <th class="text-left px-5 py-3.5 font-body font-800 text-[11px] uppercase tracking-wider text-[#1E0F06]/45">{h}</th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-[#F2EBD9]">
        {#each filtered as p}
          <tr class="hover:bg-[#FBF8F2] transition-colors">
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl overflow-hidden bg-[#F2EBD9] shrink-0">
                  {#if p.images?.[0]?.url}
                    <img src="{API}{p.images[0].url}" alt="" class="w-full h-full object-cover"/>
                  {:else}
                    <div class="w-full h-full flex items-center justify-center">
                      <img src="/logo.png" alt="" class="w-3/4 h-3/4 object-contain opacity-30 m-auto" />
                    </div>
                  {/if}
                </div>
                <div>
                  <p class="font-body font-700 text-sm text-[#1E0F06]">{p.name}</p>
                  <p class="font-body text-xs text-[#1E0F06]/40">{p.sku||'No SKU'}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-4"><span class="badge-gold badge font-body text-[10px]">{p.category?.name||'—'}</span></td>
            <td class="px-5 py-4">
              <p class="font-display text-base text-[#1E0F06]">₹{p.discountPrice||p.mrp}</p>
              {#if p.discountPrice && p.discountPrice < p.mrp}<p class="font-body text-xs text-[#1E0F06]/35 line-through">₹{p.mrp}</p>{/if}
            </td>
            <td class="px-5 py-4">
              <span class="font-body text-sm font-700 {p.stock>0?'text-[#173422]':'text-red-500'}">{p.stock>0?`${p.stock} units`:'Out of stock'}</span>
            </td>
            <td class="px-5 py-4">
              <button on:click={() => toggle(p)}
                class="relative w-11 h-6 rounded-full transition-all duration-300 {p.isActive?'bg-[#173422]':'bg-[#E6D9C0]'}">
                <div class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 {p.isActive?'left-6':'left-1'}"></div>
              </button>
            </td>
            <td class="px-5 py-4">
              <button on:click={() => goto(`/admin/products/${p.id}`)}
                class="w-9 h-9 rounded-xl bg-[#F2EBD9] hover:bg-[#C8922A]/15 text-[#C8922A] flex items-center justify-center transition-colors">
                <Icon name="edit" size={15} strokeWidth={2} color="currentColor"/>
              </button>
            </td>
          </tr>
        {:else}
          <tr><td colspan="6" class="text-center py-12">
            <div class="flex flex-col items-center gap-3">
              <Icon name="package" size={40} strokeWidth={1} color="#C8922A"/>
              <p class="font-body text-sm text-[#1E0F06]/40">No products found</p>
              <button on:click={() => goto('/admin/products/new')} class="btn-primary btn-sm">Add First Product</button>
            </div>
          </td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
