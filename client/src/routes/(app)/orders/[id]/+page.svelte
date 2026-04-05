<script lang="ts">
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/stores';
  import { ordersApi } from '$lib/api/orders';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let order: any = null, tracking: any = null, loading = true;
  let pollingTimer: ReturnType<typeof setInterval>;

  const steps = ['PENDING','CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED'];
  const stepLabels: Record<string,string> = {
    PENDING:'Order Placed', CONFIRMED:'Confirmed', PROCESSING:'Preparing',
    PACKED:'Packed & Ready', SHIPPED:'Shipped', OUT_FOR_DELIVERY:'Out for Delivery', DELIVERED:'Delivered'
  };
  const stepIcons: Record<string,string> = {
    PENDING:'receipt', CONFIRMED:'checkCircle', PROCESSING:'settings',
    PACKED:'package', SHIPPED:'truck', OUT_FOR_DELIVERY:'truck', DELIVERED:'checkCircle'
  };

  $: currentIdx = steps.indexOf(order?.status);
  $: isCancelled = ['CANCELLED','RETURNED'].includes(order?.status);
  $: isActive = order && !['DELIVERED','CANCELLED','RETURNED'].includes(order.status);

  async function loadOrder() {
    if (!$authUser) { goto('/login?redirect=/orders'); return; }
    try {
      order = await ordersApi.get($page.params.id);
      // Also fetch live Shiprocket tracking
      if (order?.trackingNumber || order?.shiprocketOrderId) {
        try {
          const res = await api.get<any>(`/api/shipping/track/order/${$page.params.id}`);
          tracking = res.tracking;
        } catch {}
      }
    } catch { order = null; }
    loading = false;
  }

  onMount(async () => {
    await loadOrder();
    // Poll every 60s for active orders
    pollingTimer = setInterval(() => {
      if (isActive) loadOrder();
    }, 60000);
  });
  onDestroy(() => clearInterval(pollingTimer));
</script>

<svelte:head><title>Order {order ? '#'+order.orderNumber : 'Detail'} — Mango King</title></svelte:head>

