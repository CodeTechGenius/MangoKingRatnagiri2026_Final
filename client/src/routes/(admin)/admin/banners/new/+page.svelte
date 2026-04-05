<script lang="ts">
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores';
  import Icon from '$lib/components/ui/Icon.svelte';

  let form = { title:'', subtitle:'', cta:'Shop Now', link:'/categories', isActive:true };
  let file: File|null=null, preview='', saving=false;

  function handleImage(e: Event) {
    file=(e.target as HTMLInputElement).files?.[0]||null;
    if(file){const r=new FileReader();r.onload=ev=>{preview=ev.target?.result as string;};r.readAsDataURL(file);}
  }

  async function submit() {
    if(!file){toasts.error('Upload a banner image');return;}
    saving=true;
    try{
      const fd=new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,String(v)));
      fd.append('image',file);
      const base=import.meta.env.PUBLIC_API_URL||'';
      const token=typeof window!=='undefined'?localStorage.getItem('auth_token'):'';
      const res=await fetch(`${base}/api/banners`,{method:'POST',body:fd,headers:{Authorization:`Bearer ${token||''}`}});
      if(res.ok){toasts.success('Banner created!');goto('/admin/banners');}
      else{const err=await res.json();toasts.error(err.error||'Failed');}
    }catch{toasts.error('Network error');}
    saving=false;
  }
</script>

<svelte:head><title>New Banner — Admin | Mango King</title></svelte:head>

<div class="mb-6 flex items-center gap-3">
  <button on:click={() => goto('/admin/banners')} class="flex items-center gap-2 font-body text-sm font-700 text-[#1E0F06]/50 hover:text-[#C8922A] transition-colors">
    <Icon name="back" size={16} strokeWidth={2} color="currentColor"/> Banners
  </button>
  <span class="text-[#E6D9C0]">/</span>
  <h1 class="font-display text-2xl text-[#1E0F06]">New Banner</h1>
</div>

<div class="max-w-2xl space-y-5">
  <!-- Image upload -->
  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
    <h2 class="font-body font-800 text-[#1E0F06] mb-4 flex items-center gap-2">
      <Icon name="photo" size={16} strokeWidth={2} color="#C8922A"/> Banner Image *
    </h2>
    {#if preview}
      <div class="relative rounded-xl overflow-hidden mb-3" style="aspect-ratio:16/6">
        <img src={preview} alt="Preview" class="w-full h-full object-cover"/>
        <button on:click={() => {file=null;preview='';}} class="absolute top-2 right-2 w-8 h-8 bg-[#1E0F06]/70 hover:bg-[#1E0F06] rounded-lg flex items-center justify-center transition-colors">
          <Icon name="close" size={14} strokeWidth={2.5} color="white"/>
        </button>
      </div>
    {:else}
      <label class="block cursor-pointer">
        <div class="border-2 border-dashed border-[#C8922A]/30 hover:border-[#C8922A]/60 hover:bg-[#FBF4E6] rounded-xl p-10 text-center transition-all" style="aspect-ratio:16/6;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <Icon name="photo" size={36} strokeWidth={1.3} color="#C8922A"/>
          <p class="font-body font-700 text-sm text-[#C8922A] mt-3">Click to upload banner</p>
          <p class="font-body text-xs text-[#1E0F06]/40 mt-1">Recommended: 1400×500px, JPG/PNG</p>
        </div>
        <input type="file" accept="image/*" on:change={handleImage} class="hidden"/>
      </label>
    {/if}
  </div>

  <!-- Details -->
  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6 space-y-4">
    <h2 class="font-body font-800 text-[#1E0F06]">Banner Details</h2>
    <div>
      <label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Headline</label>
      <input type="text" bind:value={form.title} class="input" placeholder="e.g. Season 2025 Now Open"/>
    </div>
    <div>
      <label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Subtitle</label>
      <input type="text" bind:value={form.subtitle} class="input" placeholder="e.g. Hand-picked Alphonso from Ratnagiri orchards"/>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Button Text</label>
        <input type="text" bind:value={form.cta} class="input" placeholder="Shop Now"/>
      </div>
      <div>
        <label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Link URL</label>
        <input type="text" bind:value={form.link} class="input" placeholder="/categories"/>
      </div>
    </div>
    <label class="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" bind:checked={form.isActive} class="w-4 h-4 accent-[#C8922A]"/>
      <div>
        <p class="font-body font-700 text-sm text-[#1E0F06]">Publish immediately</p>
        <p class="font-body text-xs text-[#1E0F06]/40">Banner will be visible on homepage</p>
      </div>
    </label>
  </div>

  <div class="flex gap-3">
    <button on:click={submit} disabled={saving} class="btn-primary flex-1 justify-center py-4">
      {#if saving}
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>
        Saving…
      {:else}
        <Icon name="save" size={18} strokeWidth={2} color="white"/>
        Create Banner
      {/if}
    </button>
    <button on:click={() => goto('/admin/banners')} class="btn-ghost px-8">Cancel</button>
  </div>
</div>
