<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let order: any = null, loading = true, saving = false;
  let status = '', tracking = '', courier = '', costPrice = 0;
  $: profit = (order?.totalAmount||0) - costPrice - (order?.shippingCharge||0);

  onMount(async () => {
    order = await api.get<any>(`/api/orders/${$page.params.id}`).catch(()=>null);
    if (order) { status=order.status; tracking=order.trackingNumber||''; courier=order.courierName||''; costPrice=order.costPrice||0; }
    loading=false;
  });

  async function save() {
    saving=true;
    await api.patch<any>(`/api/orders/${order.id}`, { status, trackingNumber:tracking, courierName:courier, costPrice, profit });
    toasts.success('Order updated!'); saving=false;
  }

  const statusOpts = ['PENDING','CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED'];
</script>

<div class="mb-6 flex items-center gap-3">
  <button on:click={() => goto('/admin/orders')} class="flex items-center gap-2 font-body text-sm font-700 text-[#1E0F06]/50 hover:text-[#C8922A] transition-colors">
    <Icon name="back" size={16} strokeWidth={2} color="currentColor"/> Orders
  </button>
  <span class="text-[#E6D9C0]">/</span>
  <h1 class="font-display text-2xl text-[#1E0F06]">{order ? '#'+order.orderNumber : 'Loading…'}</h1>
</div>

