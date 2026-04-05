<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let categories: any[] = [], saving = false;
  let previews: string[] = [], files: File[] = [], variants: any[] = [];
  let form = { name:'',slug:'',description:'',categoryId:'',mrp:'',discountPrice:'',stock:'',sku:'',isFeatured:'false',isTrending:'false',isNewLaunch:'false',tags:'' };

  onMount(async () => { categories = await api.get<any[]>('/api/categories').catch(()=>[]); });

  const autoSlug = () => { form.slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); };
  const addVariant = () => { variants=[...variants,{label:'',quantity:'',unit:'kg',mrp:'',price:'',stock:''}]; };
  const removeVariant = (i: number) => { variants=variants.filter((_,idx)=>idx!==i); };

  function handleImages(e: Event) {
    Array.from((e.target as HTMLInputElement).files||[]).forEach(f => {
      files=[...files,f];
      const r=new FileReader(); r.onload=ev=>{previews=[...previews,ev.target?.result as string];}; r.readAsDataURL(f);
    });
  }

  async function submit() {
    if (!form.name||!form.categoryId||!form.mrp) { toasts.error('Fill required fields'); return; }
    saving=true;
    try {
      const fd=new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,String(v)));
      fd.append('variants',JSON.stringify(variants));
      files.forEach(f=>fd.append('images',f));
      const base = import.meta.env.PUBLIC_API_URL||'';
      const token = typeof window!=='undefined'?localStorage.getItem('auth_token'):'';
      const res=await fetch(`${base}/api/products`,{method:'POST',body:fd,headers:{Authorization:`Bearer ${token||''}`}});
      if(res.ok){toasts.success('Product created!');goto('/admin/products');}
      else{const err=await res.json();toasts.error(err.error||'Failed');}
    }catch{toasts.error('Network error');}
    saving=false;
  }
</script>

<svelte:head><title>New Product — Admin | Mango King</title></svelte:head>

<div class="mb-6 flex items-center gap-3">
  <button on:click={() => goto('/admin/products')} class="flex items-center gap-2 font-body text-sm font-700 text-[#1E0F06]/50 hover:text-[#C8922A] transition-colors">
    <Icon name="back" size={16} strokeWidth={2} color="currentColor"/> Products
  </button>
  <span class="text-[#E6D9C0]">/</span>
  <h1 class="font-display text-2xl text-[#1E0F06]">Add New Product</h1>
</div>

