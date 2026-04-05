<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let orders: any[] = [], loading = true, search = '', statusFilter = 'ALL';
  const statuses = ['ALL','PENDING','CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];
  const statusBadge: Record<string,string> = {
    PENDING:'badge-gold', CONFIRMED:'badge-blue', PROCESSING:'badge-blue',
    PACKED:'badge-blue', SHIPPED:'badge-blue', OUT_FOR_DELIVERY:'badge-orange',
    DELIVERED:'badge-green', CANCELLED:'badge-red',
  };

  onMount(async () => {
    const d = await api.get<any>('/api/orders').catch(()=>({orders:[]}));
    orders = d.orders||[]; loading = false;
  });

  $: filtered = orders.filter((o: any) => {
    const ms = !search || o.orderNumber?.includes(search.toUpperCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase()) || o.user?.phone?.includes(search);
    return ms && (statusFilter==='ALL' || o.status===statusFilter);
  });

  async function updateStatus(id: string, status: string) {
    await api.patch<any>(`/api/orders/${id}`, { status });
    orders = orders.map((o: any) => o.id===id ? {...o,status} : o);
    toasts.success('Status updated');
  }
</script>

<svelte:head><title>Orders — Admin | Mango King</title></svelte:head>

<div class="mb-6 flex items-center justify-between gap-4">
  <div>
    <h1 class="font-display text-3xl text-[#1E0F06]">Orders</h1>
    <p class="font-body text-sm text-[#1E0F06]/45 mt-0.5">{filtered.length} orders</p>
  </div>
</div>

<!-- Filters -->
<div class="flex flex-col sm:flex-row gap-3 mb-6">
  <div class="relative flex-1">
    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8922A]">
      <Icon name="search" size={16} strokeWidth={2} color="currentColor"/>
    </div>
    <input type="text" bind:value={search} placeholder="Search order #, name, phone…" class="input pl-11 w-full"/>
  </div>
  <select bind:value={statusFilter} class="input w-auto font-body">
    {#each statuses as s}<option value={s}>{s==='ALL'?'All Statuses':s.replace(/_/g,' ')}</option>{/each}
  </select>
</div>

{#if loading}
  <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
{:else}
  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-[#FBF8F2] border-b border-[#E6D9C0]">
            {#each ['Order','Customer','Amount','Status','Date',''] as h}
              <th class="text-left px-5 py-3.5 font-body font-800 text-[11px] uppercase tracking-wider text-[#1E0F06]/45">{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F2EBD9]">
          {#each filtered as o}
            <tr class="hover:bg-[#FBF8F2] transition-colors">
              <td class="px-5 py-4">
                <p class="font-body font-800 text-sm text-[#1E0F06] font-mono">#{o.orderNumber}</p>
                <p class="font-body text-xs text-[#1E0F06]/40">{o.items?.length||0} items</p>
              </td>
              <td class="px-5 py-4">
                <p class="font-body font-700 text-sm text-[#1E0F06]">{o.user?.name||'—'}</p>
                <p class="font-body text-xs text-[#1E0F06]/40">{o.user?.phone}</p>
              </td>
              <td class="px-5 py-4">
                <p class="font-display text-lg text-[#1E0F06]">₹{o.totalAmount?.toFixed(0)}</p>
              </td>
              <td class="px-5 py-4">
                <select value={o.status} on:change={e => updateStatus(o.id, e.currentTarget.value)}
                  class="font-body text-xs font-700 rounded-xl px-3 py-1.5 border border-[#E6D9C0] bg-white focus:outline-none focus:border-[#C8922A] cursor-pointer">
                  {#each statuses.slice(1) as s}<option value={s}>{s.replace(/_/g,' ')}</option>{/each}
                </select>
              </td>
              <td class="px-5 py-4 font-body text-xs text-[#1E0F06]/45">
                {new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
              </td>
              <td class="px-5 py-4">
                <button on:click={() => goto(`/admin/orders/${o.id}`)}
                  class="w-9 h-9 rounded-xl bg-[#F2EBD9] hover:bg-[#C8922A]/15 text-[#C8922A] flex items-center justify-center transition-colors">
                  <Icon name="chevronR" size={16} strokeWidth={2.5} color="currentColor"/>
                </button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="6" class="text-center py-12 font-body text-sm text-[#1E0F06]/40">No orders found</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}
