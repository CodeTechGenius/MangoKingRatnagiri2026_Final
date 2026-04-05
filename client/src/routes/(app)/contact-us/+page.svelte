<script lang="ts">
  import { toasts } from '$lib/stores';
  import Icon from '$lib/components/ui/Icon.svelte';

  let form = { name: '', phone: '', email: '', subject: 'General Enquiry', message: '' };
  let sending = false, sent = false;

  const subjects = [
    'General Enquiry',
    'Order Issue',
    'Bulk / Corporate Order',
    'Quality Complaint',
    'Wholesale Partnership',
    'Media / Press',
    'Other',
  ];

  async function submit() {
    if (!form.name || !form.phone || !form.message) {
      toasts.error('Please fill name, phone and message');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toasts.error('Enter a valid 10-digit mobile number');
      return;
    }
    sending = true;
    // Simulate sending (replace with your API call if you add a contact endpoint)
    await new Promise(r => setTimeout(r, 1200));
    sending = false;
    sent = true;
    toasts.success('Message sent! We\'ll reply within 24 hours.');
  }

  const faqs = [
    {
      q: 'Are your mangoes really GI certified Alphonso?',
      a: 'Yes. Every box includes the Government of India Geographical Indication certificate for Ratnagiri Alphonso. Our farm registration number is on the certificate.',
    },
    {
      q: 'How soon will I get my order?',
      a: 'Pune and Mumbai: 24–36 hours. Bangalore, Hyderabad, Delhi: 48–72 hours. We ship Monday to Friday. Orders placed after 2 PM are dispatched next morning.',
    },
    {
      q: 'What if the mangoes arrive damaged?',
      a: 'Send us a WhatsApp message with a photo within 24 hours of delivery. We will either replace the affected mangoes or refund — no questions asked.',
    },
    {
      q: 'Do you take bulk or corporate orders?',
      a: 'Yes, we take bulk orders of 20+ boxes. Corporate gifting, weddings, and institutional buyers get special pricing. Call or WhatsApp us directly.',
    },
    {
      q: 'How are the mangoes ripened?',
      a: 'Only on the tree — never with carbide or any other agent. We harvest when ripe and ship immediately. The mangoes arrive firm-ripe and continue softening naturally over 2–4 days.',
    },
    {
      q: 'Can I visit the farm?',
      a: 'Yes! We welcome farm visits during the season (April–May). WhatsApp us to schedule. We\'re located 2 km from Ganeshgule village, Ratnagiri.',
    },
  ];

  let openFaq = -1;
</script>

<svelte:head>
  <title>Contact Us — Mango King Ratnagiri</title>
  <meta name="description" content="Get in touch with Mango King Ratnagiri. Order enquiries, quality questions, farm visits — we're here on WhatsApp, phone, and email."/>
</svelte:head>

