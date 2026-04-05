<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/ui/Icon.svelte';

  // ── Replace these YouTube video IDs with your real ones ──────────────────
  const videos = [
    {
      id: 'dQw4w9WgXcQ',           // ← Replace with your YouTube video ID
      title: 'Our Mango Farm Tour',
      desc: 'Walk through our century-old Alphonso orchards in Ratnagiri',
    },
    {
      id: 'dQw4w9WgXcQ',           // ← Replace with your YouTube video ID
      title: 'Harvest Season 2025',
      desc: 'How we hand-pick the finest Alphonso mangoes at peak ripeness',
    },
    {
      id: 'dQw4w9WgXcQ',           // ← Replace with your YouTube video ID
      title: 'From Farm to Box',
      desc: 'Our quality check, sorting and packaging process explained',
    },
  ];

  // ── Farm process timeline ──────────────────────────────────────────────────
  const process = [
    {
      season: 'October – November',
      icon: 'seedling',
      label: 'New Planting',
      heading: 'Saplings in the Ground',
      body: 'Each Alphonso tree begins as a grafted sapling from our nursery. We plant in red laterite soil unique to the Konkan coast — the same mineral-rich earth that gives Ratnagiri mangoes their unmatched flavour.',
      image: '/farm/planting.jpg',
      imgAlt: 'Mango saplings being planted in red laterite soil',
    },
    {
      season: 'December – February',
      icon: 'flower',
      label: 'Flowering',
      heading: 'The Orchards Bloom',
      body: 'Panicles burst open from December. We monitor each tree daily — protecting blossoms from unseasonal rain, managing humidity, and ensuring bees reach every flower. No artificial stimulants, ever.',
      image: '/farm/flowering.jpg',
      imgAlt: 'Alphonso mango flowers in bloom',
    },
    {
      season: 'February – March',
      icon: 'fruit-forming',
      label: 'Fruit Setting',
      heading: 'The Mangoes Take Shape',
      body: 'Tiny green fruits replace the blossoms. We thin the clusters by hand so each remaining mango receives full nutrition. This is what separates a premium fruit from an ordinary one.',
      image: '/farm/fruit-setting.jpg',
      imgAlt: 'Small green mangoes forming on branches',
    },
    {
      season: 'March – April',
      icon: 'sun',
      label: 'Growth & Maturing',
      heading: 'Sun-Fed, Wind-Kissed',
      body: 'As sea breezes from the Arabian Sea flow through the orchards, mangoes swell. The Konkan sun concentrates natural sugars while the coastal air develops the signature aroma. No irrigation shortcuts.',
      image: '/farm/maturing.jpg',
      imgAlt: 'Mature Alphonso mangoes on tree',
    },
    {
      season: 'April – May',
      icon: 'harvest',
      label: 'Harvest',
      heading: 'Hand-Picked at Peak',
      body: 'Harvesting Alphonso is an art. Our experienced pickers judge ripeness by colour, aroma and firmness. Each mango is cut with 2 inches of stem intact — preventing sap burn — and gently lowered by hand. Never dropped.',
      image: '/farm/harvest.jpg',
      imgAlt: 'Farmer hand-picking ripe Alphonso mangoes',
    },
    {
      season: 'Within 6 Hours',
      icon: 'sort',
      label: 'Sorting & Grading',
      heading: 'Only the Best Leave the Farm',
      body: 'Freshly harvested mangoes go through a 7-point visual inspection. We grade by size, colour uniformity, skin perfection and aroma intensity. Mangoes that don\'t meet our standard go to the local market.',
      image: '/farm/sorting.jpg',
      imgAlt: 'Workers sorting and grading Alphonso mangoes',
    },
    {
      season: 'Same Day',
      icon: 'package',
      label: 'Packaging',
      heading: 'Packed to Protect',
      body: 'Each mango rests in its own paper-padded cell inside a ventilated wooden-style box. No plastic foam, no artificial wrapping. Boxes are sealed and dispatched within hours of packing.',
      image: '/farm/packaging.jpg',
      imgAlt: 'Mangoes being carefully packed in premium boxes',
    },
    {
      season: 'Next Day',
      icon: 'truck',
      label: 'Delivery',
      heading: 'At Your Door — Fresh',
      body: 'Our logistics partner picks up daily. Mangoes travel in temperature-managed vehicles to metros. Most customers in Pune and Mumbai receive their order within 24–36 hours of harvest.',
      image: '/farm/delivery.jpg',
      imgAlt: 'Mango box being delivered at doorstep',
    },
  ];

  // Scroll reveal
  onMount(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  });

  // YouTube thumbnail URL
  const ytThumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  // YouTube embed URL
  const ytEmbed = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

  let playingVideo: string | null = null;
