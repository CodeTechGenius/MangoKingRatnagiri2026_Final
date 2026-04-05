<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authUser, toasts } from '$lib/stores';
  import { authApi } from '$lib/api/auth';
  import Icon from '$lib/components/ui/Icon.svelte';

  let phone = '', step: 'phone' | 'otp' = 'phone', loading = false, cd = 0;
  let timer: ReturnType<typeof setInterval>;

  // 6 individual OTP digit boxes
  let otpDigits: string[] = ['', '', '', '', '', ''];
  let otpRefs: HTMLInputElement[] = [];

  $: otp = otpDigits.join('');
  $: redir = $page.url.searchParams.get('redirect') || '/';

  const fmt = (v: string) => v.replace(/\D/g, '').slice(0, 10);
  const startCd = (s = 60) => {
    cd = s; clearInterval(timer);
    timer = setInterval(() => { cd--; if (cd <= 0) clearInterval(timer); }, 1000);
  };

  function handleOtpInput(e: Event, i: number) {
    const val = (e.currentTarget as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
    otpDigits[i] = val;
    otpDigits = [...otpDigits];
    if (val && i < 5) otpRefs[i + 1]?.focus();
    if (otp.length === 6) verifyOTP();
  }

  function handleOtpKeydown(e: KeyboardEvent, i: number) {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      otpDigits[i - 1] = '';
      otpDigits = [...otpDigits];
      otpRefs[i - 1]?.focus();
    }
  }

  function handleOtpPaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    pasted.split('').forEach((d, i) => { if (i < 6) otpDigits[i] = d; });
    otpDigits = [...otpDigits];
    const nextEmpty = otpDigits.findIndex(d => !d);
    otpRefs[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  }

  async function sendOTP() {
    if (phone.length !== 10) { toasts.error('Enter a valid 10-digit number'); return; }
    loading = true;
    try {
      const r = await authApi.sendOTP(`91${phone}`);
      if (r.success) {
        step = 'otp'; startCd();
        toasts.success('OTP sent!');
        if (r.otp) toasts.warning(`[Dev] OTP: ${r.otp}`, 30000);
      } else {
        toasts.error('Failed to send OTP');
      }
    } catch (e: any) { toasts.error(e.message || 'Error sending OTP'); }
    loading = false;
  }

  async function verifyOTP() {
    if (otp.length !== 6) { toasts.error('Enter the 6-digit OTP'); return; }
    loading = true;
    try {
      const r = await authApi.verifyOTP(`91${phone}`, otp);
      authUser.login(r.user, r.token);
      toasts.success(`Welcome${r.user.name ? ', ' + r.user.name : ''}!`);
      goto(redir);
    } catch (e: any) {
      toasts.error(e.message || 'Invalid OTP. Try again.');
      otpDigits = ['', '', '', '', '', ''];
      otpRefs[0]?.focus();
    }
    loading = false;
  }
</script>

<svelte:head><title>Sign In — Mango King Ratnagiri</title></svelte:head>

