<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let data: any = null;
  onMount(async () => { data = await api.get<any>('/api/admin/dashboard').catch(() => null); });

  const statusBadge: Record<string,string> = {
    PENDING:'badge-gold', CONFIRMED:'badge-blue', SHIPPED:'badge-blue',
    OUT_FOR_DELIVERY:'badge-orange', DELIVERED:'badge-green',
    CANCELLED:'badge-red', RETURNED:'badge-red',
  };

  const quickActions = [
    { label:'Add Product',   href:'/admin/products/new',  icon:'plus',     color:'bg-[#C8922A]/10 text-[#C8922A]' },
    { label:'Add Banner',    href:'/admin/banners/new',   icon:'banner',   color:'bg-blue-50 text-blue-600' },
    { label:'All Orders',    href:'/admin/orders',        icon:'receipt',  color:'bg-purple-50 text-purple-600' },
    { label:'Add Expense',   href:'/admin/expenses',      icon:'expenses', color:'bg-red-50 text-red-600' },
    { label:'Market Rates',  href:'/admin/trading',       icon:'trending', color:'bg-green-50 text-green-700' },
    { label:'WhatsApp OTP',  href:'/admin/payments',      icon:'whatsapp', color:'bg-[#25D366]/10 text-[#128C7E]' },
  ];
</script>

<svelte:head><title>Dashboard — Admin | Mango King</title></svelte:head>

<!-- Page header -->
<div class="mb-8">
  <p class="font-body text-sm text-[#1E0F06]/45 mb-1">
    {new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long'})}
  </p>
  <h1 class="font-display text-3xl text-[#1E0F06]">Dashboard</h1>
</div>

{#if !data}
  <div class="flex justify-center py-16">
    <div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div>
  </div>
{:else}
  <!-- Stats row -->
  <div class="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
    {#each [
      { label:'Revenue',    value:`₹${((data.stats?.revenue||0)/1000).toFixed(1)}k`,    icon:'dollar',  color:'text-[#C8922A]', bg:'bg-[#C8922A]/10',  change: data.stats?.revenueChange },
      { label:'Orders',     value: data.stats?.orders||0,                                icon:'receipt', color:'text-blue-600',  bg:'bg-blue-50',       change: data.stats?.ordersChange },
      { label:'Net Profit', value:`₹${((data.stats?.profit||0)/1000).toFixed(1)}k`,     icon:'trending',color:'text-green-600', bg:'bg-green-50',      change: null },
      { label:'Customers',  value: data.stats?.customers||0,                             icon:'users',   color:'text-purple-600',bg:'bg-purple-50',     change: null },
    ] as s}
      <div class="admin-stat-card">
        <div class="flex items-start justify-between mb-5">
          <div class="w-11 h-11 rounded-xl {s.bg} flex items-center justify-center">
            <Icon name={s.icon} size={20} strokeWidth={1.8} color="currentColor" />
          </div>
          {#if s.change !== null && s.change !== undefined}
            <span class="font-body text-xs font-700 {s.change >= 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'} px-2 py-1 rounded-lg">
              {s.change >= 0 ? '↑' : '↓'}{Math.abs(s.change)}%
            </span>
          {/if}
        </div>
        <p class="font-display text-[1.8rem] text-[#1E0F06] leading-none mb-1">{s.value}</p>
        <p class="font-body text-xs text-[#1E0F06]/45 uppercase tracking-wider">{s.label}</p>
      </div>
    {/each}
  </div>

  <div class="grid xl:grid-cols-2 gap-6">
    <!-- Recent orders -->
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-[#F2EBD9]">
        <h2 class="font-body font-800 text-[#1E0F06] text-base">Recent Orders</h2>
        <button on:click={() => goto('/admin/orders')}
          class="font-body text-xs font-700 text-[#C8922A] hover:text-[#956A18] transition-colors flex items-center gap-1">
          View all <Icon name="chevronR" size={13} strokeWidth={2.5} color="currentColor"/>
        </button>
      </div>
      <div class="divide-y divide-[#F2EBD9]">
        {#each (data.recentOrders||[]).slice(0,6) as o}
          <button on:click={() => goto(`/admin/orders/${o.id}`)}
            class="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#FBF8F2] text-left transition-colors group">
            <div class="w-9 h-9 rounded-xl bg-[#F2EBD9] flex items-center justify-center shrink-0">
              <Icon name="receipt" size={15} strokeWidth={2} color="#C8922A"/>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body font-800 text-xs text-[#1E0F06] font-mono">#{o.orderNumber}</p>
              <p class="font-body text-xs text-[#1E0F06]/40 truncate">{o.user?.name||'—'} · {o.user?.phone}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-display text-base text-[#1E0F06]">₹{o.totalAmount?.toFixed(0)}</p>
              <span class="badge {statusBadge[o.status]||'badge-gray'} font-body text-[9px] mt-0.5">{o.status.replace(/_/g,' ')}</span>
            </div>
          </button>
        {:else}
          <div class="text-center py-10 font-body text-sm text-[#1E0F06]/40">No orders yet</div>
        {/each}
      </div>
    </div>

    <!-- Quick actions -->
    <div class="space-y-5">
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6">
        <h2 class="font-body font-800 text-[#1E0F06] text-base mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-2.5">
          {#each quickActions as a}
            <button on:click={() => goto(a.href)}
              class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FBF4E6] transition-colors text-left group">
              <div class="w-10 h-10 {a.color} rounded-xl flex items-center justify-center shrink-0">
                <Icon name={a.icon} size={18} strokeWidth={2} color="currentColor"/>
              </div>
              <span class="font-body text-[13px] font-700 text-[#1E0F06] group-hover:text-[#C8922A] transition-colors leading-snug">{a.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Role info card -->
      <div class="bg-gradient-to-br from-[#1E0F06] to-[#3D1F0E] rounded-2xl p-5 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C8922A]/10 blur-2xl"></div>
        <div class="relative flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-[#C8922A]/20 border border-[#C8922A]/30 flex items-center justify-center shrink-0">
            <span class="font-display text-lg text-[#C8922A]">{($authUser?.name||'A')[0].toUpperCase()}</span>
          </div>
          <div>
            <p class="font-body font-700 text-white text-sm">{$authUser?.name || 'Admin'}</p>
            <p class="font-body text-[10px] text-[#C8922A]/70 uppercase tracking-wider mb-3">{$authUser?.role?.replace('_',' ')}</p>
            {#if $authUser?.role === 'SUPER_ADMIN'}
              <p class="font-body text-xs text-white/45 leading-relaxed">Full access to all settings, WhatsApp OTP configuration, and payment gateways.</p>
            {:else}
              <p class="font-body text-xs text-white/45 leading-relaxed">Manage orders, products, and day-to-day operations.</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
