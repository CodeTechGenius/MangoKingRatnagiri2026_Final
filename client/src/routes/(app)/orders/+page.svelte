<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/stores';
  import { ordersApi } from '$lib/api/orders';
  import Icon from '$lib/components/ui/Icon.svelte';

  let orders: any[] = [], loading = true;

  function itemNames(items: any[]): string {
    return (items || []).map(i => i.productName).join(', ');
  }

  const statusStyle: Record<string, string> = {
    PENDING:'badge-gold', CONFIRMED:'badge-blue', PROCESSING:'badge-blue',
    PACKED:'badge-blue', SHIPPED:'badge-blue', OUT_FOR_DELIVERY:'badge-orange',
    DELIVERED:'badge-green', CANCELLED:'badge-red', RETURNED:'badge-red',
  };

  onMount(async () => {
    if (!$authUser) { goto('/login?redirect=/orders'); return; }
    const data = await ordersApi.list().catch(() => ({ orders: [] }));
    orders = data.orders || [];
    loading = false;
  });
</script>

<svelte:head><title>My Orders — Mango King Ratnagiri</title></svelte:head>

<!-- Hero -->
<div class="bg-[#1E0F06] relative overflow-hidden">
  <div class="absolute inset-0 opacity-30" style="background:radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,146,42,0.25), transparent)"></div>
  <div class="max-w-[1320px] mx-auto px-5 md:px-10 py-12 relative">
    <h1 class="page-title text-white">My Orders</h1>
    <p class="font-body text-white/50 text-sm mt-1">{orders.length} order{orders.length!==1?'s':''} total</p>
  </div>
</div>

<div class="max-w-2xl mx-auto px-5 py-6">
  <!-- Back button -->
  <button on:click={() => history.length > 1 ? history.back() : goto('/')}
    class="flex items-center gap-2 font-body text-sm font-700 text-[#1E0F06]/50 hover:text-[#C8922A] transition-colors mb-5">
    <Icon name="back" size={16} strokeWidth={2} color="currentColor"/>
    Back
  </button>
  {#if loading}
    <div class="flex justify-center py-20"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>

  {:else if orders.length === 0}
    <div class="text-center py-20">
      <div class="w-20 h-20 rounded-2xl bg-[#F2EBD9] flex items-center justify-center mx-auto mb-5">
        <Icon name="receipt" size={36} strokeWidth={1.3} color="#C8922A"/>
      </div>
      <h2 class="font-display text-2xl text-[#1E0F06] mb-2">No orders yet</h2>
      <p class="font-body text-sm text-[#1E0F06]/45 mb-8">Your orders will appear here after your first purchase</p>
      <button on:click={() => goto('/')} class="btn-primary">
        <Icon name="cart" size={16} strokeWidth={2} color="white"/>
        Start Shopping
      </button>
    </div>

  {:else}
    <div class="space-y-4">
      {#each orders as order}
        <button on:click={() => goto(`/orders/${order.id}`)}
          class="w-full bg-white rounded-2xl border border-[#E6D9C0] hover:border-[#C8922A]/40 hover:shadow-elevated transition-all duration-300 text-left overflow-hidden group">

          <div class="flex items-center justify-between px-5 py-4 border-b border-[#F2EBD9]">
            <div>
              <p class="font-body font-800 text-sm text-[#1E0F06] font-mono">#{order.orderNumber}</p>
              <p class="font-body text-xs text-[#1E0F06]/40 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
              </p>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="badge {statusStyle[order.status] || 'badge-gray'} font-body text-[10px]">
                {order.status.replace(/_/g,' ')}
              </span>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity text-[#C8922A]">
                <Icon name="chevronR" size={16} strokeWidth={2.5} color="currentColor"/>
              </div>
            </div>
          </div>

          <div class="px-5 py-4 flex items-center gap-4">
            <div class="flex -space-x-2 shrink-0">
              {#each (order.items || []).slice(0, 3) as item}
                <div class="w-11 h-11 rounded-xl overflow-hidden bg-[#F2EBD9] border-2 border-white">
                  {#if item.product?.images?.[0]?.url}
                    <img src={item.product.images[0].url} alt={item.productName} class="w-full h-full object-cover"/>
                  {:else}
                    <div class="w-full h-full flex items-center justify-center">
                      <img src="/logo.png" alt="" class="w-3/4 h-3/4 object-contain opacity-30 m-auto" />
                    </div>
                  {/if}
                </div>
              {/each}
              {#if (order.items||[]).length > 3}
                <div class="w-11 h-11 rounded-xl bg-[#F2EBD9] border-2 border-white flex items-center justify-center">
                  <span class="font-body text-xs font-700 text-[#1E0F06]/50">+{order.items.length-3}</span>
                </div>
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body text-sm font-600 text-[#1E0F06] truncate">{itemNames(order.items)}</p>
              <p class="font-body text-xs text-[#1E0F06]/40 mt-0.5">{order.items?.length||0} item{order.items?.length!==1?'s':''}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="font-display text-xl text-[#1E0F06]">₹{order.totalAmount?.toFixed(0)}</p>
              {#if order.paymentStatus === 'PAID'}
                <p class="font-body text-[10px] text-[#173422] font-700 mt-0.5">Paid</p>
              {:else}
                <p class="font-body text-[10px] text-[#C8922A] font-700 mt-0.5">Pending</p>
              {/if}
            </div>
          </div>

          {#if ['CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT_FOR_DELIVERY'].includes(order.status)}
            <div class="px-5 pb-4 flex items-center gap-2 text-[#C8922A]">
              <Icon name="truck" size={14} strokeWidth={2} color="currentColor"/>
              <span class="font-body text-[11px] font-700">Track this order →</span>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