{#if loading}
  <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
{:else if !order}
  <div class="text-center py-16"><Icon name="receipt" size={48} strokeWidth={1} color="#C8922A"/><h2 class="font-display text-2xl text-[#1E0F06] mt-4">Order not found</h2></div>
{:else}
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-5">
      <!-- Manage -->
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
        <h2 class="font-body font-800 text-[#1E0F06] mb-4 flex items-center gap-2">
          <Icon name="settings" size={16} strokeWidth={2} color="#C8922A"/> Manage Order
        </h2>
        <div class="grid grid-cols-2 gap-4 mb-5">
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Status</label>
            <select bind:value={status} class="input">{#each statusOpts as s}<option value={s}>{s.replace(/_/g,' ')}</option>{/each}</select>
          </div>
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Courier</label><input type="text" bind:value={courier} class="input" placeholder="Delhivery, BlueDart…"/></div>
          <div class="col-span-2"><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Tracking Number</label><input type="text" bind:value={tracking} class="input font-mono"/></div>
        </div>
        <!-- Profit calculator -->
        <div class="bg-[#FBF4E6] border border-[#C8922A]/20 rounded-xl p-4 mb-5">
          <h3 class="font-body font-800 text-sm text-[#1E0F06] mb-3 flex items-center gap-2"><Icon name="dollar" size={14} strokeWidth={2} color="#C8922A"/>Profit Calculator</h3>
          <div class="grid grid-cols-3 gap-3 text-sm">
            <div><label class="font-body text-[10px] text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Revenue</label><p class="font-display text-lg text-[#1E0F06]">₹{order.totalAmount?.toFixed(0)}</p></div>
            <div><label class="font-body text-[10px] text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Cost Price (₹)</label><input type="number" bind:value={costPrice} class="input py-2 text-sm"/></div>
            <div><label class="font-body text-[10px] text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Net Profit</label><p class="font-display text-xl {profit>=0?'text-[#173422]':'text-red-500'}">{profit>=0?'+':''}₹{profit.toFixed(0)}</p></div>
          </div>
        </div>
        <button on:click={save} disabled={saving} class="btn-primary flex items-center gap-2">
          {#if saving}<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>{/if}
          <Icon name="save" size={15} strokeWidth={2} color="white"/> Save Changes
        </button>
      </div>
      <!-- Items -->
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
        <h2 class="font-body font-800 text-[#1E0F06] mb-4">Items ({order.items?.length})</h2>
        {#each order.items||[] as item}
          <div class="flex gap-3 mb-3 items-center">
            <div class="w-12 h-12 rounded-xl overflow-hidden bg-[#F2EBD9] shrink-0">{#if item.product?.images?.[0]?.url}<img src={item.product.images[0].url} alt="" class="w-full h-full object-cover"/>{:else}<div class="w-full h-full flex items-center justify-center"><img src="/logo.png" alt="" class="w-3/4 h-3/4 object-contain opacity-30 m-auto" /></div>{/if}</div>
            <div class="flex-1 min-w-0"><p class="font-body font-700 text-sm text-[#1E0F06]">{item.productName}</p>{#if item.variantLabel}<p class="font-body text-xs text-[#1E0F06]/40">{item.variantLabel}</p>{/if}<p class="font-body text-xs text-[#1E0F06]/40">Qty: {item.quantity} × ₹{item.price}</p></div>
            <p class="font-display text-base text-[#1E0F06] shrink-0">₹{(item.price*item.quantity).toFixed(0)}</p>
          </div>
        {/each}
        <div class="border-t border-[#F2EBD9] pt-4 space-y-1.5 font-body text-sm">
          <div class="flex justify-between text-[#1E0F06]/55"><span>Subtotal</span><span>₹{order.subtotal?.toFixed(0)}</span></div>
          <div class="flex justify-between text-[#1E0F06]/55"><span>Shipping</span><span>{order.shippingCharge===0?'FREE':'₹'+order.shippingCharge}</span></div>
          <div class="flex justify-between font-800 text-base text-[#1E0F06] pt-1 border-t border-[#F2EBD9]"><span>Total</span><span class="font-display text-xl">₹{order.totalAmount?.toFixed(0)}</span></div>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-4">
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
        <h2 class="font-body font-800 text-[#1E0F06] mb-4 flex items-center gap-2"><Icon name="user" size={16} strokeWidth={2} color="#C8922A"/>Customer</h2>
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-[#C8922A]/10 flex items-center justify-center font-display text-[#C8922A] font-semibold">{(order.user?.name||'U')[0].toUpperCase()}</div>
          <div><p class="font-body font-700 text-sm text-[#1E0F06]">{order.user?.name||'Unknown'}</p><p class="font-body text-xs text-[#1E0F06]/40">{order.user?.phone}</p></div>
        </div>
        <a href="https://wa.me/{order.user?.phone?.replace(/^\+?91/,'')}?text=Hi, regarding order #{order.orderNumber}" target="_blank"
          class="flex items-center gap-2 font-body text-sm font-700 text-[#25D366] hover:text-[#128C7E] transition-colors no-underline">
          <Icon name="whatsapp" size={16} strokeWidth={0} color="currentColor"/> WhatsApp Customer
        </a>
      </div>
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
        <h2 class="font-body font-800 text-[#1E0F06] mb-3 flex items-center gap-2"><Icon name="phone" size={16} strokeWidth={2} color="#C8922A"/>Delivery Address</h2>
        <div class="font-body text-sm text-[#1E0F06]/65 space-y-0.5">
          <p class="font-800 text-[#1E0F06]">{order.address?.name}</p>
          <p>{order.address?.line1}</p>
          <p>{order.address?.city}, {order.address?.state} — {order.address?.pincode}</p>
          <p class="text-[#1E0F06]/45">📞 {order.address?.phone}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
        <h2 class="font-body font-800 text-[#1E0F06] mb-3">Status History</h2>
        <div class="space-y-2">
          {#each order.statusHistory||[] as h}
            <div class="flex gap-2.5 items-start">
              <div class="w-2 h-2 rounded-full bg-[#C8922A] mt-1.5 shrink-0"></div>
              <div><p class="font-body font-700 text-xs text-[#1E0F06]">{h.status.replace(/_/g,' ')}</p>{#if h.note}<p class="font-body text-xs text-[#1E0F06]/40">{h.note}</p>{/if}<p class="font-body text-[10px] text-[#1E0F06]/30">{new Date(h.createdAt).toLocaleString('en-IN')}</p></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
