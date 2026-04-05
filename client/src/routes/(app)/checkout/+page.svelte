<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { cart, cartTotal, authUser, toasts } from '$lib/stores';
  import { ordersApi } from '$lib/api/orders';
  import Icon from '$lib/components/ui/Icon.svelte';
  import api from '$lib/api/client';

  let addresses: any[] = [], selectedId = '', gateways: any[] = [];
  let selectedGateway = 'RAZORPAY';
  let placing = false, success = false, successOrder = '';
  let showForm = false;
  let newAddr = { name:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'' };

  $: shipping = $cartTotal >= 500 ? 0 : 60;
  $: total    = $cartTotal + shipping;

  const gatewayInfo: Record<string,any> = {
    RAZORPAY: { name: 'Razorpay', icon: 'card', desc: 'UPI, Cards, Net Banking, Wallets', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    CASHFREE: { name: 'Cashfree', icon: 'card', desc: 'UPI, Cards, EMI', color: 'bg-green-50 border-green-200 text-green-700' },
    PAYTM:    { name: 'Paytm',    icon: 'card', desc: 'Paytm UPI, Wallet', color: 'bg-sky-50 border-sky-200 text-sky-700' },
    COD:      { name: 'Cash on Delivery', icon: 'expenses', desc: 'Pay when you receive', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  };

  onMount(async () => {
    if (!$authUser) { goto('/login?redirect=/checkout'); return; }
    const [addrList, gwList] = await Promise.all([
      api.get<any[]>('/api/addresses').catch(() => []),
      api.get<any[]>('/api/payments/gateways/active').catch(() => []),
    ]);
    addresses  = addrList;
    gateways   = gwList;
    selectedId = addresses.find(a => a.isDefault)?.id || addresses[0]?.id || '';
    showForm   = addresses.length === 0;
    // Set default gateway
    const def = gwList.find(g => g.isDefault) || gwList[0];
    if (def) selectedGateway = def.gateway;
  });

  async function saveAddress() {
    try {
      const a = await api.post<any>('/api/addresses', newAddr);
      addresses = [...addresses, a]; selectedId = a.id; showForm = false;
      toasts.success('Address saved!');
    } catch (e: any) { toasts.error(e.message || 'Failed'); }
  }

  async function placeOrder() {
    if (!selectedId)         { toasts.error('Select a delivery address'); return; }
    if ($cart.length === 0)  { toasts.error('Your cart is empty'); return; }
    if (!selectedGateway)    { toasts.error('Select a payment method'); return; }
    placing = true;

    try {
      // 1. Create the order in our DB
      const data = await ordersApi.create(selectedId);

      if (selectedGateway === 'COD') {
        // COD: just confirm
        await api.post<any>('/api/payments/cod-confirm', { orderId: data.order.id });
        cart.clear(); successOrder = data.order.orderNumber; success = true; placing = false;
        return;
      }

      if (selectedGateway === 'RAZORPAY') {
        // Create Razorpay order
        const rp = await api.post<any>('/api/payments/create-razorpay', { orderId: data.order.id });

        const rzpKey = rp.key || import.meta.env.PUBLIC_RAZORPAY_KEY;
        if (!rzpKey) { toasts.error('Razorpay key not configured'); placing = false; return; }

        const opts = {
          key:       rzpKey,
          amount:    Math.round(total * 100),
          currency:  'INR',
          name:      'Mango King Ratnagiri',
          order_id:  rp.razorpayOrderId,
          prefill:   { contact: $authUser?.phone?.replace(/^\+?91/, ''), name: $authUser?.name || '' },
          theme:     { color: '#C8922A' },
          modal: {
            ondismiss: () => { placing = false; toasts.warning('Payment cancelled'); },
          },
          handler: async (response: any) => {
            try {
              await api.post<any>('/api/payments/verify', {
                orderId:            data.order.id,
                razorpayOrderId:    response.razorpay_order_id,
                razorpayPaymentId:  response.razorpay_payment_id,
                razorpaySignature:  response.razorpay_signature,
              });
              cart.clear(); successOrder = data.order.orderNumber; success = true;
            } catch (e: any) {
              toasts.error(e.message || 'Payment verification failed');
            }
            placing = false;
          },
        };
        new (window as any).Razorpay(opts).open();
        return; // Don't set placing=false here; handler does it
      }

      // Other gateways: show unsupported for now
      toasts.error(`${selectedGateway} integration coming soon`);
      placing = false;

    } catch (e: any) {
      toasts.error(e.message || 'Order failed');
      placing = false;
    }
  }
</script>

<svelte:head>
  <title>Checkout — Mango King Ratnagiri</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</svelte:head>

<div class="max-w-[1000px] mx-auto px-4 py-8">
  {#if success}
    <!-- Success screen -->
    <div class="text-center py-16 max-w-md mx-auto">
      <div class="w-20 h-20 rounded-full bg-[#EFF7F2] border-2 border-[#173422]/20 flex items-center justify-center mx-auto mb-6">
        <Icon name="checkCircle" size={40} strokeWidth={1.5} color="#173422"/>
      </div>
      <h1 class="font-display text-3xl text-[#1E0F06] mb-2">Order Placed!</h1>
      <p class="font-body text-sm text-[#1E0F06]/55 mb-2">Order <strong class="font-mono">#{successOrder}</strong> confirmed.</p>
      <p class="font-body text-sm text-[#1E0F06]/45 mb-8">We'll send updates on WhatsApp. Your order is being prepared.</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button on:click={() => goto('/orders')} class="btn-primary">
          <Icon name="receipt" size={16} strokeWidth={2} color="white"/> Track Order
        </button>
        <button on:click={() => goto('/')} class="btn-ghost">Continue Shopping</button>
      </div>
    </div>

  {:else}
    <h1 class="font-display text-3xl text-[#1E0F06] mb-7">Checkout</h1>

    <div class="grid lg:grid-cols-3 gap-7">
      <!-- Left: Address + Payment -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Address selection -->
        <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-body font-800 text-lg text-[#1E0F06] flex items-center gap-2">
              <Icon name="phone" size={18} strokeWidth={2} color="#C8922A"/> Delivery Address
            </h2>
            <button on:click={() => showForm = !showForm} class="font-body text-sm font-700 text-[#C8922A] hover:text-[#956A18] flex items-center gap-1 transition-colors">
              <Icon name="plus" size={14} strokeWidth={2.5} color="currentColor"/> Add New
            </button>
          </div>

          <div class="space-y-3 mb-4">
            {#each addresses as a}
              <label class="flex gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                {selectedId === a.id ? 'border-[#C8922A] bg-[#FBF4E6]' : 'border-[#E6D9C0] hover:border-[#C8922A]/40'}">
                <input type="radio" bind:group={selectedId} value={a.id} class="mt-1 accent-[#C8922A]"/>
                <div class="font-body text-sm">
                  <p class="font-800 text-[#1E0F06]">{a.name}</p>
                  <p class="text-[#1E0F06]/60 mt-0.5">{a.line1}{a.line2 ? ', '+a.line2 : ''}</p>
                  <p class="text-[#1E0F06]/60">{a.city}, {a.state} — {a.pincode}</p>
                  <p class="text-[#1E0F06]/45 flex items-center gap-1 mt-1"><Icon name="phone" size={11} strokeWidth={2} color="currentColor"/>{a.phone}</p>
                </div>
              </label>
            {/each}
          </div>

          {#if showForm}
            <div class="border-t border-[#E6D9C0] pt-5 space-y-3 animate-slide-up">
              <p class="font-body font-800 text-sm text-[#1E0F06]">New Address</p>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Full Name *</label><input type="text" bind:value={newAddr.name} class="input" placeholder="John Doe"/></div>
                <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Phone *</label><input type="tel" bind:value={newAddr.phone} class="input" placeholder="9876543210"/></div>
              </div>
              <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Address Line 1 *</label><input type="text" bind:value={newAddr.line1} class="input" placeholder="House, Street"/></div>
              <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Landmark / Area</label><input type="text" bind:value={newAddr.line2} class="input" placeholder="Near..."/></div>
              <div class="grid grid-cols-3 gap-3">
                <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">City *</label><input type="text" bind:value={newAddr.city} class="input"/></div>
                <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">State *</label><input type="text" bind:value={newAddr.state} class="input"/></div>
                <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">PIN *</label><input type="text" bind:value={newAddr.pincode} class="input" maxlength="6"/></div>
              </div>
              <div class="flex gap-3">
                <button on:click={saveAddress} class="btn-ghost btn-sm flex-1"><Icon name="save" size={14} strokeWidth={2} color="currentColor"/>Save Address</button>
                <button on:click={() => showForm=false} class="btn-ghost btn-sm flex-1">Cancel</button>
              </div>
            </div>
          {/if}
        </div>

        <!-- Payment method selection -->
        <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6">
          <h2 class="font-body font-800 text-lg text-[#1E0F06] mb-5 flex items-center gap-2">
            <Icon name="card" size={18} strokeWidth={2} color="#C8922A"/> Payment Method
          </h2>

          {#if gateways.length === 0}
            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <Icon name="warning" size={24} strokeWidth={1.5} color="#92400e"/>
              <p class="font-body text-sm text-yellow-800 mt-2">No payment methods available. Contact support.</p>
            </div>
          {:else}
            <div class="space-y-3">
              {#each gateways as gw}
                {@const info = gatewayInfo[gw.gateway] || { name: gw.gateway, icon: 'card', desc: '', color: 'bg-gray-50 border-gray-200 text-gray-600' }}
                <label class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                  {selectedGateway === gw.gateway ? 'border-[#C8922A] bg-[#FBF4E6]' : 'border-[#E6D9C0] hover:border-[#C8922A]/40'}">
                  <input type="radio" bind:group={selectedGateway} value={gw.gateway} class="accent-[#C8922A]"/>
                  <div class="w-10 h-10 rounded-xl {info.color} border flex items-center justify-center shrink-0">
                    <Icon name={info.icon} size={18} strokeWidth={1.8} color="currentColor"/>
                  </div>
                  <div class="flex-1">
                    <p class="font-body font-800 text-sm text-[#1E0F06]">{info.name}</p>
                    <p class="font-body text-xs text-[#1E0F06]/45">{info.desc}</p>
                  </div>
                  {#if gw.isDefault}<span class="badge badge-gold font-body text-[9px]">Default</span>{/if}
                </label>
              {/each}
            </div>

            {#if selectedGateway === 'COD'}
              <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                <Icon name="info" size={15} strokeWidth={2} color="#92400e"/>
                <p class="font-body text-xs text-yellow-800">Cash on Delivery available. Extra ₹30 COD charge may apply. Pay the exact amount to the delivery person.</p>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <!-- Right: Order summary -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5 sticky top-24">
          <h2 class="font-body font-800 text-base text-[#1E0F06] mb-4">Order Summary</h2>
          <div class="space-y-3 mb-4 max-h-[240px] overflow-y-auto no-scrollbar">
            {#each $cart as item}
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl overflow-hidden bg-[#F2EBD9] shrink-0">
                  {#if item.image}<img src={item.image} alt={item.productName} class="w-full h-full object-cover"/>{:else}<div class="w-full h-full flex items-center justify-center"><img src="/logo.png" alt="" class="w-2/3 h-2/3 object-contain opacity-30"/></div>{/if}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-body text-sm font-600 text-[#1E0F06] truncate">{item.productName}</p>
                  {#if item.variantLabel}<p class="font-body text-xs text-[#1E0F06]/40">{item.variantLabel}</p>{/if}
                  <p class="font-body text-xs text-[#1E0F06]/40">Qty: {item.quantity}</p>
                </div>
                <span class="font-body font-700 text-sm text-[#1E0F06] shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            {/each}
          </div>
          <div class="border-t border-[#F2EBD9] pt-4 space-y-2 text-sm font-body">
            <div class="flex justify-between text-[#1E0F06]/55"><span>Subtotal</span><span>₹{$cartTotal.toFixed(0)}</span></div>
            <div class="flex justify-between text-[#1E0F06]/55">
              <span>Shipping</span>
              <span class="{shipping===0?'text-[#173422] font-700':''}">{shipping===0?'FREE':'₹'+shipping}</span>
            </div>
            {#if $cartTotal < 500}
              <p class="font-body text-xs text-[#C8922A] bg-[#FBF4E6] rounded-lg px-3 py-1.5">Add ₹{(500-$cartTotal).toFixed(0)} more for free delivery</p>
            {/if}
            <div class="flex justify-between font-800 text-base text-[#1E0F06] pt-2 border-t border-[#F2EBD9]">
              <span>Total</span>
              <span class="font-display text-xl">₹{total.toFixed(0)}</span>
            </div>
          </div>

          <button on:click={placeOrder}
            disabled={placing || !selectedId || $cart.length===0 || !selectedGateway}
            class="btn-primary w-full justify-center py-4 text-base mt-4">
            {#if placing}
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>
              Processing…
            {:else if selectedGateway === 'COD'}
              <Icon name="checkCircle" size={18} strokeWidth={2} color="white"/>
              Place Order (COD)
            {:else}
              <Icon name="lock" size={18} strokeWidth={2} color="white"/>
              Pay ₹{total.toFixed(0)}
            {/if}
          </button>
          <p class="text-center font-body text-[11px] text-[#1E0F06]/35 mt-2 flex items-center justify-center gap-1.5">
            <Icon name="lock" size={11} strokeWidth={2} color="currentColor"/> Secured by {selectedGateway === 'COD' ? 'Mango King' : 'Razorpay'}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
