<script lang="ts">
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let data: any = null, loading = true, adding = false, saving = false;
  const cats = ['procurement','shipping','marketing','operations','packaging','other'];
  const catColor: Record<string,string> = { procurement:'badge-gold', shipping:'badge-blue', marketing:'badge-orange', operations:'badge-blue', packaging:'badge-gray', other:'badge-gray' };
  let form = { title:'', amount:'', category:'procurement', date: new Date().toISOString().split('T')[0], description:'' };

  onMount(async () => { data = await api.get<any>('/api/expenses').catch(()=>null); loading=false; });

  async function add() {
    if (!form.title||!form.amount) { toasts.error('Title and amount required'); return; }
    saving = true;
    try {
      const e = await api.post<any>('/api/expenses', { ...form, amount: parseFloat(form.amount) });
      data = { ...data, expenses: [e, ...(data?.expenses||[])] };
      toasts.success('Expense recorded!');
      form = { title:'', amount:'', category:'procurement', date: new Date().toISOString().split('T')[0], description:'' };
      adding = false;
    } catch (err: any) { toasts.error(err.message||'Failed'); }
    saving = false;
  }
</script>

<svelte:head><title>Expenses — Admin | Mango King</title></svelte:head>
<div class="mb-6 flex items-center justify-between">
  <div><h1 class="font-display text-3xl text-[#1E0F06]">Expenses</h1><p class="font-body text-sm text-[#1E0F06]/45 mt-0.5">Track business expenses</p></div>
  <button on:click={() => adding=!adding} class="btn-primary btn-sm">
    <Icon name="plus" size={15} strokeWidth={2.5} color="white"/> Add Expense
  </button>
</div>

{#if data}
  <div class="grid grid-cols-3 gap-4 mb-6">
    {#each [['dollar','This Month',`₹${data.monthlyExpenses?.toFixed(0)||0}`],['trending','Revenue',`₹${data.monthlyRevenue?.toFixed(0)||0}`],['chart','Profit',`₹${data.profit?.toFixed(0)||0}`]] as [icon, label, val]}
      <div class="admin-stat-card">
        <div class="w-10 h-10 rounded-xl bg-[#C8922A]/10 flex items-center justify-center mb-3">
          <Icon name={icon} size={18} strokeWidth={1.8} color="#C8922A"/>
        </div>
        <p class="font-display text-2xl text-[#1E0F06]">{val}</p>
        <p class="font-body text-xs text-[#1E0F06]/45 uppercase tracking-wider mt-1">{label}</p>
      </div>
    {/each}
  </div>
{/if}

{#if adding}
  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6 mb-6 animate-slide-up max-w-2xl">
    <h2 class="font-body font-800 text-[#1E0F06] mb-4">New Expense</h2>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="col-span-full"><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Title *</label><input type="text" bind:value={form.title} class="input" placeholder="e.g. Mango procurement 500kg"/></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Amount (₹) *</label><input type="number" bind:value={form.amount} class="input" placeholder="25000"/></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Category</label><select bind:value={form.category} class="input">{#each cats as c}<option value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>{/each}</select></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Date</label><input type="date" bind:value={form.date} class="input"/></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Notes</label><input type="text" bind:value={form.description} class="input" placeholder="Optional notes"/></div>
    </div>
    <div class="flex gap-3">
      <button on:click={add} disabled={saving} class="btn-primary btn-sm flex items-center gap-2">
        {#if saving}<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>{/if}Add
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
        {#each ['Title','Category','Amount','Date'] as h}
          <th class="text-left px-5 py-3.5 font-body font-800 text-[11px] uppercase tracking-wider text-[#1E0F06]/45">{h}</th>
        {/each}
      </tr></thead>
      <tbody class="divide-y divide-[#F2EBD9]">
        {#each data?.expenses||[] as e}
          <tr class="hover:bg-[#FBF8F2]">
            <td class="px-5 py-4"><p class="font-body font-700 text-sm text-[#1E0F06]">{e.title}</p>{#if e.description}<p class="font-body text-xs text-[#1E0F06]/40">{e.description}</p>{/if}</td>
            <td class="px-5 py-4"><span class="badge {catColor[e.category]||'badge-gray'} font-body text-[10px]">{e.category}</span></td>
            <td class="px-5 py-4 font-display text-base text-[#C94F18]">₹{e.amount?.toFixed(0)}</td>
            <td class="px-5 py-4 font-body text-xs text-[#1E0F06]/45">{new Date(e.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</td>
          </tr>
        {:else}
          <tr><td colspan="4" class="text-center py-10 font-body text-sm text-[#1E0F06]/40">No expenses yet</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
