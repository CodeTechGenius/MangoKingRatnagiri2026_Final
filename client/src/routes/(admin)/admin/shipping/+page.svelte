<script lang="ts">
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let activeTab: 'dashboard' | 'orders' | 'track' | 'settings' = 'dashboard';
  let summary: any = null, pendingOrders: any[] = [], loading = true;
  let trackInput = '', trackResult: any = null, tracking = false;
  let settings: Record<string,string> = {};
  let savingSettings = false;
  let courierModal: any = null; // { order, couriers, shipmentId }
  let loadingCouriers = false;
  let selectedCourier: any = null;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    loading = true;
    const [s, p, st] = await Promise.all([
      api.get<any>('/api/shipping/summary').catch(() => null),
      api.get<any[]>('/api/shipping/pending').catch(() => []),
      api.get<any>('/api/settings').catch(() => ({})),
    ]);
    summary       = s;
    pendingOrders = p;
    settings      = st;
    loading       = false;
  }

  async function syncOrder(order: any) {
    order._syncing = true; pendingOrders = [...pendingOrders];
    try {
      const r = await api.post<any>(`/api/shipping/sync/${order.id}`);
      toasts.success(`Order #${order.orderNumber} synced! SR#${r.shiprocketOrderId}`);
      pendingOrders = pendingOrders.filter(o => o.id !== order.id);
      await loadData();
    } catch (e: any) {
      toasts.error(e.message || 'Sync failed');
    }
    order._syncing = false;
  }

  async function openCourierModal(order: any) {
    if (!order.shiprocketOrderId) { toasts.error('Sync order first'); return; }
    loadingCouriers = true;
    try {
      const couriers = await api.get<any[]>(`/api/shipping/couriers/${order.id}`);
      courierModal = { order, couriers, shipmentId: order.shiprocketShipmentId };
      selectedCourier = couriers[0] || null;
    } catch (e: any) { toasts.error('Failed to fetch couriers'); }
    loadingCouriers = false;
  }

  async function assignCourier() {
    if (!selectedCourier || !courierModal) return;
    try {
      const r = await api.post<any>('/api/shipping/assign-courier', {
        orderId:    courierModal.order.id,
        shipmentId: courierModal.shipmentId,
        courierId:  selectedCourier.courier_company_id,
      });
      toasts.success(`Courier assigned: ${selectedCourier.courier_name} — AWB: ${r.response?.data?.awb_code || 'pending'}`);
      courierModal = null;
      await loadData();
    } catch (e: any) { toasts.error(e.message || 'Assignment failed'); }
  }

  async function doTrack() {
    if (!trackInput.trim()) return;
    tracking = true; trackResult = null;
    try {
      // Try as order ID first, then AWB
      trackResult = await api.get<any>(`/api/shipping/track/awb/${trackInput}`);
    } catch {
      try {
        const order = await api.get<any>(`/api/orders/${trackInput}`);
        if (order.trackingNumber) trackResult = await api.get<any>(`/api/shipping/track/awb/${order.trackingNumber}`);
      } catch {}
    }
    if (!trackResult) toasts.error('Tracking info not found');
    tracking = false;
  }

  async function saveSettings() {
    savingSettings = true;
    try {
      await api.patch<any>('/api/admin/settings', {
        shiprocket_email:    settings.shiprocket_email    || '',
        shiprocket_password: settings.shiprocket_password || '',
        sr_pickup_location:  settings.sr_pickup_location  || 'Primary',
        sr_pickup_pincode:   settings.sr_pickup_pincode   || '',
        sr_package_weight:   settings.sr_package_weight   || '1.5',
        sr_package_length:   settings.sr_package_length   || '30',
        sr_package_breadth:  settings.sr_package_breadth  || '25',
        sr_package_height:   settings.sr_package_height   || '15',
      });
      toasts.success('Shiprocket settings saved!');
    } catch (e: any) { toasts.error(e.message || 'Save failed'); }
    savingSettings = false;
  }

  const statusColor: Record<string, string> = {
    PENDING: 'badge-gold', CONFIRMED: 'badge-blue', PROCESSING: 'badge-blue',
    PACKED: 'badge-blue', SHIPPED: 'badge-blue', OUT_FOR_DELIVERY: 'badge-orange',
    DELIVERED: 'badge-green', CANCELLED: 'badge-red',
  };