<div class="min-h-screen bg-[#1A0D05] flex items-center justify-center px-5 py-10 relative overflow-hidden">

  <!-- BG decoration -->
  <div class="absolute inset-0 pointer-events-none"
    style="background:radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,146,42,0.08), transparent)"></div>
  <div class="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-[#C8922A]/5 blur-3xl pointer-events-none"></div>

  <!-- ✅ Back button → root -->
  <button
    on:click={() => goto('/')}
    class="absolute top-5 left-5 flex items-center gap-1.5 font-body text-sm text-white/40 hover:text-[#C8922A] transition-colors z-10"
  >
    <Icon name="back" size={16} strokeWidth={2} color="currentColor"/>
    <span>Back</span>
  </button>

  <div class="w-full max-w-[380px] relative">

    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="mx-auto mb-4 rounded-2xl overflow-hidden " style="width:80px;height:80px;">
        <img src="/logo.png" alt="Mango King Logo" class="w-full h-full object-cover"/>
      </div>
      <h1 class="font-display text-3xl text-white font-semibold">Mango King</h1>
      <p class="font-body text-[10px] text-[#C8922A]/50 tracking-[0.25em] uppercase mt-1">Ratnagiri • Est. 1998</p>
    </div>

    <!-- Card -->
    <div class="bg-white/6 backdrop-blur-2xl border border-white/12 rounded-3xl p-6 shadow-2xl">

      {#if step === 'phone'}
        <h2 class="font-display text-2xl text-white mb-1">Welcome back</h2>
        <p class="font-body text-sm text-white/50 mb-6">Sign in with your WhatsApp number</p>

        <label class="font-body text-xs font-800 text-white/50 tracking-wider uppercase mb-2 block">
          Mobile Number
        </label>

        <div class="flex gap-2 mb-5">
          <!-- Country code pill -->
          <div class="flex items-center gap-1 shrink-0 px-3 rounded-xl border border-white/20 bg-white/10 h-[52px]">
            <span class="text-base">🇮🇳</span>
            <span class="font-body text-sm font-700" style="color:rgba(255,255,255,0.8)">+91</span>
          </div>

          <!-- ✅ Phone input — explicit style color fix -->
          <input
            type="tel"
            bind:value={phone}
            on:input={e => phone = fmt(e.currentTarget.value)}
            on:keypress={e => e.key === 'Enter' && sendOTP()}
            placeholder="Mobile No"
            maxlength="10"
            autofocus
            style="color: white; -webkit-text-fill-color: white;"
            class="flex-1 h-[52px] px-4 rounded-xl border border-white/20 bg-white/10
                   font-body text-base font-600 placeholder-white/30
                   focus:outline-none focus:border-[#C8922A] focus:bg-white/15
                   transition-all duration-200"
          />
        </div>

        <button on:click={sendOTP} disabled={loading || phone.length !== 10}
          class="btn-primary w-full justify-center py-4 text-[13px] disabled:opacity-40">
          {#if loading}
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>
            Sending…
          {:else}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send OTP via WhatsApp
          {/if}
        </button>

      {:else}
        <!-- OTP step -->
        <button on:click={() => { step = 'phone'; otpDigits = ['','','','','','']; }}
          class="flex items-center gap-2 font-body text-sm text-white/50 hover:text-[#C8922A] transition-colors mb-5">
          <Icon name="back" size={15} strokeWidth={2} color="currentColor"/>
          Change number
        </button>

        <h2 class="font-display text-2xl text-white mb-1">Enter OTP</h2>
        <p class="font-body text-sm text-white/50 mb-6">
          Sent to
          <span class="font-800" style="color:#25D366">WhatsApp</span>
          +91 {phone}
        </p>

        <label class="font-body text-xs font-800 text-white/50 tracking-wider uppercase mb-3 block">
          6-Digit Code
        </label>

        <!-- ✅ Individual OTP boxes -->
        <div class="flex gap-2 mb-5 justify-between" on:paste={handleOtpPaste}>
          {#each otpDigits as digit, i}
            <input
              bind:this={otpRefs[i]}
              type="tel"
              inputmode="numeric"
              maxlength="1"
              value={digit}
              on:input={e => handleOtpInput(e, i)}
              on:keydown={e => handleOtpKeydown(e, i)}
              autofocus={i === 0}
              style="-webkit-text-fill-color: white; color: white;"
              class="w-full h-[56px] text-center text-2xl font-800 font-display
                     rounded-xl border-2 bg-white/10
                     transition-all duration-200 focus:outline-none
                     {digit ? 'border-[#C8922A] bg-[#C8922A]/10' : 'border-white/20'}
                     focus:border-[#C8922A] focus:bg-white/15"
            />
          {/each}
        </div>

        <button on:click={verifyOTP} disabled={loading || otp.length !== 6}
          class="btn-primary w-full justify-center py-4 text-[13px] disabled:opacity-40 mb-4">
          {#if loading}
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>
            Verifying…
          {:else}
            <Icon name="checkCircle" size={18} strokeWidth={2} color="white"/>
            Verify & Sign In
          {/if}
        </button>

        <p class="text-center font-body text-sm text-white/40">
          {#if cd > 0}
            Resend in <span class="text-[#C8922A] font-800">{cd}s</span>
          {:else}
            <button on:click={sendOTP} class="text-[#C8922A] hover:text-[#E5B858] transition-colors font-800">
              Resend OTP
            </button>
          {/if}
        </p>
      {/if}
    </div>

    <p class="text-center font-body text-[11px] text-white/20 mt-5">
      By signing in you agree to our
      <a href="/terms" class="text-[#C8922A]/40 hover:text-[#C8922A]/70 transition-colors no-underline">Terms</a>
      &amp;
      <a href="/privacy" class="text-[#C8922A]/40 hover:text-[#C8922A]/70 transition-colors no-underline">Privacy Policy</a>
    </p>
  </div>
</div>