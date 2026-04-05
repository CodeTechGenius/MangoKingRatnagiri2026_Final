<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';

  export let banners: any[] = [];
  const API = import.meta.env.PUBLIC_API_URL || '';

  let idx = 0, timer: ReturnType<typeof setInterval>, tx = 0, loaded = false;

  const defaults = [
    { title: 'The King of\nMangoes', subtitle: 'Hand-picked Alphonso from century-old orchards in the hills of Ratnagiri', link: '/categories/alphonso-mangoes', cta: 'Shop the Season', image: '' },
  ];
  $: slides = banners.length ? banners : defaults;
  $: src = (img: string) => img ? (img.startsWith('http') ? img : `${API}${img}`) : '';

  const next = () => { idx = (idx + 1) % slides.length; reset(); };
  const prev = () => { idx = (idx - 1 + slides.length) % slides.length; reset(); };
  const reset = () => { clearInterval(timer); timer = setInterval(next, 6000); };
  const onTS  = (e: TouchEvent) => { tx = e.touches[0].clientX; };
  const onTE  = (e: TouchEvent) => { const d = tx - e.changedTouches[0].clientX; if (Math.abs(d) > 50) d > 0 ? next() : prev(); };

  onMount(() => { timer = setInterval(next, 6000); setTimeout(() => loaded = true, 100); });
  onDestroy(() => clearInterval(timer));
</script>

<section class="relative w-full overflow-hidden bg-[#1E0F06]"
  style="height:100svh; min-height:480px;"
  on:touchstart={onTS} on:touchend={onTE}>

  {#each slides as slide, i}
    <!-- Slide -->
    <div class="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out {i === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}">

      <!-- Background image or generated gradient -->
      {#if src(slide.image)}
        <img src={src(slide.image)} alt={slide.title || ''} class="absolute inset-0 w-full h-full object-cover" loading={i===0?'eager':'lazy'}/>
      {:else}
        <!-- Premium gradient background when no image -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#1E0F06] via-[#2C1810] to-[#0D1F14]">
          <!-- Ambient glow blobs -->
          <div class="absolute top-[15%] right-[10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-[#C8922A]/10 blur-[80px]"></div>
          <div class="absolute bottom-[10%] left-[5%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-[#173422]/60 blur-[60px]"></div>
          <div class="absolute top-[40%] left-[45%] w-[20vw] h-[20vw] max-w-[280px] rounded-full bg-[#C8922A]/6 blur-[50px]"></div>
          <!-- Company logo as hero artwork -->
          <div class="absolute right-[4%] md:right-[10%] top-1/2 -translate-y-1/2 float-anim pointer-events-none select-none opacity-[0.18]">
            <img src="/logo.png" alt="Mango King Logo" class="w-44 md:w-64 lg:w-80 object-contain" />
          </div>
          <!-- Grid texture -->
          <div class="absolute inset-0 opacity-[0.04]" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 60px 60px;"></div>
        </div>
      {/if}

      <!-- Dark overlay for text legibility -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#1E0F06]/90 via-[#1E0F06]/55 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#1E0F06]/70 via-transparent to-transparent"></div>

      <!-- Content -->
      <div class="absolute inset-0 flex items-center">
        <div class="w-full max-w-[1320px] mx-auto px-6 md:px-16 lg:px-24">
          <div class="max-w-2xl {i === idx && loaded ? 'animate-fade-up' : 'opacity-0'}">

            <!-- Season tag -->
            <div class="flex items-center gap-3 mb-7" style="animation-delay: 0.1s">
              <div class="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/12 rounded-full px-4 py-2">
                <span class="w-1.5 h-1.5 rounded-full bg-gold animate-[pulseDot_2s_ease_infinite]"></span>
                <span class="font-sans text-[11px] text-white/70 tracking-wider3 uppercase">2025 Season Now Open</span>
              </div>
            </div>

            <!-- Headline -->
            <h1 class="font-serif text-white leading-[1.04] mb-6" style="font-size: clamp(2.8rem, 7vw, 5.5rem); animation-delay: 0.2s">
              {#each (slide.title || 'The King of\nMangoes').split('\n') as line, li}
                {#if li > 0}<br/>{/if}
                {#if li === 1}<span class="text-gold-gradient">{line}</span>{:else}{line}{/if}
              {/each}
            </h1>

            <!-- Subtitle -->
            {#if slide.subtitle}
              <p class="font-sans text-white/55 text-base md:text-lg leading-relaxed mb-10 max-w-xl" style="animation-delay: 0.3s">
                {slide.subtitle}
              </p>
            {/if}

            <!-- CTAs -->
            <div class="flex flex-wrap gap-4" style="animation-delay: 0.4s">
              <button on:click={() => goto(slide.link || '/categories')} class="btn-primary group">
                {slide.cta || 'Shop Now'}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-transform duration-300 group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button on:click={() => goto('/trading')} class="btn-white">
                Today's Price
              </button>
            </div>

            <!-- Trust stats -->
            <div class="flex items-center gap-6 mt-12 pt-10 border-t border-white/10" style="animation-delay: 0.5s">
              {#each [['10K+','Families'], ['GI','Certified'], ['100%','Natural']] as [num, label]}
                <div>
                  <p class="font-serif text-2xl text-gold leading-none">{num}</p>
                  <p class="font-sans text-[11px] text-white/40 tracking-wider2 uppercase mt-1">{label}</p>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/each}

  <!-- Arrows -->
  {#if slides.length > 1}
    <button on:click={prev} class="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/8 hover:bg-white/18 backdrop-blur-sm border border-white/15 items-center justify-center text-white transition-all hover:scale-105">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <button on:click={next} class="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/8 hover:bg-white/18 backdrop-blur-sm border border-white/15 items-center justify-center text-white transition-all hover:scale-105">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  {/if}

  <!-- Dots -->
  {#if slides.length > 1}
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
      {#each slides as _, i}
        <button on:click={() => { idx = i; reset(); }}
          class="rounded-full transition-all duration-500 {i === idx ? 'w-7 h-2 bg-gold' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}"></button>
      {/each}
    </div>
  {/if}

  <!-- Scroll hint -->
  <div class="absolute bottom-8 right-8 z-20 hidden lg:flex flex-col items-center gap-3 opacity-40">
    <div class="w-[1px] h-14 bg-gradient-to-b from-white to-transparent"></div>
    <span class="font-sans text-[10px] text-white tracking-wider3 uppercase writing-mode-vertical" style="writing-mode:vertical-rl; transform:rotate(180deg)">Scroll</span>
  </div>
</section>