</script>

<svelte:head>
  <title>About Us — Mango King Ratnagiri</title>
  <meta name="description" content="Learn about Mango King Ratnagiri — our farm, our heritage, and our process of growing premium Alphonso mangoes since 1998."/>
</svelte:head>

<!-- ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="relative  bg-[#1E0F06] flex items-end justify-between overflow-hidden">
  <!-- Background farm image placeholder -->
  <div class="absolute inset-0">
    <img src="/farm/hero-orchard.jpg" alt="Ratnagiri mango orchard"
      class="w-full h-full object-cover opacity-40"
      on:error={(e) => e.currentTarget.remove()}/>
    <!-- Gradient overlays -->
    <div class="absolute inset-0 bg-gradient-to-t from-[#1E0F06] via-[#1E0F06]/60 to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-[#1E0F06]/80 to-transparent"></div>
    <!-- Decorative mango SVG when no image -->
   <div class="absolute right-[4%] md:right-[10%] top-1/2 -translate-y-1/2 float-anim pointer-events-none select-none opacity-[0.18]">
            <img src="/logo.png" alt="Mango King Logo" class="w-44 md:w-64 lg:w-80 object-contain" />
          </div>
  </div>

  <!-- Content -->
  <div class="relative  mx-auto px-5 md:px-10 pb-16 md:pb-24 pt-32">
    <div class="max-w-4xl">
      <div class="flex items-center gap-3 mb-6 animate-fade-up" style="animation-delay:0.1s">
        <div class="w-8 h-px bg-[#C8922A]"></div>
        <span class="font-body text-[11px] font-800 text-[#C8922A] tracking-[0.25em] uppercase">Since 1998</span>
      </div>
      <h1 class="font-display text-5xl md:text-7xl text-white leading-[1.04] mb-6 animate-fade-up" style="animation-delay:0.2s">
        The Story of<br/>
        <span style="background:linear-gradient(135deg,#C8922A 0%,#E5B858 50%,#956A18 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
          Mango King
        </span>
      </h1>
      <p class="font-body text-lg text-white/55 leading-relaxed max-w-xl animate-fade-up" style="animation-delay:0.3s">
        From a small family orchard in the foothills of Ratnagiri to 10,000+ families across India —
        a 25-year journey of growing the finest GI certified Alphonso mangoes without ever compromising.
      </p>
    </div>
  </div>
</section>

<!-- ━━━ INTRO STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#C8922A] py-10 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    {#each [['1998','Est. Year'],['25+','Years Heritage'],['10,000+','Happy Families'],['100%','Chemical Free']] as [val, label]}
      <div>
        <p class="font-display text-4xl md:text-5xl text-white leading-none">{val}</p>
        <p class="font-body text-xs font-800 text-white/70 uppercase tracking-widest mt-2">{label}</p>
      </div>
    {/each}
  </div>
</section>

