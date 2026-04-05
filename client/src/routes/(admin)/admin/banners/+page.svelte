<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  const API = import.meta.env.PUBLIC_API_URL || '';
  let banners: any[] = [], loading = true;

  onMount(async () => { banners = await api.get<any[]>('/api/banners/all').catch(()=>[]); loading=false; });

  async function toggle(b: any) {
    await api.patch<any>(`/api/banners/${b.id}`, { isActive: !b.isActive });
    banners = banners.map(x => x.id===b.id ? {...x, isActive:!x.isActive} : x);
    toasts.success(`Banner ${b.isActive?'hidden':'published'}`);
  }

  async function del(id: string) {
    if (!confirm('Delete this banner?')) return;
    await api.delete<any>(`/api/banners/${id}`);
    banners = banners.filter(b => b.id!==id); toasts.success('Deleted');
  }
</script>

<svelte:head><title>Banners — Admin | Mango King</title></svelte:head>
<div class="mb-6 flex items-center justify-between">
  <div><h1 class="font-display text-3xl text-[#1E0F06]">Banners</h1><p class="font-body text-sm text-[#1E0F06]/45 mt-0.5">Homepage hero carousel</p></div>
  <button on:click={() => goto('/admin/banners/new')} class="btn-primary btn-sm">
    <Icon name="plus" size={15} strokeWidth={2.5} color="white"/> Add Banner
  </button>
</div>

{#if loading}
  <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
{:else if banners.length === 0}
  <div class="bg-white rounded-2xl p-12 text-center shadow-card border border-[#E6D9C0]">
    <Icon name="banner" size={48} strokeWidth={1} color="#C8922A"/>
    <p class="font-display text-xl text-[#1E0F06] mt-4 mb-5">No banners yet</p>
    <button on:click={() => goto('/admin/banners/new')} class="btn-primary btn-sm">Add First Banner</button>
  </div>
{:else}
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each banners as b}
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] overflow-hidden">
        <div class="relative aspect-video bg-[#F2EBD9]">
          <img src="{b.image?.startsWith('http') ? b.image : API + b.image}" alt={b.title||'Banner'} class="w-full h-full object-cover"/>
          <div class="absolute top-2 left-2">
            <span class="badge font-body text-[10px] {b.isActive ? 'bg-green-500 text-white border-0' : 'bg-[#1E0F06]/70 text-white border-0'}">{b.isActive?'Live':'Hidden'}</span>
          </div>
        </div>
        <div class="p-4">
          {#if b.title}<h3 class="font-body font-800 text-sm text-[#1E0F06] truncate">{b.title}</h3>{/if}
          {#if b.subtitle}<p class="font-body text-xs text-[#1E0F06]/45 truncate mt-0.5">{b.subtitle}</p>{/if}
          <div class="flex items-center gap-2 mt-3">
            <button on:click={() => toggle(b)}
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-body text-xs font-700 transition-colors {b.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}">
              <Icon name={b.isActive ? 'eye' : 'checkCircle'} size={13} strokeWidth={2} color="currentColor"/>
              {b.isActive ? 'Hide' : 'Publish'}
            </button>
            <button on:click={() => del(b.id)}
              class="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
              <Icon name="trash" size={15} strokeWidth={2} color="#ef4444"/>
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}