<div class="max-w-2xl mx-auto px-4 py-6">
  <button on:click={() => goto('/orders')}
    class="flex items-center gap-2 font-body text-sm font-700 text-[#1E0F06]/50 hover:text-[#C8922A] transition-colors mb-5">
    <Icon name="back" size={16} strokeWidth={2} color="currentColor"/>
    My Orders
  </button>

  {#if loading}
    <div class="flex justify-center py-16">
      <div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div>
    </div>

  {:else if !order}
    <div class="text-center py-16">
      <Icon name="receipt" size={52} strokeWidth={1} color="#C8922A"/>
      <h2 class="font-display text-2xl text-[#1E0F06] mt-5">Order not found</h2>
    </div>

  {:else}
    <!-- Header card -->
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5 mb-4">
      <div class="flex items-start justify-between mb-3">
        <div>
          <p class="font-body font-800 text-lg text-[#1E0F06] font-mono">#{order.orderNumber}</p>
          <p class="font-body text-xs text-[#1E0F06]/40 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}
          </p>
        </div>
        <p class="font-display text-2xl text-[#1E0F06]">₹{order.totalAmount?.toFixed(0)}</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full {order.paymentStatus==='PAID'?'bg-[#173422]':order.paymentStatus==='PENDING'?'bg-[#C8922A]':'bg-red-500'}"></div>
          <span class="font-body text-xs font-700 {order.paymentStatus==='PAID'?'text-[#173422]':'text-[#C8922A]'}">
            {order.paymentStatus} · {order.paymentGateway || 'RAZORPAY'}
          </span>
        </div>
        {#if order.trackingNumber}
          <span class="font-body text-xs text-[#1E0F06]/40">AWB: {order.trackingNumber}</span>
        {/if}
        {#if isActive}
          <span class="flex items-center gap-1 font-body text-[10px] text-[#C8922A] bg-[#FBF4E6] px-2 py-1 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-[#C8922A] animate-pulse"></span>
            Live tracking active
          </span>
        {/if}
      </div>
    </div>

    <!-- Status tracker -->
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5 mb-4">
      <h2 class="font-body font-800 text-[#1E0F06] mb-5 flex items-center justify-between">
        Order Status
        {#if isActive}
          <button on:click={loadOrder} class="flex items-center gap-1 font-body text-xs font-700 text-[#C8922A] hover:text-[#956A18] transition-colors">
            <Icon name="refresh" size={13} strokeWidth={2} color="currentColor"/> Refresh
          </button>
        {/if}
      </h2>

      {#if isCancelled}
        <div class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <Icon name="xCircle" size={22} strokeWidth={2} color="#ef4444"/>
          <div>
            <p class="font-body font-700 text-red-700">{order.status}</p>
            {#if order.statusHistory?.[0]?.note}
              <p class="font-body text-xs text-red-500 mt-0.5">{order.statusHistory[0].note}</p>
            {/if}
          </div>
        </div>
      {:else}
        <!-- Progress steps -->
        <div class="relative">
          <div class="absolute left-5 top-5 bottom-5 w-0.5 bg-[#E6D9C0]"></div>
          <div class="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-[#C8922A] to-[#E5B858] transition-all duration-700"
            style="height:{Math.min(Math.max(currentIdx,0)/(steps.length-1)*100, 100)}%"></div>
          <div class="space-y-4">
            {#each steps as s, i}
              {@const done = i <= currentIdx}
              {@const curr = i === currentIdx}
              <div class="flex items-start gap-4 relative">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all
                  {done ? 'bg-[#C8922A] shadow-gold' : 'bg-white border-2 border-[#E6D9C0]'}">
                  {#if done}
                    <Icon name={stepIcons[s]} size={16} strokeWidth={2} color="white"/>
                  {:else}
                    <div class="w-3 h-3 rounded-full bg-[#E6D9C0]"></div>
                  {/if}
                </div>
                <div class="flex-1 pt-2.5">
                  <p class="font-body font-700 text-sm {done?'text-[#1E0F06]':'text-[#1E0F06]/30'}">
                    {stepLabels[s]}
                    {#if curr}
                      <span class="badge badge-gold font-body text-[9px] ml-2">Current</span>
                    {/if}
                  </p>
                  {#if curr && order.courierName}
                    <p class="font-body text-xs text-[#1E0F06]/40 mt-0.5">via {order.courierName}</p>
                  {/if}
                </div>
                {#if curr}
                  <span class="shrink-0 mt-2.5">
                    <span class="w-2 h-2 rounded-full bg-[#C8922A] animate-ping inline-block"></span>
                  </span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Live Shiprocket tracking timeline -->
    {#if tracking?.tracking_data?.shipment_track_activities?.length}
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5 mb-4">
        <h2 class="font-body font-800 text-[#1E0F06] mb-4 flex items-center gap-2">
          <Icon name="truck" size={16} strokeWidth={2} color="#C8922A"/>
          Live Shipment Updates
        </h2>
        <div class="space-y-3">
          {#each tracking.tracking_data.shipment_track_activities.slice(0,8) as act, i}
            <div class="flex gap-3 items-start">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 {i===0?'bg-[#C8922A]':'bg-[#F2EBD9]'}">
                <Icon name={i===0?'truck':'checkCircle'} size={13} strokeWidth={2} color="{i===0?'white':'#C8922A'}"/>
              </div>
              <div class="flex-1">
                <p class="font-body font-700 text-sm text-[#1E0F06]">{act['sr-status'] || act.activity}</p>
                {#if act.location}<p class="font-body text-xs text-[#1E0F06]/45 mt-0.5">{act.location}</p>{/if}
                <p class="font-body text-[10px] text-[#1E0F06]/30 mt-0.5">{new Date(act.date).toLocaleString('en-IN')}</p>
              </div>
            </div>
          {/each}
        </div>
        {#if order.trackingNumber}
          <a href="https://shiprocket.co/tracking/{order.trackingNumber}" target="_blank"
            class="flex items-center gap-2 mt-4 font-body text-xs font-700 text-[#C8922A] hover:text-[#956A18] transition-colors no-underline">
            <Icon name="external" size={13} strokeWidth={2} color="currentColor"/> Track on Shiprocket website
          </a>
        {/if}
      </div>
    {:else if order.trackingNumber}
      <div class="bg-[#FBF4E6] border border-[#C8922A]/25 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <Icon name="truck" size={18} strokeWidth={2} color="#C8922A"/>
        <div>
          <p class="font-body font-700 text-sm text-[#1E0F06]">Tracking Number: {order.trackingNumber}</p>
          {#if order.courierName}<p class="font-body text-xs text-[#1E0F06]/45">{order.courierName}</p>{/if}
        </div>
        <button on:click={() => { navigator.clipboard.writeText(order.trackingNumber); }}
          class="ml-auto w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-[#FBF4E6] transition-colors">
          <Icon name="copy" size={14} strokeWidth={2} color="#C8922A"/>
        </button>
      </div>
    {/if}

    <!-- Delivery address -->
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5 mb-4">
      <h2 class="font-body font-800 text-[#1E0F06] mb-3 flex items-center gap-2">
        <Icon name="phone" size={16} strokeWidth={2} color="#C8922A"/> Delivery Address
      </h2>
      <div class="font-body text-sm text-[#1E0F06]/65 space-y-0.5">
        <p class="font-800 text-[#1E0F06]">{order.address?.name}</p>
        <p>{order.address?.line1}{order.address?.line2?', '+order.address.line2:''}</p>
        <p>{order.address?.city}, {order.address?.state} — {order.address?.pincode}</p>
        <p class="text-[#1E0F06]/45 flex items-center gap-1 mt-1"><Icon name="phone" size={11} strokeWidth={2} color="currentColor"/>{order.address?.phone}</p>
      </div>
    </div>

    <!-- Order items -->
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5 mb-4">
      <h2 class="font-body font-800 text-[#1E0F06] mb-4">Items Ordered ({order.items?.length})</h2>
      <div class="space-y-4 mb-4">
        {#each order.items||[] as item}
          <div class="flex gap-3">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-[#F2EBD9] shrink-0">
              {#if item.product?.images?.[0]?.url}
                <img src={item.product.images[0].url} alt="" class="w-full h-full object-cover"/>
              {:else}
                <div class="w-full h-full flex items-center justify-center">
                  <img src="/logo.png" alt="" class="w-2/3 h-2/3 object-contain opacity-30"/>
                </div>
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body font-700 text-sm text-[#1E0F06]">{item.productName}</p>
              {#if item.variantLabel}<p class="font-body text-xs text-[#1E0F06]/40">{item.variantLabel}</p>{/if}
              <p class="font-body text-xs text-[#1E0F06]/40 mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
            </div>
            <p class="font-display text-base text-[#1E0F06] shrink-0">₹{(item.price*item.quantity).toFixed(0)}</p>
          </div>
        {/each}
      </div>
      <div class="border-t border-[#F2EBD9] pt-4 space-y-2 font-body text-sm">
        <div class="flex justify-between text-[#1E0F06]/55"><span>Subtotal</span><span>₹{order.subtotal?.toFixed(0)}</span></div>
        <div class="flex justify-between text-[#1E0F06]/55"><span>Shipping</span><span>{order.shippingCharge===0?'FREE':'₹'+order.shippingCharge}</span></div>
        <div class="flex justify-between font-800 text-base text-[#1E0F06] pt-1 border-t border-[#F2EBD9]">
          <span>Total Paid</span><span class="font-display text-xl">₹{order.totalAmount?.toFixed(0)}</span>
        </div>
      </div>
    </div>

    <!-- WhatsApp support -->
    <div class="bg-[#EFF7F2] border border-[#173422]/20 rounded-2xl p-4 flex items-center gap-4">
      <div class="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0">
        <Icon name="whatsapp" size={20} strokeWidth={0} color="white"/>
      </div>
      <div class="flex-1">
        <p class="font-body font-800 text-sm text-[#1E0F06]">Need help with this order?</p>
        <p class="font-body text-xs text-[#1E0F06]/45">Chat with us on WhatsApp for instant support</p>
      </div>
      <a href="https://wa.me/919226792772?text=Hi, I need help with order #{order.orderNumber}" target="_blank"
        class="btn-primary btn-sm no-underline" style="background:#25D366;box-shadow:0 4px 16px rgba(37,211,102,0.4)">
        Chat
      </a>
    </div>
  {/if}
</div>