<div class="grid lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2 space-y-5">
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6">
      <h2 class="font-body font-800 text-[#1E0F06] mb-5">Basic Information</h2>
      <div class="space-y-4">
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Product Name *</label><input type="text" bind:value={form.name} on:blur={autoSlug} class="input" placeholder="e.g. Alphonso Mango Gift Box"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">URL Slug</label><input type="text" bind:value={form.slug} class="input font-mono text-sm"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Description</label><textarea bind:value={form.description} rows="3" class="input resize-none" placeholder="Describe the product…"></textarea></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">SKU</label><input type="text" bind:value={form.sku} class="input" placeholder="MK-001"/></div>
          <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Category *</label>
            <select bind:value={form.categoryId} class="input"><option value="">Select…</option>{#each categories as c}<option value={c.id}>{c.name}</option>{/each}</select>
          </div>
        </div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label><input type="text" bind:value={form.tags} class="input" placeholder="alphonso, premium, gift"/></div>
      </div>
    </div>
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6">
      <h2 class="font-body font-800 text-[#1E0F06] mb-5">Pricing & Stock</h2>
      <div class="grid grid-cols-3 gap-4">
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">MRP (₹) *</label><input type="number" bind:value={form.mrp} class="input" placeholder="1200"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Selling Price (₹)</label><input type="number" bind:value={form.discountPrice} class="input" placeholder="999"/></div>
        <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Stock *</label><input type="number" bind:value={form.stock} class="input" placeholder="50"/></div>
      </div>
    </div>
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-body font-800 text-[#1E0F06]">Variants</h2>
        <button on:click={addVariant} class="btn-ghost btn-sm"><Icon name="plus" size={14} strokeWidth={2.5} color="currentColor"/>Add Variant</button>
      </div>
      {#if variants.length === 0}
        <div class="text-center py-8 border-2 border-dashed border-[#E6D9C0] rounded-xl">
          <p class="font-body text-sm text-[#1E0F06]/40">No variants — uses base price.</p>
          <button on:click={addVariant} class="font-body text-sm font-700 text-[#C8922A] mt-2 hover:underline">+ Add first variant</button>
        </div>
      {:else}
        <div class="space-y-3">
          {#each variants as v, i}
            <div class="flex gap-2 items-start bg-[#FBF8F2] rounded-xl p-3 border border-[#E6D9C0]">
              <div class="grid grid-cols-3 gap-2 flex-1">
                <div><label class="font-body text-[10px] font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Label</label><input type="text" bind:value={v.label} placeholder="1 kg" class="input text-sm py-2"/></div>
                <div><label class="font-body text-[10px] font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">MRP (₹)</label><input type="number" bind:value={v.mrp} class="input text-sm py-2"/></div>
                <div><label class="font-body text-[10px] font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Price (₹)</label><input type="number" bind:value={v.price} class="input text-sm py-2"/></div>
                <div><label class="font-body text-[10px] font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Qty</label><input type="number" bind:value={v.quantity} class="input text-sm py-2"/></div>
                <div><label class="font-body text-[10px] font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Unit</label><select bind:value={v.unit} class="input text-sm py-2"><option>kg</option><option>g</option><option>piece</option><option>dozen</option><option>box</option></select></div>
                <div><label class="font-body text-[10px] font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1 block">Stock</label><input type="number" bind:value={v.stock} class="input text-sm py-2"/></div>
              </div>
              <button on:click={() => removeVariant(i)} aria-label="Remove variant"
                class="mt-5 w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                <Icon name="close" size={13} strokeWidth={2.5} color="#ef4444"/>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="space-y-5">
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
      <h2 class="font-body font-800 text-[#1E0F06] mb-4">Product Images</h2>
      <label class="cursor-pointer block">
        <div class="border-2 border-dashed border-[#C8922A]/30 hover:border-[#C8922A]/60 hover:bg-[#FBF4E6] rounded-xl p-6 text-center transition-all">
          <Icon name="upload" size={28} strokeWidth={1.5} color="#C8922A"/>
          <p class="font-body font-700 text-sm text-[#C8922A] mt-2">Upload Images</p>
          <p class="font-body text-xs text-[#1E0F06]/40 mt-1">PNG, JPG up to 5MB</p>
        </div>
        <input type="file" accept="image/*" multiple on:change={handleImages} class="hidden"/>
      </label>
      {#if previews.length > 0}
        <div class="grid grid-cols-3 gap-2 mt-3">
          {#each previews as p, i}
            <div class="relative aspect-square rounded-xl overflow-hidden bg-[#F2EBD9]">
              <img src={p} alt="" class="w-full h-full object-cover"/>
              {#if i===0}<div class="absolute top-1 left-1 badge badge-gold font-body text-[9px]">Primary</div>{/if}
              <button on:click={() => { previews=previews.filter((_,idx)=>idx!==i); files=files.filter((_,idx)=>idx!==i); }}
                class="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600">
                <Icon name="close" size={10} strokeWidth={2.5} color="white"/>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-5">
      <h2 class="font-body font-800 text-[#1E0F06] mb-3">Product Flags</h2>
      {#each [['isFeatured','Featured','Show on homepage'],['isTrending','Trending','Show in trending'],['isNewLaunch','New Launch','Show in new arrivals']] as [key, label, desc]}
        <label class="flex items-start gap-3 cursor-pointer mb-3 last:mb-0">
          <input type="checkbox" checked={form[key]==='true'} on:change={e => { form[key]=(e.currentTarget.checked).toString(); }} class="mt-0.5 w-4 h-4 accent-[#C8922A] rounded"/>
          <div><p class="font-body font-700 text-sm text-[#1E0F06]">{label}</p><p class="font-body text-xs text-[#1E0F06]/40">{desc}</p></div>
        </label>
      {/each}
    </div>

    <button on:click={submit} disabled={saving} class="btn-primary w-full justify-center py-4 text-base">
      {#if saving}<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>Creating…{:else}<Icon name="plus" size={18} strokeWidth={2} color="white"/>Create Product{/if}
    </button>
  </div>
</div>