</script>

<svelte:head><title>Shipping — Admin | Mango King</title></svelte:head>

<div class="mb-6">
  <h1 class="font-display text-3xl text-[#1E0F06]">Shiprocket Shipping</h1>
  <p class="font-body text-sm text-[#1E0F06]/45 mt-0.5">Auto-sync orders, assign couriers, track shipments</p>
</div>

<!-- Tabs -->
<div class="flex gap-1 p-1.5 bg-[#F2EBD9] rounded-2xl w-fit mb-6 flex-wrap">
  {#each [['dashboard','dashboard','Dashboard'], ['orders','receipt','Orders'], ['track','search','Track'], ['settings','settings','Settings']] as [tab, icon, label]}
    <button on:click={() => activeTab = tab}
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-700 text-sm transition-all
        {activeTab === tab ? 'bg-white text-[#1E0F06] shadow-soft' : 'text-[#1E0F06]/45 hover:text-[#1E0F06]'}">
      <Icon name={icon} size={15} strokeWidth={2} color="currentColor"/>
      {label}
    </button>
  {/each}
</div>

{#if loading}
  <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
{:else if activeTab === 'dashboard'}

  <!-- Integration status -->
  <div class="flex items-start gap-3 mb-5 p-4 rounded-2xl border max-w-2xl
    {settings.shiprocket_email ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}">
    <Icon name={settings.shiprocket_email ? 'checkCircle' : 'warning'} size={20} strokeWidth={2} color="{settings.shiprocket_email ? '#166534' : '#92400e'}"/>
    <div>
      <p class="font-body font-800 text-sm {settings.shiprocket_email ? 'text-green-800' : 'text-yellow-800'}">
        {settings.shiprocket_email ? `Connected: ${settings.shiprocket_email}` : 'Shiprocket not configured'}
      </p>
      <p class="font-body text-xs {settings.shiprocket_email ? 'text-green-600' : 'text-yellow-600'} mt-0.5">
        {settings.shiprocket_email ? 'Orders auto-sync after payment. Tracking updates via webhook.' : 'Go to Settings tab to configure.'}
      </p>
    </div>
  </div>

  <!-- Stats cards -->
  {#if summary}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {#each [
        ['Needs Sync',   summary.pending,   'warning',      'bg-yellow-50 text-yellow-700' ],
        ['Processing',   summary.synced,    'settings',     'bg-blue-50 text-blue-600'     ],
        ['In Transit',   summary.shipped,   'truck',        'bg-cyan-50 text-cyan-700'     ],
        ['Delivered',    summary.delivered, 'checkCircle',  'bg-green-50 text-green-700'   ],
      ] as [label, val, icon, color]}
        <div class="admin-stat-card">
          <div class="w-11 h-11 rounded-xl {color} flex items-center justify-center mb-4">
            <Icon name={icon} size={20} strokeWidth={1.8} color="currentColor"/>
          </div>
          <p class="font-display text-[1.8rem] text-[#1E0F06] leading-none">{val}</p>
          <p class="font-body text-xs text-[#1E0F06]/45 uppercase tracking-wider mt-1">{label}</p>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Flow diagram -->
  <div class="bg-white rounded-2xl p-6 shadow-card border border-[#E6D9C0] mb-6 max-w-3xl">
    <h3 class="font-body font-800 text-[#1E0F06] mb-5">Automated Order Flow</h3>
    <div class="relative">
      <div class="absolute left-5 top-5 bottom-5 w-0.5 bg-[#E6D9C0]"></div>
      <div class="space-y-5">
        {#each [
          ['checkCircle','Customer places order (COD or Prepaid)','Automatic','green'],
          ['card',       'Payment captured (Razorpay webhook)','Automatic','green'],
          ['truck',      'Auto-synced to Shiprocket dashboard','Automatic','green'],
          ['users',      'Admin selects courier from Shiprocket list','Manual','yellow'],
          ['package',    'Courier assigned → AWB generated → Pickup scheduled','Automatic after selection','green'],
          ['star',       'Shiprocket webhooks update order status in realtime','Automatic','green'],
          ['checkCircle','Customer sees live status on their orders page','Realtime','green'],
        ] as [icon, label, type, color], i}
          <div class="flex items-start gap-4 relative">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10
              {color === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
              <Icon name={icon} size={16} strokeWidth={2} color="currentColor"/>
            </div>
            <div class="flex-1 pt-2">
              <p class="font-body font-700 text-sm text-[#1E0F06]">{label}</p>
            </div>
            <span class="font-body text-[10px] font-700 mt-2.5 shrink-0 px-2 py-1 rounded-lg
              {color === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
              {type}
            </span>
          </div>
        {/each}
      </div>
    </div>
  </div>

{:else if activeTab === 'orders'}

  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-[#E6D9C0]">
      <h2 class="font-body font-800 text-[#1E0F06]">Orders Pending Sync</h2>
      <button on:click={loadData} class="flex items-center gap-1.5 font-body text-xs font-700 text-[#C8922A] hover:text-[#956A18] transition-colors">
        <Icon name="refresh" size={13} strokeWidth={2} color="currentColor"/> Refresh
      </button>
    </div>

    {#if pendingOrders.length === 0}
      <div class="text-center py-16">
        <Icon name="checkCircle" size={44} strokeWidth={1.3} color="#173422"/>
        <p class="font-body font-700 text-[#173422] mt-4">All orders synced to Shiprocket!</p>
      </div>
    {:else}
      <div class="divide-y divide-[#F2EBD9]">
        {#each pendingOrders as order}
          <div class="flex items-center gap-4 px-5 py-4">
            <!-- Order info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-body font-800 text-sm text-[#1E0F06] font-mono">#{order.orderNumber}</p>
                <span class="badge {statusColor[order.status]||'badge-gray'} font-body text-[9px]">{order.status}</span>
                {#if order.shiprocketOrderId}<span class="badge badge-green font-body text-[9px]">SR#{order.shiprocketOrderId}</span>{/if}
              </div>
              <p class="font-body text-xs text-[#1E0F06]/45 mt-0.5">{order.user?.name||'—'} · {order.user?.phone}</p>
              <p class="font-body text-xs text-[#1E0F06]/35">{order.address?.city}, {order.address?.pincode} · {order.items?.length} items · ₹{order.totalAmount?.toFixed(0)}</p>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2 shrink-0">
              {#if !order.shiprocketOrderId}
                <button on:click={() => syncOrder(order)} disabled={order._syncing}
                  class="flex items-center gap-1.5 bg-[#C8922A] hover:bg-[#956A18] text-white font-body text-xs font-700 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                  {#if order._syncing}<div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>Syncing…{:else}<Icon name="truck" size={14} strokeWidth={2} color="white"/>Sync to SR{/if}
                </button>
              {:else}
                <button on:click={() => openCourierModal(order)} disabled={loadingCouriers}
                  class="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-body text-xs font-700 px-4 py-2.5 rounded-xl transition-colors">
                  {#if loadingCouriers}<div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>{:else}<Icon name="users" size={14} strokeWidth={2} color="white"/>Assign Courier{/if}
                </button>
                {#if order.trackingNumber}
                  <span class="font-body text-xs text-[#173422] font-700 bg-[#EFF7F2] px-3 py-1.5 rounded-xl">
                    AWB: {order.trackingNumber}
                  </span>
                {/if}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

{:else if activeTab === 'track'}

  <div class="max-w-2xl">
    <div class="bg-white rounded-2xl p-6 shadow-card border border-[#E6D9C0] mb-5">
      <h3 class="font-body font-800 text-[#1E0F06] mb-4">Track Shipment</h3>
      <div class="flex gap-3">
        <input type="text" bind:value={trackInput} on:keypress={e => e.key==='Enter'&&doTrack()} placeholder="Enter AWB number or Order ID…" class="input flex-1"/>
        <button on:click={doTrack} disabled={tracking || !trackInput.trim()} class="btn-primary btn-sm shrink-0">
          {#if tracking}<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>Tracking…{:else}<Icon name="search" size={15} strokeWidth={2} color="white"/>Track{/if}
        </button>
      </div>
    </div>

    {#if trackResult}
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
        <h3 class="font-body font-800 text-[#1E0F06] mb-4">Tracking Details</h3>
        {#if trackResult?.tracking_data}
          {@const td = trackResult.tracking_data}
          <!-- Current status -->
          <div class="flex items-center gap-3 bg-[#FBF4E6] border border-[#C8922A]/25 rounded-xl px-4 py-3 mb-5">
            <Icon name="truck" size={20} strokeWidth={2} color="#C8922A"/>
            <div>
              <p class="font-body font-800 text-[#1E0F06]">{td.shipment_status || 'In Transit'}</p>
              <p class="font-body text-xs text-[#1E0F06]/45">{td.track_url ? `AWB: ${td.awb_code}` : ''} · {td.courier_name}</p>
            </div>
          </div>
          <!-- Activity timeline -->
          {#if td.shipment_track_activities?.length}
            <h4 class="font-body font-700 text-sm text-[#1E0F06]/50 uppercase tracking-wider mb-3">Activity</h4>
            <div class="space-y-3">
              {#each td.shipment_track_activities as act}
                <div class="flex gap-3 items-start">
                  <div class="w-2 h-2 rounded-full bg-[#C8922A] mt-1.5 shrink-0"></div>
                  <div>
                    <p class="font-body font-700 text-sm text-[#1E0F06]">{act['sr-status'] || act.activity}</p>
                    <p class="font-body text-xs text-[#1E0F06]/40">{act.location} · {new Date(act.date).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <pre class="text-xs text-[#1E0F06]/60 overflow-auto">{JSON.stringify(trackResult, null, 2)}</pre>
        {/if}
      </div>
    {/if}

  </div><!-- close max-w-2xl track tab -->

{:else}
  <!-- Settings -->
  <div class="max-w-2xl space-y-5">
    <div class="bg-white rounded-2xl p-6 shadow-card border border-[#E6D9C0]">
      <h3 class="font-body font-800 text-[#1E0F06] mb-5 flex items-center gap-2">
        <Icon name="settings" size={16} strokeWidth={2} color="#C8922A"/> Shiprocket Account
      </h3>
      <div class="space-y-4">
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Email</label><input type="email" bind:value={settings.shiprocket_email} class="input" placeholder="your@email.com"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Password</label><input type="password" bind:value={settings.shiprocket_password} class="input" placeholder="••••••••"/></div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-card border border-[#E6D9C0]">
      <h3 class="font-body font-800 text-[#1E0F06] mb-5 flex items-center gap-2">
        <Icon name="package" size={16} strokeWidth={2} color="#C8922A"/> Pickup & Package
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2"><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Pickup Location Name (in Shiprocket)</label><input type="text" bind:value={settings.sr_pickup_location} class="input" placeholder="Primary"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Pickup Pincode</label><input type="text" bind:value={settings.sr_pickup_pincode} class="input" placeholder="415612"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Package Weight (kg)</label><input type="number" bind:value={settings.sr_package_weight} class="input" placeholder="1.5"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Length (cm)</label><input type="number" bind:value={settings.sr_package_length} class="input" placeholder="30"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Breadth (cm)</label><input type="number" bind:value={settings.sr_package_breadth} class="input" placeholder="25"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Height (cm)</label><input type="number" bind:value={settings.sr_package_height} class="input" placeholder="15"/></div>
      </div>
    </div>

    <div class="bg-[#FBF8F2] rounded-2xl p-5 border border-[#E6D9C0]">
      <h3 class="font-body font-800 text-[#1E0F06] mb-2 flex items-center gap-2">
        <Icon name="info" size={14} strokeWidth={2} color="#C8922A"/> Webhook Setup
      </h3>
      <p class="font-body text-xs text-[#1E0F06]/55 mb-2">Add this webhook URL in your Shiprocket dashboard → Settings → API → Webhooks:</p>
      <div class="bg-white border border-[#E6D9C0] rounded-xl px-4 py-3 font-mono text-xs text-[#C8922A] break-all">
        https://api.yourdomain.com/api/payments/shiprocket-webhook
      </div>
      <p class="font-body text-xs text-[#1E0F06]/35 mt-2">This enables automatic order status updates when Shiprocket updates shipment status.</p>
    </div>

    <button on:click={saveSettings} disabled={savingSettings} class="btn-primary flex items-center gap-2">
      {#if savingSettings}<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>{/if}
      <Icon name="save" size={15} strokeWidth={2} color="white"/> {savingSettings ? 'Saving…' : 'Save Shiprocket Settings'}
    </button>
  </div>
{/if}

<!-- Courier Assignment Modal -->
{#if courierModal}
  <div class="fixed inset-0 bg-[#1E0F06]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between px-6 py-5 border-b border-[#E6D9C0]">
        <div>
          <h2 class="font-display text-2xl text-[#1E0F06]">Select Courier</h2>
          <p class="font-body text-sm text-[#1E0F06]/45">Order #{courierModal.order.orderNumber}</p>
        </div>
        <button on:click={() => courierModal = null} class="w-9 h-9 rounded-xl bg-[#F2EBD9] hover:bg-[#E6D9C0] flex items-center justify-center transition-colors">
          <Icon name="close" size={16} strokeWidth={2.5} color="#1E0F06"/>
        </button>
      </div>
      <div class="p-5 space-y-3">
        {#if courierModal.couriers.length === 0}
          <div class="text-center py-8 text-[#1E0F06]/40">
            <Icon name="warning" size={36} strokeWidth={1.3} color="currentColor"/>
            <p class="font-body text-sm mt-3">No couriers available for this pincode</p>
          </div>
        {:else}
          {#each courierModal.couriers as c}
            <label class="flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
              {selectedCourier?.courier_company_id === c.courier_company_id ? 'border-[#C8922A] bg-[#FBF4E6]' : 'border-[#E6D9C0] hover:border-[#C8922A]/30'}">
              <input type="radio" bind:group={selectedCourier} value={c} class="accent-[#C8922A]"/>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="font-body font-800 text-sm text-[#1E0F06]">{c.courier_name}</p>
                  {#if c.is_recommended}<span class="badge badge-green font-body text-[9px]">Recommended</span>{/if}
                </div>
                <p class="font-body text-xs text-[#1E0F06]/45 mt-0.5">
                  ETD: {c.estimated_delivery_days} days · ₹{c.rate}
                  {#if c.cod_charges > 0} · COD ₹{c.cod_charges}{/if}
                </p>
              </div>
              <p class="font-display text-xl text-[#1E0F06] shrink-0">₹{c.rate}</p>
            </label>
          {/each}
        {/if}
      </div>
      {#if courierModal.couriers.length > 0}
        <div class="px-5 pb-5">
          <button on:click={assignCourier} disabled={!selectedCourier} class="btn-primary w-full justify-center py-4">
            <Icon name="truck" size={18} strokeWidth={2} color="white"/>
            Assign {selectedCourier?.courier_name || '—'} · ₹{selectedCourier?.rate || 0}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
