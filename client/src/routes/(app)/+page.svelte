<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import HeroBanner from '$lib/components/product/HeroBanner.svelte';
  import ProductCard from '$lib/components/product/ProductCard.svelte';
  import api from '$lib/api/client';

  let banners: any[] = [], cats: any[] = [], featured: any[] = [], newLaunch: any[] = [], trending: any[] = [];

  onMount(async () => {
    const [b, c, fp, np, tp] = await Promise.all([
      api.get<any[]>('/api/banners').catch(() => []),
      api.get<any[]>('/api/categories').catch(() => []),
      api.get<any>('/api/products?filter=featured&limit=8').catch(() => ({ products: [] })),
      api.get<any>('/api/products?filter=new&limit=8').catch(() => ({ products: [] })),
      api.get<any>('/api/products?filter=trending&limit=6').catch(() => ({ products: [] })),
    ]);
    banners = b; cats = c;
    featured = fp.products||[]; newLaunch = np.products||[]; trending = tp.products||[];

    // Scroll reveal
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  });
</script>

<svelte:head><title>Mango King Ratnagiri — Premium Alphonso Mangoes</title></svelte:head>

<!-- Hero: full viewport on all screens. Navbar overlays transparently. -->
<div class="-mt-[72px] md:-mt-[10px]">
  <HeroBanner {banners} />
</div>

<!-- ━━━ MARQUEE TRUST STRIP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<div class="bg-[#1E0F06] overflow-hidden py-3">
  <div class="flex whitespace-nowrap">
    <div class="marquee-inner flex shrink-0 min-w-full">
      {#each Array(2) as _}
        {#each [
          'Direct from Ratnagiri',
          'GI Certified Alphonso',
          'Chemical-Free & Natural',
          'Free Delivery above ₹500',
          '25+ Years Heritage',
          'Trusted by 10,000+ Families',
          'Season 2025 Now Open',
        ] as item}
          <span class="font-sans text-[11px] text-[#C8922A]/60 tracking-wider2 uppercase px-8 flex items-center gap-3">
            <span class="w-1 h-1 rounded-full bg-[#C8922A]/30 inline-block"></span>
            {item}
          </span>
        {/each}
      {/each}
    </div>
  </div>
</div>