<!-- ━━━ OUR STORY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#FBF8F2] py-20 md:py-32 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
      <!-- Text -->
      <div class="reveal">
        <p class="label-tag mb-5" style="justify-content:flex-start">Our Journey</p>
        <h2 class="font-display text-4xl md:text-5xl text-[#1E0F06] leading-tight mb-7">
          Three Generations,<br/>One Orchard
        </h2>
        <div class="space-y-4 font-body text-[#1E0F06]/65 text-base leading-relaxed">
          <p>
            In 1998, my father planted the first grafted Alphonso saplings on our 8-acre plot in Ratnagiri.
            He had a simple belief — if you treat the soil right and let nature take its course, the fruit
            will take care of itself. No chemicals. No artificial ripening. No shortcuts.
          </p>
          <p>
            For the first decade, we sold everything at the local market — Ganeshgule mandi. Then our
            regular customers started asking if they could send boxes to their families in Pune and Mumbai.
            By 2012, we had our first 50 online orders. By 2020, we crossed 5,000.
          </p>
          <p>
            Today, Mango King Ratnagiri ships GI certified Alphonso mangoes directly from our orchards
            to your doorstep — still with the same philosophy my father planted in 1998.
          </p>
        </div>
        <div class="flex items-center gap-4 mt-8">
          <div class="w-14 h-14 rounded-2xl overflow-hidden bg-[#F2EBD9] shrink-0">
            <img src="/farm/founder.jpg" alt="Founder" class="w-full h-full object-cover"
              on:error={(e) => { e.currentTarget.style.display='none'; }}/>
          </div>
          <div>
            <p class="font-display text-lg text-[#1E0F06]">Ramesh Patil</p>
            <p class="font-body text-sm text-[#1E0F06]/45">Founder, Mango King Ratnagiri</p>
          </div>
        </div>
      </div>

      <!-- Farm image collage -->
      <div class="reveal reveal-delay-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-2xl overflow-hidden bg-[#F2EBD9] aspect-square">
            <img src="/farm/farm-1.jpg" alt="Our orchard" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              on:error={(e) => { e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg viewBox=\'0 0 100 120\' class=\'w-16 h-16\' fill=\'none\'><path d=\'M50 8C38 34 22 44 28 72C34 94 50 112 50 112C50 112 66 94 72 72C78 44 62 34 50 8Z\' fill=\'#E5B858\' opacity=\'0.4\'/></svg></div>'; }}/>
          </div>
          <div class="rounded-2xl overflow-hidden bg-[#F2EBD9] mt-8 aspect-square">
            <img src="/farm/farm-2.jpg" alt="Alphonso mangoes on tree" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              on:error={(e) => { e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-[#C8922A]/10"><svg viewBox=\'0 0 100 120\' class=\'w-16 h-16\' fill=\'none\'><path d=\'M50 8C38 34 22 44 28 72C34 94 50 112 50 112C50 112 66 94 72 72C78 44 62 34 50 8Z\' fill=\'#C8922A\' opacity=\'0.5\'/></svg></div>'; }}/>
          </div>
          <div class="rounded-2xl overflow-hidden bg-[#F2EBD9] -mt-8 aspect-square">
            <img src="/farm/farm-3.jpg" alt="Mango packaging" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              on:error={(e) => { e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-[#173422]/10"><svg viewBox=\'0 0 100 120\' class=\'w-16 h-16\' fill=\'none\'><path d=\'M50 8C38 34 22 44 28 72C34 94 50 112 50 112C50 112 66 94 72 72C78 44 62 34 50 8Z\' fill=\'#173422\' opacity=\'0.4\'/></svg></div>'; }}/>
          </div>
          <div class="rounded-2xl overflow-hidden bg-[#F2EBD9] aspect-square">
            <img src="/farm/farm-4.jpg" alt="Farm workers" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              on:error={(e) => { e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-[#C8922A]/5"><svg viewBox=\'0 0 100 120\' class=\'w-16 h-16\' fill=\'none\'><path d=\'M50 8C38 34 22 44 28 72C34 94 50 112 50 112C50 112 66 94 72 72C78 44 62 34 50 8Z\' fill=\'#E5B858\' opacity=\'0.3\'/></svg></div>'; }}/>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ━━━ CERTIFICATIONS STRIP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#1E0F06] py-12 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <p class="text-center font-body text-xs font-800 text-white/30 tracking-[0.25em] uppercase mb-8">Our Certifications & Commitments</p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      {#each [
        { icon:'checkCircle', title:'GI Certified', desc:'Geographical Indication tag — verified Ratnagiri origin', color:'text-[#C8922A]', bg:'bg-[#C8922A]/10' },
        { icon:'sun',         title:'No Carbide',   desc:'100% naturally ripened on the tree, never forced',        color:'text-[#E5B858]', bg:'bg-[#E5B858]/8' },
        { icon:'leaf',        title:'Chemical Free',desc:'No pesticides, synthetic fertilisers or wax coating',     color:'text-[#86efac]', bg:'bg-green-500/10' },
        { icon:'package',     title:'Packed Fresh', desc:'Harvested, sorted and shipped within 6 hours',            color:'text-blue-300',  bg:'bg-blue-400/8' },
      ] as c}
        <div class="flex flex-col items-center text-center p-5 rounded-2xl {c.bg} border border-white/5">
          <div class="w-12 h-12 rounded-xl {c.bg} border border-white/10 flex items-center justify-center mb-4">
            <Icon name={c.icon === 'sun' || c.icon === 'leaf' ? 'star' : c.icon} size={22} strokeWidth={1.8} color="{c.color.replace('text-','').replace('[','').replace(']','')}"/>
          </div>
          <p class="font-display text-lg text-white mb-1">{c.title}</p>
          <p class="font-body text-xs text-white/40 leading-relaxed">{c.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ━━━ MANGO JOURNEY TIMELINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#FBF8F2] py-20 md:py-32 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="text-center mb-16 reveal">
      <p class="label-tag justify-center mb-5">The Full Journey</p>
      <h2 class="font-display text-4xl md:text-5xl text-[#1E0F06] leading-tight">
        From Seedling to Your<br/>Doorstep
      </h2>
      <p class="font-body text-base text-[#1E0F06]/50 mt-4 max-w-xl mx-auto">
        Every box of Mango King mangoes travels through 8 carefully managed stages before it reaches you.
      </p>
    </div>

    <div class="space-y-0">
      {#each process as step, i}
        <div class="grid md:grid-cols-2 gap-0 items-stretch reveal reveal-delay-{(i%3)+1}"
          style="direction: {i % 2 === 0 ? 'ltr' : 'rtl'}">

          <!-- Image side -->
          <div class="relative overflow-hidden bg-[#F2EBD9] min-h-[300px] md:min-h-[400px]"
            style="direction:ltr">
            <img src={step.image} alt={step.imgAlt}
              class="w-full h-full object-cover absolute inset-0 hover:scale-105 transition-transform duration-700"
              on:error={(e) => { e.currentTarget.remove(); }}/>
            <!-- Gradient overlay for text readability on image -->
            <div class="absolute inset-0 bg-gradient-to-t from-[#1E0F06]/60 to-transparent"></div>
            <!-- Step number watermark -->
            <div class="absolute bottom-4 {i%2===0?'right-4':'left-4'} font-display text-8xl text-white/10 font-semibold leading-none select-none">
              {String(i+1).padStart(2,'0')}
            </div>
            <!-- Season badge -->
            <div class="absolute top-5 {i%2===0?'left-5':'right-5'}">
              <span class="font-body text-[10px] font-800 text-white bg-[#1E0F06]/70 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 tracking-wider uppercase">{step.season}</span>
            </div>
            <!-- Mango SVG placeholder when no image -->
            <div class="absolute inset-0 flex items-center justify-center opacity-15">
              <svg viewBox="0 0 100 120" class="w-24 h-24" fill="none">
                <ellipse cx="50" cy="90" rx="44" ry="36" fill="#C8922A"/>
                <path d="M50 8C38 34 22 44 28 72C34 94 50 112 50 112C50 112 66 94 72 72C78 44 62 34 50 8Z" fill="#E5B858"/>
              </svg>
            </div>
          </div>

          <!-- Text side -->
          <div class="flex flex-col justify-center px-8 md:px-14 py-12 bg-white" style="direction:ltr">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-[#C8922A]/10 flex items-center justify-center shrink-0">
                <Icon name={step.icon === 'seedling' || step.icon === 'flower' || step.icon === 'fruit-forming' || step.icon === 'harvest' || step.icon === 'sort' ? 'star' : step.icon} size={18} strokeWidth={2} color="#C8922A"/>
              </div>
              <span class="font-body text-xs font-800 text-[#C8922A] tracking-widest uppercase">{step.label}</span>
            </div>
            <h3 class="font-display text-3xl md:text-4xl text-[#1E0F06] leading-tight mb-5">{step.heading}</h3>
            <p class="font-body text-base text-[#1E0F06]/60 leading-relaxed">{step.body}</p>

            <!-- Visual step indicator -->
            <div class="flex items-center gap-2 mt-8">
              {#each process as _, idx}
                <div class="h-1 rounded-full transition-all duration-300 {idx === i ? 'w-6 bg-[#C8922A]' : 'w-2 bg-[#E6D9C0]'}"></div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ━━━ YOUTUBE VIDEOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#1E0F06] py-20 md:py-28 px-5 md:px-10 relative overflow-hidden">
  <div class="absolute inset-0 opacity-20" style="background:radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,146,42,0.3), transparent)"></div>
  <div class="max-w-[1320px] mx-auto relative">
    <div class="text-center mb-14 reveal">
      <p class="label-tag justify-center mb-5 text-[#C8922A]">Watch & Learn</p>
      <h2 class="font-display text-4xl md:text-5xl text-white mb-4">See the Farm in Action</h2>
      <p class="font-body text-white/45 text-base max-w-lg mx-auto">
        Subscribe to our YouTube channel for seasonal updates, farm tours and behind-the-scenes from the orchards.
      </p>
    </div>

    <!-- Video grid -->
    <div class="grid md:grid-cols-3 gap-6 mb-10">
      {#each videos as video, i}
        <div class="reveal reveal-delay-{i+1}">
          <div class="rounded-2xl overflow-hidden bg-[#2C1810] border border-white/8 group cursor-pointer hover:border-[#C8922A]/40 transition-all duration-300 hover:shadow-gold-lg"
            on:click={() => playingVideo = video.id}
            on:keypress={e => e.key==='Enter' && (playingVideo = video.id)}
            role="button" tabindex="0">
            <!-- Thumbnail -->
            <div class="relative overflow-hidden" style="aspect-ratio:16/9">
              {#if playingVideo === video.id}
                <!-- Embedded video player -->
                <iframe
                  src={ytEmbed(video.id)}
                  title={video.title}
                  class="w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              {:else}
                <!-- Thumbnail with play button -->
                <img
                  src={ytThumb(video.id)}
                  alt={video.title}
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  on:error={(e) => {
                    // Fallback to standard quality thumbnail
                    e.currentTarget.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                  }}/>
                <!-- Dark overlay -->
                <div class="absolute inset-0 bg-[#1E0F06]/40 group-hover:bg-[#1E0F06]/20 transition-all duration-300"></div>
                <!-- Play button -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#C8922A] transition-all duration-300 shadow-gold">
                    <!-- Play triangle SVG -->
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <!-- YouTube badge -->
                <div class="absolute bottom-3 right-3">
                  <div class="flex items-center gap-1.5 bg-red-600 rounded-md px-2 py-1">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="white"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                    <span class="font-body text-[9px] font-800 text-white uppercase tracking-wider">YouTube</span>
                  </div>
                </div>
              {/if}
            </div>
            <!-- Info -->
            <div class="p-5">
              <h3 class="font-display text-xl text-white mb-1.5 group-hover:text-[#E5B858] transition-colors">{video.title}</h3>
              <p class="font-body text-sm text-white/45">{video.desc}</p>
              {#if playingVideo !== video.id}
                <div class="flex items-center gap-2 mt-4 text-[#C8922A] font-body text-xs font-800">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Watch Video
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- YouTube subscribe CTA -->
    <div class="text-center reveal">
      <a href="https://www.youtube.com/@MangoKingRatnagiri" target="_blank"
        class="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-body font-800 px-8 py-4 rounded-full transition-all duration-300 shadow-[0_4px_24px_rgba(220,38,38,0.4)] hover:shadow-[0_8px_36px_rgba(220,38,38,0.55)] hover:-translate-y-1 no-underline">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
        Subscribe to Our YouTube Channel
      </a>
      <p class="font-body text-white/30 text-xs mt-3">New videos every harvest season</p>
    </div>
  </div>
</section>

<!-- ━━━ PACKAGING GALLERY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#FBF8F2] py-20 md:py-28 px-5 md:px-10">
  <div class="max-w-[1320px] mx-auto">
    <div class="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
      <div class="reveal">
        <p class="label-tag mb-5" style="justify-content:flex-start">Premium Packaging</p>
        <h2 class="font-display text-4xl md:text-5xl text-[#1E0F06] leading-tight mb-6">
          Designed to<br/>Protect & Impress
        </h2>
        <div class="space-y-5">
          {#each [
            ['Individual Cell Design','Each mango rests in its own padded cell — no fruit touches another. Zero bruising in transit.'],
            ['Ventilated Wood-Style Box','Our signature boxes allow airflow, maintaining natural ripening without trapping ethylene gas.'],
            ['No Plastic Foam','We use FSC-certified paper padding instead of plastic foam — better for the environment and the mango.'],
            ['GI Tag Included','Every box ships with the Government of India Geographical Indication certificate for Ratnagiri Alphonso.'],
          ] as [title, desc]}
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-xl bg-[#C8922A]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="checkCircle" size={16} strokeWidth={2} color="#C8922A"/>
              </div>
              <div>
                <p class="font-body font-800 text-sm text-[#1E0F06] mb-0.5">{title}</p>
                <p class="font-body text-sm text-[#1E0F06]/55 leading-relaxed">{desc}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Packaging images -->
      <div class="reveal reveal-delay-2 space-y-4">
        <div class="rounded-2xl overflow-hidden bg-[#F2EBD9]" style="aspect-ratio:4/3">
          <img src="/farm/packaging-1.jpg" alt="Mango King premium packaging" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            on:error={(e) => {
              e.currentTarget.parentElement.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#F2EBD9] to-[#E6D9C0]">
                  <svg viewBox="0 0 100 120" class="w-20 h-20" fill="none">
                    <ellipse cx="50" cy="90" rx="44" ry="36" fill="#C8922A" opacity="0.3"/>
                    <path d="M50 8C38 34 22 44 28 72C34 94 50 112 50 112C50 112 66 94 72 72C78 44 62 34 50 8Z" fill="#C8922A" opacity="0.5"/>
                  </svg>
                  <p class="font-body text-sm text-[#1E0F06]/40">Add /farm/packaging-1.jpg to your static folder</p>
                </div>`;
            }}/>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-2xl overflow-hidden bg-[#F2EBD9] aspect-square">
            <img src="/farm/packaging-2.jpg" alt="Box design detail" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              on:error={(e) => { e.currentTarget.parentElement.style.background='linear-gradient(135deg,#F2EBD9,#E6D9C0)'; e.currentTarget.remove(); }}/>
          </div>
          <div class="rounded-2xl overflow-hidden bg-[#F2EBD9] aspect-square">
            <img src="/farm/packaging-3.jpg" alt="Mango in padded cell" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              on:error={(e) => { e.currentTarget.parentElement.style.background='linear-gradient(135deg,#E6D9C0,#F2EBD9)'; e.currentTarget.remove(); }}/>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ━━━ VALUES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#1E0F06] py-20 md:py-28 px-5 md:px-10 relative overflow-hidden">
  <div class="absolute inset-0 opacity-30" style="background:radial-gradient(ellipse 60% 80% at 100% 50%, rgba(200,146,42,0.2), transparent)"></div>
  <div class="max-w-[1320px] mx-auto relative">
    <div class="text-center mb-14 reveal">
      <p class="label-tag justify-center mb-5 text-[#C8922A]">What We Stand For</p>
      <h2 class="font-display text-4xl md:text-5xl text-white">Our Values</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-6">
      {#each [
        { num:'01', title:'Never Compromise Quality', body:'We reject 30–40% of every harvest. Mangoes that don\'t meet our grade go to the local market. What ships to you is the best of the best.' },
        { num:'02', title:'Farmer First, Always',      body:'Every tree on our farm is tended by our own team. We pay fair wages and provide housing. Happy farmers grow better mangoes.' },
        { num:'03', title:'Honest About Everything',   body:'No fake GI tags. No "Alphonso blend" cheats. No corporate spin. If there\'s a crop issue, we tell you. Our reviews reflect this honesty.' },
      ] as v, i}
        <div class="reveal reveal-delay-{i+1} border border-white/8 rounded-2xl p-7 hover:border-[#C8922A]/40 hover:bg-white/3 transition-all duration-300">
          <p class="font-display text-5xl text-[#C8922A]/20 leading-none mb-5 font-semibold">{v.num}</p>
          <h3 class="font-display text-2xl text-white mb-4">{v.title}</h3>
          <p class="font-body text-sm text-white/50 leading-relaxed">{v.body}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ━━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<section class="bg-[#C8922A] py-16 px-5 md:px-10">
  <div class="max-w-2xl mx-auto text-center reveal">
    <h2 class="font-display text-4xl md:text-5xl text-white mb-4">Ready to Taste the Difference?</h2>
    <p class="font-body text-white/70 text-base mb-8">Order from this season's harvest — picked at peak, packed same day, at your door tomorrow.</p>
    <div class="flex flex-wrap gap-4 justify-center">
      <a href="/categories" class="btn-dark">
        <Icon name="cart" size={18} strokeWidth={2} color="white"/>
        Shop This Season
      </a>
      <a href="/contact-us" class="btn-white">
        <Icon name="phone" size={18} strokeWidth={2} color="#1E0F06"/>
        Get in Touch
      </a>
    </div>
  </div>
</section>