<!-- ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="relative bg-[#1E0F06] overflow-hidden">
  <div class="absolute inset-0 opacity-20" style="background:radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,146,42,0.4), transparent)"></div>
  <!-- Decorative mango -->
  <div class="absolute right-[4%] md:right-[10%] top-1/2 -translate-y-1/2 float-anim pointer-events-none select-none opacity-[0.18]">
            <img src="/logo.png" alt="Mango King Logo" class="w-44 md:w-64 lg:w-80 object-contain" />
          </div>

  <div class="relative max-w-[1320px] mx-auto px-5 md:px-10 pt-20 pb-16">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-8 h-px bg-[#C8922A]"></div>
      <span class="font-body text-[11px] font-800 text-[#C8922A] tracking-[0.25em] uppercase">We're Here to Help</span>
    </div>
    <h1 class="font-display text-5xl md:text-6xl text-white leading-[1.04] mb-4">
      Let's Talk Mangoes
    </h1>
    <p class="font-body text-lg text-white/50 max-w-lg leading-relaxed">
      Order help, bulk enquiries, farm visits or just want to chat about Alphonso season —
      our team is available every day from 9 AM to 7 PM IST.
    </p>
  </div>
</section>

<!-- ━━━ CONTACT CARDS ROW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#FBF8F2] px-5 md:px-10 py-10">
  <div class="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
    <!-- WhatsApp -->
    <a href="https://wa.me/919226792772?text=Hi Mango King, I have a question about your mangoes." target="_blank"
      class="flex flex-col items-start gap-4 bg-white rounded-2xl p-7 shadow-card border-2 border-transparent hover:border-[#25D366]/40 hover:shadow-elevated transition-all duration-300 group no-underline">
      <div class="w-14 h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/25 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
        <Icon name="whatsapp" size={28} strokeWidth={0} color="#128C7E"/>
      </div>
      <div>
        <p class="font-body font-800 text-base text-[#1E0F06] mb-1">WhatsApp</p>
        <p class="font-body text-sm text-[#1E0F06]/50 mb-3 leading-relaxed">Fastest response. Share photos of your order. Live chat with our team.</p>
        <p class="font-display text-xl text-[#128C7E]">+91 92267 92772</p>
        <p class="font-body text-xs text-[#1E0F06]/35 mt-1">Mon–Sat, 9 AM – 7 PM IST</p>
      </div>
      <div class="flex items-center gap-2 font-body text-sm font-800 text-[#25D366] mt-auto group-hover:gap-3 transition-all">
        Chat on WhatsApp
        <Icon name="forward" size={14} strokeWidth={2.5} color="currentColor"/>
      </div>
    </a>

    <!-- Phone -->
    <a href="tel:+919226792772"
      class="flex flex-col items-start gap-4 bg-white rounded-2xl p-7 shadow-card border-2 border-transparent hover:border-[#C8922A]/40 hover:shadow-elevated transition-all duration-300 group no-underline">
      <div class="w-14 h-14 rounded-2xl bg-[#C8922A]/10 border border-[#C8922A]/25 flex items-center justify-center group-hover:bg-[#C8922A]/20 transition-colors">
        <Icon name="phone" size={26} strokeWidth={1.8} color="#C8922A"/>
      </div>
      <div>
        <p class="font-body font-800 text-base text-[#1E0F06] mb-1">Phone Call</p>
        <p class="font-body text-sm text-[#1E0F06]/50 mb-3 leading-relaxed">Speak directly with our team. Bulk orders, custom boxes, and urgent queries.</p>
        <p class="font-display text-xl text-[#C8922A]">+91 92267 92772</p>
        <p class="font-body text-xs text-[#1E0F06]/35 mt-1">Mon–Sat, 9 AM – 7 PM IST</p>
      </div>
      <div class="flex items-center gap-2 font-body text-sm font-800 text-[#C8922A] mt-auto group-hover:gap-3 transition-all">
        Call Us Now
        <Icon name="forward" size={14} strokeWidth={2.5} color="currentColor"/>
      </div>
    </a>

    <!-- Email -->
    <a href="mailto:mangokingratnagiri@gmail.com"
      class="flex flex-col items-start gap-4 bg-white rounded-2xl p-7 shadow-card border-2 border-transparent hover:border-blue-300 hover:shadow-elevated transition-all duration-300 group no-underline">
      <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
        <Icon name="mail" size={26} strokeWidth={1.8} color="#2563eb"/>
      </div>
      <div>
        <p class="font-body font-800 text-base text-[#1E0F06] mb-1">Email</p>
        <p class="font-body text-sm text-[#1E0F06]/50 mb-3 leading-relaxed">For invoices, corporate enquiries, media requests and feedback.</p>
        <p class="font-display text-lg text-blue-600 break-all">mangokingratnagiri@gmail.com</p>
        <p class="font-body text-xs text-[#1E0F06]/35 mt-1">We reply within 24 hours</p>
      </div>
      <div class="flex items-center gap-2 font-body text-sm font-800 text-blue-600 mt-auto group-hover:gap-3 transition-all">
        Send Email
        <Icon name="forward" size={14} strokeWidth={2.5} color="currentColor"/>
      </div>
    </a>
  </div>
</section>

<!-- ━━━ FORM + MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#F2EBD9] py-16 md:py-24 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto grid lg:grid-cols-2 gap-12 items-start">

    <!-- Contact form -->
    <div>
      <p class="label-tag mb-5" style="justify-content:flex-start">Send a Message</p>
      <h2 class="font-display text-3xl md:text-4xl text-[#1E0F06] mb-8">We Read Every Message</h2>

      {#if sent}
        <div class="bg-white rounded-2xl p-8 text-center shadow-card border border-[#E6D9C0]">
          <div class="w-16 h-16 rounded-2xl bg-[#EFF7F2] border border-[#173422]/20 flex items-center justify-center mx-auto mb-5">
            <Icon name="checkCircle" size={32} strokeWidth={1.5} color="#173422"/>
          </div>
          <h3 class="font-display text-2xl text-[#1E0F06] mb-2">Message Sent!</h3>
          <p class="font-body text-sm text-[#1E0F06]/55 mb-6">We'll reply to you within 24 hours. You can also reach us immediately on WhatsApp.</p>
          <div class="flex gap-3 justify-center">
            <button on:click={() => { sent=false; form={name:'',phone:'',email:'',subject:'General Enquiry',message:''}; }}
              class="btn-ghost btn-sm">Send Another</button>
            <a href="https://wa.me/919999999999" target="_blank" class="btn-primary btn-sm no-underline">
              <Icon name="whatsapp" size={15} strokeWidth={0} color="white"/>
              WhatsApp Instead
            </a>
          </div>
        </div>
      {:else}
        <form on:submit|preventDefault={submit} class="bg-white rounded-2xl p-7 shadow-card border border-[#E6D9C0] space-y-5">
          <!-- Name + Phone row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="font-body text-xs font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-2 block">
                Full Name *
              </label>
              <input type="text" bind:value={form.name} required
                placeholder="Priya Sharma" class="input"/>
            </div>
            <div>
              <label class="font-body text-xs font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-2 block">
                WhatsApp Number *
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm text-[#1E0F06]/40 font-700">+91</span>
                <input type="tel" bind:value={form.phone} required maxlength="10"
                  on:input={e => form.phone = e.currentTarget.value.replace(/\D/g,'').slice(0,10)}
                  placeholder="9876543210" class="input pl-12"/>
              </div>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="font-body text-xs font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-2 block">
              Email <span class="text-[#1E0F06]/30 normal-case font-500">(optional)</span>
            </label>
            <input type="email" bind:value={form.email}
              placeholder="your@email.com" class="input"/>
          </div>

          <!-- Subject -->
          <div>
            <label class="font-body text-xs font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-2 block">
              Subject
            </label>
            <select bind:value={form.subject} class="input font-body">
              {#each subjects as s}<option value={s}>{s}</option>{/each}
            </select>
          </div>

          <!-- Message -->
          <div>
            <label class="font-body text-xs font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-2 block">
              Your Message *
            </label>
            <textarea bind:value={form.message} required rows="5"
              placeholder="Tell us about your order, question, or feedback…"
              class="input resize-none"></textarea>
          </div>

          <!-- Submit -->
          <button type="submit" disabled={sending}
            class="btn-primary w-full justify-center py-4 text-base">
            {#if sending}
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full" style="animation:spin 1s linear infinite"></div>
              Sending…
            {:else}
              <Icon name="mail" size={18} strokeWidth={2} color="white"/>
              Send Message
            {/if}
          </button>

          <p class="text-center font-body text-xs text-[#1E0F06]/35">
            Or reach us instantly on
            <a href="https://wa.me/919999999999" target="_blank" class="text-[#25D366] font-800 no-underline hover:underline">WhatsApp</a>
            for a faster response.
          </p>
        </form>
      {/if}
    </div>

    <!-- Location + Hours -->
    <div class="space-y-6 lg:pt-14">
      <!-- Farm address card -->
      <div class="bg-white rounded-2xl p-7 shadow-card border border-[#E6D9C0]">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-xl bg-[#C8922A]/10 flex items-center justify-center">
            <Icon name="phone" size={18} strokeWidth={2} color="#C8922A"/>
          </div>
          <h3 class="font-display text-xl text-[#1E0F06]">Find Our Farm</h3>
        </div>

        <!-- Google Maps embed placeholder -->
        <div class="rounded-xl overflow-hidden mb-5 bg-[#F2EBD9] relative" style="height:220px">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121059.47539527617!2d73.24836265!3d16.99408195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc052b25bcca6c9%3A0xb33f5bf55aa26a5e!2sRatnagiri%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
            class="w-full h-full border-0"
            title="Mango King Ratnagiri Farm Location"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen>
          </iframe>
        </div>

        <div class="space-y-3">
          {#each [
            ['📍', 'Ganeshgule Village, Ratnagiri,\nMaharashtra 415612'],
            ['📞', '+91 99999 99999'],
            ['✉️', 'hello@mangokingratnagiri.com'],
          ] as [icon, val]}
            <div class="flex items-start gap-3">
              <span class="text-lg shrink-0 mt-0.5">{icon}</span>
              <p class="font-body text-sm text-[#1E0F06]/65 leading-relaxed whitespace-pre-line">{val}</p>
            </div>
          {/each}
        </div>
      </div>

      <!-- Hours -->
      <div class="bg-white rounded-2xl p-7 shadow-card border border-[#E6D9C0]">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-xl bg-[#173422]/8 flex items-center justify-center">
            <Icon name="checkCircle" size={18} strokeWidth={2} color="#173422"/>
          </div>
          <h3 class="font-display text-xl text-[#1E0F06]">Working Hours</h3>
        </div>
        <div class="space-y-3">
          {#each [
            ['Mon – Sat', '9:00 AM – 7:00 PM', true],
            ['Sunday', '10:00 AM – 2:00 PM', true],
            ['Season Dispatch', 'April – May (Daily)', false],
          ] as [day, time, active]}
            <div class="flex items-center justify-between py-2.5 border-b border-[#F2EBD9] last:border-0">
              <span class="font-body font-700 text-sm text-[#1E0F06]">{day}</span>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full {active ? 'bg-[#173422]' : 'bg-[#C8922A]'}"></div>
                <span class="font-body text-sm text-[#1E0F06]/55">{time}</span>
              </div>
            </div>
          {/each}
        </div>
        <div class="mt-4 bg-[#EFF7F2] border border-[#173422]/15 rounded-xl px-4 py-3 flex items-center gap-3">
          <Icon name="whatsapp" size={18} strokeWidth={0} color="#128C7E"/>
          <p class="font-body text-xs text-[#173422] font-700">WhatsApp replies within 30 minutes during business hours</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ━━━ FAQ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#FBF8F2] py-16 md:py-24 px-5 md:px-10">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-12">
      <p class="label-tag justify-center mb-4">FAQ</p>
      <h2 class="font-display text-4xl text-[#1E0F06]">Common Questions</h2>
    </div>

    <div class="space-y-3">
      {#each faqs as faq, i}
        <div class="bg-white rounded-2xl border border-[#E6D9C0] overflow-hidden shadow-soft transition-all duration-300
          {openFaq === i ? 'border-[#C8922A]/40 shadow-card' : ''}">
          <button
            on:click={() => openFaq = openFaq === i ? -1 : i}
            class="w-full flex items-center justify-between px-6 py-5 text-left"
            aria-expanded={openFaq === i}>
            <span class="font-body font-800 text-base text-[#1E0F06] pr-4">{faq.q}</span>
            <div class="w-8 h-8 rounded-xl bg-[#F2EBD9] flex items-center justify-center shrink-0 transition-all duration-300
              {openFaq === i ? 'bg-[#C8922A]/15 rotate-180' : ''}">
              <Icon name="chevronD" size={16} strokeWidth={2.5} color="{openFaq === i ? '#C8922A' : '#1E0F06'}"/>
            </div>
          </button>
          {#if openFaq === i}
            <div class="px-6 pb-6 animate-slide-up border-t border-[#F2EBD9] pt-4">
              <p class="font-body text-sm text-[#1E0F06]/60 leading-relaxed">{faq.a}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="mt-10 text-center">
      <p class="font-body text-sm text-[#1E0F06]/45 mb-4">Still have questions?</p>
      <a href="https://wa.me/919226792772?text=Hi, I have a question about Mango King." target="_blank"
        class="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-body font-800 px-7 py-3.5 rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_32px_rgba(37,211,102,0.55)] hover:-translate-y-0.5 no-underline">
        <Icon name="whatsapp" size={18} strokeWidth={0} color="white"/>
        Ask on WhatsApp
      </a>
    </div>
  </div>
</section>

<style>
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
