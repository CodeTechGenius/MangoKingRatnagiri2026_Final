<script lang="ts">
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let cats: any[] = [], loading = true, adding = false, editingId: string|null = null;
  let form = { name:'', slug:'', description:'' };
  let editForm = { name:'', slug:'', description:'' };

  onMount(async () => { cats = await api.get<any[]>('/api/categories').catch(()=>[]); loading=false; });

  const toSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  async function add() {
    if (!form.name) { toasts.error('Name required'); return; }
    if (!form.slug) form.slug = toSlug(form.name);
    const c = await api.post<any>('/api/categories', form).catch((e:any) => { toasts.error(e.message); return null; });
    if (c) { cats=[...cats,c]; toasts.success('Category created!'); form={name:'',slug:'',description:''}; adding=false; }
  }

  async function saveEdit(id: string) {
    await api.patch<any>(`/api/categories/${id}`, editForm);
    cats = cats.map(c => c.id===id ? {...c,...editForm} : c);
    toasts.success('Updated!'); editingId = null;
  }

  async function del(id: string) {
    if (!confirm('Delete this category?')) return;
    await api.delete<any>(`/api/categories/${id}`).catch((e:any) => toasts.error(e.message));
    cats = cats.filter(c => c.id!==id); toasts.success('Deleted');
  }
</script>

<svelte:head><title>Categories — Admin | Mango King</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div><h1 class="font-display text-3xl text-[#1E0F06]">Categories</h1><p class="font-body text-sm text-[#1E0F06]/45 mt-0.5">{cats.length} categories</p></div>
  <button on:click={() => adding = !adding} class="btn-primary btn-sm">
    <Icon name="plus" size={15} strokeWidth={2.5} color="white"/> Add Category
  </button>
</div>

{#if adding}
  <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] p-6 mb-6 animate-slide-up max-w-lg">
    <h2 class="font-body font-800 text-[#1E0F06] mb-4">New Category</h2>
    <div class="space-y-3">
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Name *</label><input type="text" bind:value={form.name} on:input={() => form.slug = toSlug(form.name)} class="input" placeholder="e.g. Alphonso Mangoes"/></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">URL Slug</label><input type="text" bind:value={form.slug} class="input font-mono text-sm"/></div>
      <div><label class="font-body text-xs font-700 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">Description</label><input type="text" bind:value={form.description} class="input" placeholder="Short description"/></div>
      <div class="flex gap-3">
        <button on:click={add} class="btn-primary btn-sm flex-1">Create</button>
        <button on:click={() => adding=false} class="btn-ghost btn-sm flex-1">Cancel</button>
      </div>
    </div>
  </div>
{/if}

{#if loading}
  <div class="flex justify-center py-12"><div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div></div>
{:else}
  <div class="max-w-2xl space-y-3">
    {#each cats as cat}
      <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] overflow-hidden">
        {#if editingId === cat.id}
          <div class="p-5 space-y-3">
            <input type="text" bind:value={editForm.name} class="input font-800"/>
            <input type="text" bind:value={editForm.slug} class="input font-mono text-sm"/>
            <input type="text" bind:value={editForm.description} class="input text-sm" placeholder="Description"/>
            <div class="flex gap-2">
              <button on:click={() => saveEdit(cat.id)} class="btn-primary btn-sm flex-1">Save</button>
              <button on:click={() => editingId=null} class="btn-ghost btn-sm flex-1">Cancel</button>
            </div>
          </div>
        {:else}
          <div class="flex items-center gap-4 p-4">
            <div class="w-11 h-11 rounded-xl bg-[#C8922A]/10 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="" class="w-3/4 h-3/4 object-contain opacity-30 m-auto" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body font-800 text-sm text-[#1E0F06]">{cat.name}</p>
              <p class="font-body text-xs text-[#1E0F06]/40 font-mono">{cat.slug}</p>
              {#if cat.description}<p class="font-body text-xs text-[#1E0F06]/45 truncate">{cat.description}</p>{/if}
            </div>
            <div class="flex items-center gap-2">
              <button on:click={() => { editingId=cat.id; editForm={name:cat.name,slug:cat.slug,description:cat.description||''}; }}
                class="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Icon name="edit" size={15} strokeWidth={2} color="#2563eb"/>
              </button>
              <button on:click={() => del(cat.id)}
                class="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                <Icon name="trash" size={15} strokeWidth={2} color="#ef4444"/>
              </button>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="bg-white rounded-2xl p-10 text-center shadow-card border border-[#E6D9C0] text-[#1E0F06]/40">
        <Icon name="grid" size={40} strokeWidth={1} color="currentColor"/>
        <p class="font-body text-sm mt-3">No categories yet</p>
      </div>
    {/each}
  </div>
{/if}
