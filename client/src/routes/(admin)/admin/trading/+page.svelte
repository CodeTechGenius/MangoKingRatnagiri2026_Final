<script lang="ts">
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let prices: any[] = [], loading = true, adding = false, saving = false;
  const varieties = ['Alphonso','Kesar','Dasheri','Langra','Hapus','Totapuri'];
  let form = { date: new Date().toISOString().split('T')[0], variety:'Alphonso', minPrice:'', maxPrice:'', avgPrice:'', unit:'kg', notes:'' };

  onMount(async () => { prices = await api.get<any[]>('/api/trading?limit=100').catch(()=>[]); loading=false; });

  async function add() {
    if (!form.variety || !form.avgPrice) { toasts.error('Variety and avg price required'); return; }
    saving = true;
    try {
      const avg = parseFloat(form.avgPrice);
      const p = await api.post<any>('/api/trading', { ...form, minPrice: parseFloat(form.minPrice)||Math.round(avg*0.9), maxPrice: parseFloat(form.maxPrice)||Math.round(avg*1.1), avgPrice: avg });
      prices = [p, ...prices];
      toasts.success('Rate added!');
      form = { date: new Date().toISOString().split('T')[0], variety:'Alphonso', minPrice:'', maxPrice:'', avgPrice:'', unit:'kg', notes:'' };
      adding = false;
    } catch (e: any) { toasts.error(e.message||'Failed'); }
    saving = false;
  }

  async function del(id: string) {
    if (!confirm('Delete this entry?')) return;
    await api.delete<any>(`/api/trading/${id}`);
    prices = prices.filter(p => p.id!==id); toasts.success('Deleted');
  }
</script>

<svelte:head><title>Trading Prices — Admin | Mango King</title></svelte:head>
<div class="mb-6 flex items-center justify-between">
  <div><h1 class="font-display text-3xl text-[#1E0F06]">Trading Prices</h1><p class="font-body text-sm text-[#1E0F06]/45 mt-0.5">Daily market rates</p></div>
  <button on:click={() => adding=!adding} class="btn-primary btn-sm">
    <Icon name="plus" size={15} strokeWidth={2.5} color="white"/> Add Rate
  </button>
</div>

{#if adding}
  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6 mb-6 animate-slide-up max-w-2xl">
    <h2 class="font-body font-800 text-[#1E0F06] mb-4">Add Price Entry</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Date</label><input type="date" bind:value={form.date} class="input"/></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Variety</label><select bind:value={form.variety} class="input">{#each varieties as v}<option value={v}>{v}</option>{/each}</select></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Unit</label><select bind:value={form.unit} class="input"><option value="kg">kg</option><option value="dozen">dozen</option></select></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Min Price (₹)</label><input type="number" bind:value={form.minPrice} class="input" placeholder="350"/></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Avg Price (₹) *</label><input type="number" bind:value={form.avgPrice} class="input" placeholder="400"/></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Max Price (₹)</label><input type="number" bind:value={form.maxPrice} class="input" placeholder="450"/></div>
      <div class="col-span-full"><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Notes</label><input type="text" bind:value={form.notes} class="input" placeholder="Market conditions…"/></div>
    </div>
    <div class="flex gap-3">
      <button on:click={add} disabled={saving} class="btn-primary btn-sm flex items-center gap-2">
        {#if saving}<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>{/if}
        Save Entry
      </button>
      <button on:click={() => adding=false} class="btn-ghost btn-sm">Cancel</button>
    </div>
  </div>
{/if}

{#if loading}
  <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
{:else}
  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] overflow-hidden">
    <table class="w-full">
      <thead><tr class="bg-[#FBF8F2] border-b border-[#E6D9C0]">
        {#each ['Date','Variety','Min','Avg','Max','Unit',''] as h}
          <th class="text-left px-5 py-3.5 font-body font-800 text-[11px] uppercase tracking-wider text-[#1E0F06]/45">{h}</th>
        {/each}
      </tr></thead>
      <tbody class="divide-y divide-[#F2EBD9]">
        {#each prices as p}
          <tr class="hover:bg-[#FBF8F2] transition-colors">
            <td class="px-5 py-3.5 font-body font-700 text-sm text-[#1E0F06]">{new Date(p.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</td>
            <td class="px-5 py-3.5"><span class="badge badge-gold font-body text-[10px]">{p.variety}</span></td>
            <td class="px-5 py-3.5 font-body font-700 text-sm text-[#173422]">₹{p.minPrice}</td>
            <td class="px-5 py-3.5 font-display text-lg text-[#1E0F06]">₹{p.avgPrice}</td>
            <td class="px-5 py-3.5 font-body font-700 text-sm text-[#C94F18]">₹{p.maxPrice}</td>
            <td class="px-5 py-3.5 font-body text-xs text-[#1E0F06]/45">{p.unit}</td>
            <td class="px-5 py-3.5">
              <button on:click={() => del(p.id)} class="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                <Icon name="trash" size={14} strokeWidth={2} color="#ef4444"/>
              </button>
            </td>
          </tr>
        {:else}
          <tr><td colspan="7" class="text-center py-10 font-body text-sm text-[#1E0F06]/40">No price entries yet</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
