<script lang="ts">
  import Icon from '$lib/components/ui/Icon.svelte';
</script>
<svelte:head><title>Return Policy — Mango King Ratnagiri</title></svelte:head>

<div class="bg-[#1E0F06] relative overflow-hidden">
  <div class="absolute inset-0 opacity-30" style="background:radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,146,42,0.25), transparent)"></div>
  <div class="max-w-[1320px] mx-auto px-5 md:px-10 py-14 relative">
    <h1 class="page-title text-white">Return Policy</h1>
    <p class="font-body text-white/50 mt-2">We stand behind every mango we send</p>
  </div>
</div>

<div class="max-w-2xl mx-auto px-5 py-10">
  <div class="space-y-5">
    {#each [
      { icon:'checkCircle', title:'Quality Guarantee', desc:'All mangoes are hand-inspected before dispatch. If you receive damaged, rotten, or sub-standard fruit, we will replace or fully refund — no questions asked.' },
      { icon:'phone', title:'Report Within 24 Hours', desc:'Contact us via WhatsApp within 24 hours of delivery with photos or video showing the issue. We process complaints quickly.' },
      { icon:'dollar', title:'Refund Timeline', desc:'Approved refunds are processed within 3–5 business days back to your original payment method (UPI, card, or bank account).' },
    ] as item, i}
      <div class="bg-white rounded-2xl p-6 shadow-card border border-[#E6D9C0] flex gap-5">
        <div class="w-12 h-12 rounded-2xl bg-[#C8922A]/10 flex items-center justify-center shrink-0">
          <Icon name={item.icon} size={22} strokeWidth={2} color="#C8922A"/>
        </div>
        <div>
          <h3 class="font-display text-xl text-[#1E0F06] mb-2">{item.title}</h3>
          <p class="font-body text-sm text-[#1E0F06]/60 leading-relaxed">{item.desc}</p>
        </div>
      </div>
    {/each}

    <div class="bg-[#FBF4E6] border border-[#C8922A]/25 rounded-2xl p-6 text-center">
      <p class="font-body text-sm font-700 text-[#1E0F06] mb-4">Need to raise a concern?</p>
      <a href="https://wa.me/919999999999?text=Hi, I need to report an issue with my order" target="_blank"
        class="btn-primary inline-flex">
        <Icon name="whatsapp" size={18} strokeWidth={0} color="white"/>
        WhatsApp Us
      </a>
    </div>
  </div>
</div>