<!-- ━━━ CATEGORY GRID ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
{#if cats.length > 0}
<section class="bg-[#FBF8F2] py-20 md:py-28 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="text-center mb-14 reveal">
      <p class="label-tag justify-center mb-4">Explore</p>
      <h2 class="section-heading">Our Collections</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
      {#each cats.slice(0,4) as cat, i}
        <button on:click={() => goto(`/categories/${cat.slug}`)}
          class="relative rounded-2xl overflow-hidden group reveal reveal-delay-{i+1}"
          style="aspect-ratio:3/4">
          <!-- Gradient background -->
          <div class="absolute inset-0 bg-gradient-to-br from-[#2C1810] to-[#0D1A12] transition-all duration-500 group-hover:from-[#3D1F0E]"></div>
          <!-- Ambient blob -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#C8922A]/12 blur-2xl group-hover:bg-[#C8922A]/22 transition-all duration-500"></div>
          <!-- Mango art -->
          <div class="absolute inset-0 flex items-center justify-center opacity-15 group-hover:opacity-25 transition-opacity duration-500">
            <img src="/logo.png" alt="Mango King Logo" class="w-16 h-16 opacity-20 object-contain" />
          </div>
          <!-- Text -->
          <div class="absolute inset-0 flex flex-col items-center justify-end pb-7 px-4 text-center">
            <h3 class="font-serif text-xl md:text-2xl text-white leading-tight mb-1.5">{cat.name}</h3>
            {#if cat.description}<p class="font-sans text-[11px] text-white/45 line-clamp-1 mb-3">{cat.description}</p>{/if}
            <span class="flex items-center gap-1.5 font-sans text-[11px] text-[#C8922A] tracking-wider2 uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              Shop
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>
{/if}

<!-- ━━━ NEW LAUNCHES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
{#if newLaunch.length > 0}
<section class="bg-white py-20 md:py-28 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex items-end justify-between mb-12 reveal">
      <div>
        <p class="label-tag mb-4">Just Arrived</p>
        <h2 class="section-heading">New Launches</h2>
      </div>
      <button on:click={() => goto('/categories?filter=new')}
        class="hidden md:flex items-center gap-2 font-sans text-[13px] text-[#C8922A] hover:text-[#956A18] transition-colors group">
        View All
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {#each newLaunch.slice(0,4) as p, i}
        <div class="reveal reveal-delay-{i+1}"><ProductCard product={p} badge="New Season" badgeColor="green"/></div>
      {/each}
    </div>
  </div>
</section>
{/if}

<!-- ━━━ PROMO BAND ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="relative overflow-hidden bg-[#1E0F06] py-24 md:py-36 px-5 md:px-10">
  <!-- Noise texture -->
  <div class="absolute inset-0 bg-noise opacity-60"></div>
  <!-- Blobs -->
  <div class="absolute top-0 right-[-10%] w-[600px] h-[600px] rounded-full bg-[#C8922A]/7 blur-[90px]"></div>
  <div class="absolute bottom-0 left-[-8%] w-[400px] h-[400px] rounded-full bg-[#173422]/70 blur-[70px]"></div>
  <!-- Grid -->
  <div class="absolute inset-0 opacity-[0.03]"
    style="background-image: linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px); background-size: 80px 80px;"></div>
  <!-- Mango art -->
  <div class="absolute right-8 md:right-20 top-1/2 -translate-y-1/2 opacity-[0.14] pointer-events-none float-anim">
    <!-- <svg viewBox="0 0 240 310" class="w-36 md:w-56" fill="none">
      <ellipse cx="120" cy="210" rx="100" ry="98" fill="#C8922A"/>
      <path d="M120 14 C96 58 62 78 76 134 C88 182 120 218 120 218 C120 218 152 182 164 134 C178 78 144 58 120 14Z" fill="#E5B858"/>
      <path d="M120 14 C128 58 142 78 140 134 C138 182 120 218 120 218" stroke="#C8922A" stroke-width="4" opacity="0.5"/>
      <ellipse cx="102" cy="96" rx="16" ry="24" fill="#C8922A" opacity="0.45" transform="rotate(-22 102 96)"/>
      <circle cx="130" cy="52" r="7" fill="#E5B858" opacity="0.4"/>
    </svg> -->
    <div class="absolute right-[4%] md:right-[10%] top-1/2 -translate-y-1/2 float-anim pointer-events-none select-none opacity-[0.18]">
            <img src="/logo.png" alt="Mango King Logo" class="w-44 md:w-64 lg:w-80 object-contain" />
          </div>
  </div>

  <div class="max-w-[1320px] mx-auto relative">
    <div class="max-w-2xl reveal">
      <p class="label-tag mb-6">Limited Season Offer</p>
      <h2 class="font-serif text-white leading-[1.04] mb-6" style="font-size: clamp(2.2rem, 5vw, 4rem)">
        Fresh from the<br/>
        <span style="background:linear-gradient(135deg,#C8922A 0%,#E5B858 50%,#956A18 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:italic">
          Ratnagiri Hills
        </span>
      </h2>
      <p class="font-sans text-white/50 text-base md:text-lg mb-10 leading-relaxed max-w-lg">
        Picked at peak ripeness, packed within hours of harvest — no cold storage, no artificial ripening. Experience mangoes the way nature intended.
      </p>
      <div class="flex flex-wrap gap-4">
        <button on:click={() => goto('/categories/alphonso-mangoes')} class="btn-primary">
          Shop Alphonso Mangoes
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button on:click={() => goto('/trading')} class="btn-ghost text-white border-white/30 hover:bg-white hover:text-[#1E0F06]">
          Market Prices
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-6 mt-16 pt-14 border-t border-white/8 max-w-md reveal">
      {#each [['10K+','Happy Customers'],['25+','Years Heritage'],['100%','Chemical Free']] as [n, l]}
        <div>
          <p class="font-serif text-3xl text-[#C8922A] leading-none">{n}</p>
          <p class="font-sans text-[10px] text-white/35 tracking-wider2 uppercase mt-2">{l}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ━━━ TRENDING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
{#if trending.length > 0}
<section class="bg-[#FBF8F2] py-20 md:py-28 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="flex items-end justify-between mb-12 reveal">
      <div>
        <p class="label-tag mb-4">Most Loved</p>
        <h2 class="section-heading">Trending Now</h2>
      </div>
      <button on:click={() => goto('/categories?filter=trending')}
        class="hidden md:flex items-center gap-2 font-sans text-[13px] text-[#C8922A] hover:text-[#956A18] transition-colors group">
        View All
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
    <div class="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
      {#each trending.slice(0,6) as p, i}
        <div class="reveal reveal-delay-{i+1}"><ProductCard product={p}/></div>
      {/each}
    </div>
    <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:hidden">
      {#each trending as p}
        <div class="shrink-0 w-44"><ProductCard product={p}/></div>
      {/each}
    </div>
  </div>
</section>
{/if}

<!-- ━━━ FEATURED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
{#if featured.length > 0}
<section class="bg-white py-20 md:py-28 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="text-center mb-14 reveal">
      <p class="label-tag justify-center mb-4">Handpicked for You</p>
      <h2 class="section-heading">Featured Products</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {#each featured as p, i}
        <div class="reveal reveal-delay-{(i%4)+1}"><ProductCard product={p}/></div>
      {/each}
    </div>
    <div class="text-center mt-12 reveal">
      <button on:click={() => goto('/categories')} class="btn-ghost">
        View All Products
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</section>
{/if}

<!-- ━━━ WHY CHOOSE US ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#F2EBD9] py-20 md:py-28 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="text-center mb-14 reveal">
      <p class="label-tag justify-center mb-4">The Mango King Promise</p>
      <h2 class="section-heading">Why Choose Us</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {#each [
        { title:'GI Certified', desc:'Genuine Ratnagiri Alphonso with geographical indication tag — verified origin, every order.',
          icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { title:'Naturally Ripened', desc:'Zero carbide, zero chemicals. Sun-ripened on the tree until perfectly sweet and fragrant.',
          icon:'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
        { title:'Farm to Doorstep', desc:'Packed within hours of harvest and shipped in temperature-controlled boxes directly to you.',
          icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { title:'WhatsApp Support', desc:'Real humans, real help. Get instant order updates and support directly on WhatsApp.',
          icon:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
      ] as f, i}
        <div class="reveal reveal-delay-{i+1} bg-white rounded-2xl p-7 shadow-soft hover:shadow-elevated transition-all duration-350 hover:-translate-y-1 group/f">
          <div class="w-12 h-12 rounded-xl bg-[#C8922A]/10 flex items-center justify-center mb-5 group-hover/f:bg-[#C8922A]/18 transition-colors">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#C8922A" stroke-width="1.7">
              <path stroke-linecap="round" stroke-linejoin="round" d="{f.icon}"/>
            </svg>
          </div>
          <h3 class="font-serif text-xl text-[#1E0F06] mb-2.5">{f.title}</h3>
          <p class="font-sans text-sm text-[#1E0F06]/55 leading-relaxed">{f.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ━━━ TESTIMONIALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#FBF8F2] py-20 md:py-28 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="text-center mb-14 reveal">
      <p class="label-tag justify-center mb-4">What People Say</p>
      <h2 class="section-heading">Customer Reviews</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each [
        { name:'Priya Sharma', city:'Mumbai', stars:5, text:'The aroma alone made the whole house smell divine. Genuine Ratnagiri — I can tell the difference. Will never buy from anywhere else.' },
        { name:'Rahul Mehta', city:'Pune', stars:5, text:'Finally found a trustworthy source. No artificial ripening, natural sweetness. Ordered 3 boxes this season already.' },
        { name:'Anita Desai', city:'Bangalore', stars:5, text:'Sent as a gift. The wooden-style box and presentation were stunning. My family was amazed — just like the mangoes tasted!' },
      ] as r, i}
        <div class="reveal reveal-delay-{i+1} bg-white rounded-2xl p-7 border border-[#E6D9C0] hover:shadow-elevated transition-all duration-350">
          <!-- Stars -->
          <div class="flex gap-0.5 mb-5">
            {#each Array(r.stars) as _}
              <svg viewBox="0 0 20 20" width="16" height="16" fill="#C8922A"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            {/each}
          </div>
          <p class="font-sans text-sm text-[#1E0F06]/65 leading-relaxed mb-6 italic">"{r.text}"</p>
          <div class="flex items-center gap-3 pt-5 border-t border-[#E6D9C0]">
            <div class="w-9 h-9 rounded-full bg-[#C8922A]/15 flex items-center justify-center">
              <span class="font-serif text-sm text-[#C8922A]">{r.name[0]}</span>
            </div>
            <div>
              <p class="font-sans font-500 text-sm text-[#1E0F06]">{r.name}</p>
              <p class="font-sans text-[11px] text-[#1E0F06]/35">{r.city}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ━━━ NEWSLETTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="relative overflow-hidden bg-[#1E0F06] py-20 md:py-28 px-5 md:px-10">
  <div class="absolute inset-0 bg-noise opacity-50"></div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#C8922A]/6 blur-[80px]"></div>
  <div class="max-w-xl mx-auto text-center relative reveal">
    <p class="label-tag justify-center mb-5">Stay Updated</p>
    <h2 class="font-serif text-white mb-4" style="font-size:clamp(1.9rem,4vw,3rem)">Season Alerts &<br/>Early Bird Offers</h2>
    <p class="font-sans text-white/45 text-base mb-10 leading-relaxed">Be first to know when the season opens. Get exclusive harvest updates and early bird pricing.</p>
    <div class="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
      <input type="tel" placeholder="Your WhatsApp number" class="input flex-1 bg-white/8 border-white/15 text-white placeholder-white/30 focus:border-[#C8922A]" />
      <button class="btn-primary shrink-0">
        Notify Me
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
    <p class="font-sans text-[11px] text-white/25 mt-4">No spam, unsubscribe anytime.</p>
  </div>
</section>

<!-- ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<footer class="bg-[#150A03] py-16 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/8">
      <!-- Brand col -->
      <div class="md:col-span-5">
        <div class="flex items-center gap-3 mb-5">
          <div class="rounded-xl overflow-hidden shrink-0" style="width:46px;height:46px;">
            <img src="/logo.png" alt="Mango King Logo" class="w-full h-full object-cover" />
          </div>
          <div>
            <p class="font-serif text-lg text-white">Mango King Ratnagiri</p>
            <p class="font-sans text-[9px] text-[#C8922A]/50 tracking-wider3 uppercase">Est. 1998</p>
          </div>
        </div>
        <p class="font-sans text-sm text-white/35 leading-relaxed max-w-xs mb-6">
          Premium GI certified Alphonso mangoes from century-old orchards in the foothills of Ratnagiri, Maharashtra.
        </p>
        <a href="https://wa.me/919999999999" target="_blank"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366]/12 border border-[#25D366]/25 text-[#25D366] font-sans text-[12px] hover:bg-[#25D366]/22 transition-colors">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat with us on WhatsApp
        </a>
      </div>
      <!-- Links -->
      <div class="md:col-span-3">
        <h4 class="font-sans font-500 text-[10px] tracking-wider3 uppercase text-white/30 mb-5">Shop</h4>
        <ul class="space-y-3">
          {#each [['All Collections','/categories'],['Alphonso Mangoes','/categories/alphonso-mangoes'],['Mango Products','/categories/mango-products'],['Gift Boxes','/categories/gift-boxes'],['Market Prices','/trading'],['About Us','/about-us'],['Contact Us','/contact-us']] as [l, h]}
            <li><a href={h} class="font-sans text-sm text-white/45 hover:text-[#C8922A] transition-colors">{l}</a></li>
          {/each}
        </ul>
      </div>
      <!-- Info -->
      <div class="md:col-span-4">
        <h4 class="font-sans font-500 text-[10px] tracking-wider3 uppercase text-white/30 mb-5">Info</h4>
        <div class="space-y-3">
          {#each [['📍','Ratnagiri, Maharashtra 415612'],['📞','+91 99999 99999'],['✉️','hello@mangokingratnagiri.com'],['🕐','Mon–Sat, 9am–7pm IST']] as [icon, val]}
            <p class="font-sans text-sm text-white/40 flex items-start gap-2.5"><span class="text-sm opacity-60">{icon}</span>{val}</p>
          {/each}
        </div>
        <div class="flex gap-3 mt-6">
          {#each ['Instagram','Facebook','YouTube'] as social}
            <a href="/" class="w-9 h-9 rounded-full bg-white/6 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#C8922A] hover:border-[#C8922A]/30 transition-all font-sans text-[10px]">{social[0]}</a>
          {/each}
        </div>
      </div>
    </div>
    <div class="flex flex-col md:flex-row items-center justify-between pt-8 gap-4">
      <p class="font-sans text-[11px] text-white/20">© 2025 Mango King Ratnagiri. All rights reserved.</p>
      <div class="flex gap-6">
        {#each [['Privacy','/privacy'],['Terms','/terms'],['Returns','/return-policy']] as [l,h]}
          <a href={h} class="font-sans text-[11px] text-white/20 hover:text-[#C8922A]/60 transition-colors">{l}</a>
        {/each}
      </div>
    </div>
  </div>
</footer>

<!-- WhatsApp floating button -->
<a href="https://wa.me/919999999999" target="_blank"
  class="fixed bottom-24 right-5 md:bottom-8 z-40 w-[52px] h-[52px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.65)] hover:scale-105 transition-all duration-300"
  aria-label="WhatsApp Support">
  <svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
