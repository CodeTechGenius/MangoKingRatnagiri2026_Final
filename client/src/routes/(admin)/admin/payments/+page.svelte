<script lang="ts">
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let gateways: any[] = [], settings: Record<string,string> = {}, loading = true;
  let activeTab: 'gateways' | 'whatsapp' | 'settings' = 'gateways';
  let savingWA = false, testPhone = '', testResult = '';

  // Credentials forms
  let rzpForm  = { keyId: '', keySecret: '', webhookSecret: '' };
  let cfForm   = { clientId: '', clientSecret: '', webhookSecret: '' };
  let showCreds: Record<string, boolean> = {};

  const gatewayMeta: Record<string, any> = {
    RAZORPAY: { name: 'Razorpay',          color: 'bg-blue-50 text-blue-600',   border: 'border-blue-200',   desc: 'UPI, Cards, Net Banking, Wallets, EMI', popular: true  },
    CASHFREE: { name: 'Cashfree',          color: 'bg-green-50 text-green-700', border: 'border-green-200',  desc: 'UPI, Cards, EMI, Wallet',              popular: false },
    PAYTM:    { name: 'Paytm',             color: 'bg-sky-50 text-sky-600',     border: 'border-sky-200',    desc: 'Paytm UPI, Wallet, Cards',             popular: false },
    COD:      { name: 'Cash on Delivery',  color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200', desc: 'Pay at delivery — no online processing', popular: false },
  };

  const waProviders = [
    { value: 'dummy',    label: 'Dummy (Dev Mode)',  desc: 'OTP printed to server console only.' },
    { value: 'gupshup',  label: 'Gupshup',           desc: 'Popular Indian WhatsApp Business API.' },
    { value: 'wati',     label: 'Wati.io',            desc: 'Easy-to-use WhatsApp Business API.' },
    { value: 'twilio',   label: 'Twilio',             desc: 'Reliable global messaging.' },
  ];

  onMount(async () => {
    const [gw, s] = await Promise.all([
      api.get<any[]>('/api/admin/payment-gateways').catch(() => []),
      api.get<any>('/api/settings').catch(() => ({})),
    ]);
    gateways = gw;
    settings = { whatsapp_provider: 'dummy', ...s };
    loading = false;
  });

  async function toggleGW(g: any) {
    await api.patch<any>(`/api/admin/payment-gateways/${g.gateway}`, { isActive: !g.isActive });
    gateways = gateways.map(x => x.gateway === g.gateway ? { ...x, isActive: !x.isActive } : x);
    toasts.success(`${gatewayMeta[g.gateway]?.name || g.gateway} ${g.isActive ? 'disabled' : 'enabled'}`);
  }

  async function setDefault(g: any) {
    await api.patch<any>(`/api/admin/payment-gateways/${g.gateway}`, { isDefault: true });
    gateways = gateways.map(x => ({ ...x, isDefault: x.gateway === g.gateway }));
    toasts.success(`Default set to ${gatewayMeta[g.gateway]?.name}`);
  }

  async function saveCreds(gateway: string) {
    const form = gateway === 'RAZORPAY' ? rzpForm : cfForm;
    try {
      await api.patch<any>(`/api/admin/payment-gateways/${gateway}/credentials`, { credentials: form });
      toasts.success('Credentials saved!');
      showCreds[gateway] = false;
    } catch (e: any) { toasts.error(e.message); }
  }

  async function saveWA() {
    savingWA = true;
    try {
      const waKeys = ['whatsapp_provider','whatsapp_api_url','whatsapp_api_key','whatsapp_number'];
      const obj: Record<string,string> = {};
      waKeys.forEach(k => obj[k] = settings[k] || '');
      await api.patch<any>('/api/admin/settings', obj);
      toasts.success('WhatsApp settings saved!');
    } catch (e: any) { toasts.error(e.message || 'Save failed'); }
    savingWA = false;
  }

  async function saveSettings() {
    try {
      await api.patch('/api/admin/settings', settings);
      toasts.success('Settings saved!');
    } catch (e: any) { toasts.error(e.message || 'Save failed'); }
  }

  async function testOTP() {
    if (!testPhone || testPhone.length !== 10) { toasts.error('Enter valid 10-digit phone'); return; }
    testResult = '';
    try {
      const r = await api.post<any>('/api/auth/send-otp', { phone: `91${testPhone}` });
      testResult = r.otp ? `✅ OTP (DEV): ${r.otp}` : '✅ OTP sent via WhatsApp!';
    } catch (e: any) { testResult = `❌ ${e.message}`; }
  }
</script>

<svelte:head><title>Payments & Messaging — Admin | Mango King</title></svelte:head>

<div class="mb-6">
  <h1 class="font-display text-3xl text-[#1E0F06]">Payments & Messaging</h1>
  <p class="font-body text-sm text-[#1E0F06]/45 mt-0.5">Manage payment gateways, credentials and WhatsApp OTP</p>
</div>

<!-- Tabs -->
<div class="flex gap-1 p-1.5 bg-[#F2EBD9] rounded-2xl w-fit mb-6">
  {#each [['gateways','card','Payment Gateways'], ['whatsapp','whatsapp','WhatsApp OTP'], ['settings','settings','Advanced Settings']] as [tab, icon, label]}
    <button on:click={() => activeTab = tab}
      class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-700 text-sm transition-all
        {activeTab === tab ? 'bg-white text-[#1E0F06] shadow-soft' : 'text-[#1E0F06]/45 hover:text-[#1E0F06]'}">
      <Icon name={icon} size={15} strokeWidth={2} color="currentColor"/>
      {label}
    </button>
  {/each}
</div>

{#if loading}
  <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
{:else if activeTab === 'gateways'}

  <!-- Info box -->
  <div class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 mb-5 max-w-3xl">
    <Icon name="info" size={18} strokeWidth={2} color="#2563eb"/>
    <div>
      <p class="font-body font-700 text-sm text-blue-800">Multiple gateways</p>
      <p class="font-body text-sm text-blue-700">Enable multiple gateways and customers will see all options at checkout. Set one as Default for the pre-selected option.</p>
    </div>
  </div>

  <div class="max-w-3xl space-y-4 mb-6">
    {#each gateways as g}
      {@const meta = gatewayMeta[g.gateway] || { name: g.gateway, color: 'bg-gray-50 text-gray-600', border: 'border-gray-200', desc: '' }}
      <div class="bg-white rounded-2xl border-2 p-5 transition-all {g.isDefault ? 'border-[#C8922A]/40' : 'border-[#E6D9C0]'}">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl {meta.color} border {meta.border} flex items-center justify-center shrink-0">
            <Icon name="card" size={24} strokeWidth={1.8} color="currentColor"/>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 class="font-body font-800 text-base text-[#1E0F06]">{meta.name}</h3>
              {#if g.isDefault}<span class="badge badge-gold font-body text-[9px]">Default</span>{/if}
              {#if meta.popular}<span class="badge font-body text-[9px] bg-blue-50 text-blue-600 border-blue-200">Most Popular</span>{/if}
            </div>
            <p class="font-body text-xs text-[#1E0F06]/45">{meta.desc}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            {#if !g.isDefault && g.isActive}
              <button on:click={() => setDefault(g)} class="font-body text-xs font-700 text-[#C8922A] hover:text-[#956A18] transition-colors">Set Default</button>
            {/if}
            {#if g.gateway !== 'COD'}
              <button on:click={() => showCreds[g.gateway] = !showCreds[g.gateway]}
                class="font-body text-xs font-700 text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                <Icon name="settings" size={13} strokeWidth={2} color="currentColor"/>
                Credentials
              </button>
            {/if}
            <button on:click={() => toggleGW(g)} aria-label="Toggle"
              class="relative w-12 h-6 rounded-full transition-all duration-300 {g.isActive ? 'bg-[#173422]' : 'bg-[#E6D9C0]'}">
              <div class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 {g.isActive ? 'left-7' : 'left-1'}"></div>
            </button>
          </div>
        </div>

        <!-- Credentials panel -->
        {#if showCreds[g.gateway]}
          <div class="mt-4 pt-4 border-t border-[#F2EBD9] animate-slide-up">
            {#if g.gateway === 'RAZORPAY'}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label class="font-body text-[10px] font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Key ID</label><input type="text" bind:value={rzpForm.keyId} class="input text-sm" placeholder="rzp_live_xxx"/></div>
                <div><label class="font-body text-[10px] font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Key Secret</label><input type="password" bind:value={rzpForm.keySecret} class="input text-sm" placeholder="••••••••"/></div>
                <div><label class="font-body text-[10px] font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Webhook Secret</label><input type="password" bind:value={rzpForm.webhookSecret} class="input text-sm" placeholder="••••••••"/></div>
              </div>
            {:else if g.gateway === 'CASHFREE'}
              <div class="grid grid-cols-2 gap-3">
                <div><label class="font-body text-[10px] font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">App ID</label><input type="text" bind:value={cfForm.clientId} class="input text-sm" placeholder="App ID"/></div>
                <div><label class="font-body text-[10px] font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Secret Key</label><input type="password" bind:value={cfForm.clientSecret} class="input text-sm" placeholder="••••••••"/></div>
              </div>
            {/if}
            <div class="mt-3 flex gap-3">
              <button on:click={() => saveCreds(g.gateway)} class="btn-primary btn-sm">
                <Icon name="save" size={14} strokeWidth={2} color="white"/> Save Credentials
              </button>
              <button on:click={() => showCreds[g.gateway] = false} class="btn-ghost btn-sm">Cancel</button>
            </div>
            <p class="font-body text-xs text-[#1E0F06]/35 mt-2 flex items-center gap-1.5">
              <Icon name="lock" size={11} strokeWidth={2} color="currentColor"/> Credentials are encrypted and stored securely in the database
            </p>
          </div>
        {/if}
      </div>
    {:else}
      <div class="bg-white rounded-2xl p-10 text-center shadow-card border border-[#E6D9C0]">
        <Icon name="card" size={40} strokeWidth={1} color="#C8922A"/>
        <p class="font-body text-sm text-[#1E0F06]/45 mt-3">No gateways. Run <code class="bg-[#F2EBD9] px-2 rounded font-mono text-xs">npm run db:seed</code></p>
      </div>
    {/each}
  </div>

  <!-- Env config reference -->
  <div class="max-w-3xl bg-[#FBF8F2] rounded-2xl p-5 border border-[#E6D9C0]">
    <h3 class="font-body font-800 text-[#1E0F06] mb-2 flex items-center gap-2">
      <Icon name="lock" size={14} strokeWidth={2} color="#C8922A"/> Server .env Configuration
    </h3>
    <pre class="bg-white border border-[#E6D9C0] rounded-xl p-4 text-xs font-mono text-[#1E0F06]/60 overflow-x-auto leading-relaxed">RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET=your_secret</pre>
    <p class="font-body text-xs text-[#1E0F06]/35 mt-2">Webhook URL: <code class="bg-[#F2EBD9] px-1.5 py-0.5 rounded font-mono">https://api.yourdomain.com/api/payments/webhook</code></p>
  </div>

{:else if activeTab === 'whatsapp'}
  <!-- WhatsApp OTP settings -->
  <div class="max-w-2xl space-y-5">
    <div class="space-y-3">
      <h3 class="font-body font-800 text-sm text-[#1E0F06]/50 uppercase tracking-wider">OTP Provider</h3>
      {#each waProviders as prov}
        <label class="flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
          {(settings.whatsapp_provider||'dummy')===prov.value ? 'border-[#C8922A] bg-[#FBF4E6]' : 'border-[#E6D9C0] bg-white hover:border-[#C8922A]/30'}">
          <input type="radio" bind:group={settings.whatsapp_provider} value={prov.value} class="mt-1 accent-[#C8922A]"/>
          <div>
            <div class="flex items-center gap-2">
              <p class="font-body font-800 text-sm text-[#1E0F06]">{prov.label}</p>
              {#if prov.value==='dummy'}<span class="badge badge-green font-body text-[9px]">Dev</span>{/if}
            </div>
            <p class="font-body text-xs text-[#1E0F06]/45 mt-0.5">{prov.desc}</p>
          </div>
        </label>
      {/each}
    </div>

    {#if (settings.whatsapp_provider||'dummy') !== 'dummy'}
      <div class="bg-white rounded-2xl p-5 shadow-card border border-[#E6D9C0] space-y-4">
        {#if settings.whatsapp_provider==='gupshup'}
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">API Key</label><input type="text" bind:value={settings.whatsapp_api_key} class="input"/></div>
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Sender Number (+91...)</label><input type="text" bind:value={settings.whatsapp_number} class="input" placeholder="917000000000"/></div>
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">API URL</label><input type="text" bind:value={settings.whatsapp_api_url} class="input" placeholder="https://api.gupshup.io/sm/api/v1/msg"/></div>
        {:else if settings.whatsapp_provider==='wati'}
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Bearer Token</label><input type="text" bind:value={settings.whatsapp_api_key} class="input"/></div>
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Base URL</label><input type="text" bind:value={settings.whatsapp_api_url} class="input" placeholder="https://live-server-xxxxx.wati.io"/></div>
        {:else if settings.whatsapp_provider==='twilio'}
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Account SID:Auth Token</label><input type="text" bind:value={settings.whatsapp_api_key} class="input" placeholder="ACxxx:token"/></div>
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">From Number</label><input type="text" bind:value={settings.whatsapp_number} class="input" placeholder="+14155238886"/></div>
        {/if}
      </div>
    {:else}
      <div class="bg-green-50 border border-green-200 rounded-2xl p-5">
        <div class="flex items-start gap-3">
          <Icon name="checkCircle" size={20} strokeWidth={2} color="#166534"/>
          <div>
            <h4 class="font-body font-800 text-green-800">Dummy Mode — OTPs printed to server console</h4>
            <div class="mt-2 bg-green-100 rounded-xl px-4 py-2.5 font-mono text-xs text-green-800">🔑 OTP for 91XXXXXXXXXX: 483921 (DEV MODE)</div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Test OTP -->
    <div class="bg-white rounded-2xl p-5 shadow-card border border-[#E6D9C0]">
      <h3 class="font-body font-800 text-[#1E0F06] mb-3">Test OTP</h3>
      <div class="flex gap-3">
        <div class="flex items-center bg-[#F2EBD9] border border-[#E6D9C0] rounded-xl px-3 font-body text-sm font-700 shrink-0 h-[50px]">🇮🇳 +91</div>
        <input type="tel" bind:value={testPhone} maxlength="10" placeholder="9876543210" class="input flex-1"/>
        <button on:click={testOTP} disabled={testPhone.length!==10} class="btn-primary btn-sm shrink-0">Send Test</button>
      </div>
      {#if testResult}<div class="mt-3 bg-[#F2EBD9] rounded-xl px-4 py-2.5 font-mono text-sm">{testResult}</div>{/if}
    </div>

    <button on:click={saveWA} disabled={savingWA} class="btn-primary flex items-center gap-2">
      {#if savingWA}<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>{/if}
      <Icon name="save" size={15} strokeWidth={2} color="white"/> {savingWA ? 'Saving…' : 'Save WhatsApp Settings'}
    </button>

  </div><!-- close max-w-2xl whatsapp tab -->

{:else}
  <!-- Advanced Settings -->
  <div class="max-w-2xl bg-white rounded-2xl p-6 shadow-card border border-[#E6D9C0] space-y-4">
    <h3 class="font-body font-800 text-[#1E0F06] mb-4">Store Settings</h3>
    {#each [['store_name','Store Name','Mango King Ratnagiri'],['free_shipping_above','Free Shipping Above (₹)','500'],['default_shipping_charge','Default Shipping Charge (₹)','60'],['razorpay_key_public','Razorpay Public Key (frontend)','rzp_live_xxx']] as [key, label, placeholder]}
      <div>
        <label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">{label}</label>
        <input type="text" bind:value={settings[key]} class="input" {placeholder}/>
      </div>
    {/each}
    <button on:click={saveSettings} class="btn-primary">
      <Icon name="save" size={15} strokeWidth={2} color="white"/> Save Settings
    </button>
  </div>
{/if}
