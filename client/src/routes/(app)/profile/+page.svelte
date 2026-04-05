<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authUser, toasts } from '$lib/stores';
  import api from '$lib/api/client';
  import Icon from '$lib/components/ui/Icon.svelte';

  let data: any = null, editing = false, saving = false;
  let name = '', email = '';

  onMount(async () => {
    if (!$authUser) { goto('/login?redirect=/profile'); return; }
    data = await api.get<any>('/api/profile').catch(() => null);
    if (data?.user) {
      name  = data.user.name  || '';
      email = data.user.email || '';
    }
  });

  // Keep form values in sync when data loads
  $: if (data?.user && !editing) {
    name  = data.user.name  || '';
    email = data.user.email || '';
  }

  async function save() {
    if (!name.trim()) { toasts.error('Name cannot be empty'); return; }
    saving = true;
    try {
      const updated = await api.patch<any>('/api/profile', {
        name:  name.trim(),
        email: email.trim() || null,
      });
      // Update local state
      data = { ...data, user: { ...data.user, name: updated.name, email: updated.email } };
      // Update auth store
      authUser.update((prev: any) => prev ? { ...prev, name: updated.name, email: updated.email } : prev);
      toasts.success('Profile updated!');
      editing = false;
    } catch (e: any) {
      toasts.error(e.message || 'Update failed. Try again.');
    }
    saving = false;
  }

  function startEdit() {
    // Pre-fill form with current values
    name  = data?.user?.name  || '';
    email = data?.user?.email || '';
    editing = true;
  }

  function cancelEdit() {
    editing = false;
    name  = data?.user?.name  || '';
    email = data?.user?.email || '';
  }
</script>

<svelte:head><title>My Profile — Mango King Ratnagiri</title></svelte:head>

<div class="max-w-lg mx-auto px-4 py-6">

  <!-- Back button -->
  <button on:click={() => history.length > 1 ? history.back() : goto('/')}
    class="flex items-center gap-2 font-body text-sm font-700 text-[#1E0F06]/50 hover:text-[#C8922A] transition-colors mb-5">
    <Icon name="back" size={16} strokeWidth={2} color="currentColor"/>
    Back
  </button>

  {#if !data}
    <div class="flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-[#C8922A] border-t-transparent rounded-full animate-spin-slow"></div>
    </div>
  {:else}

    <!-- Profile card -->
    <div class="relative bg-[#1E0F06] rounded-3xl p-6 mb-5 overflow-hidden">
      <div class="absolute inset-0 opacity-30" style="background:radial-gradient(ellipse at 100% 0%, rgba(200,146,42,0.5), transparent 60%)"></div>
      <div class="relative flex items-center gap-4">
        <!-- Avatar -->
        <div class="w-16 h-16 rounded-2xl bg-[#C8922A]/20 border-2 border-[#C8922A]/40 flex items-center justify-center shrink-0">
          <span class="font-display text-3xl text-[#C8922A] font-semibold">
            {(data.user?.name || 'U')[0].toUpperCase()}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="font-display text-xl text-white truncate">{data.user?.name || 'Mango Lover'}</h1>
          <p class="font-body text-sm text-white/50 mt-0.5 flex items-center gap-1.5">
            <Icon name="phone" size={13} strokeWidth={2} color="currentColor"/>
            +{data.user?.phone}
          </p>
          {#if data.user?.email}
            <p class="font-body text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
              <Icon name="mail" size={12} strokeWidth={2} color="currentColor"/>
              {data.user.email}
            </p>
          {/if}
          {#if data.user?.role !== 'CUSTOMER'}
            <span class="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-700 bg-[#C8922A]/20 text-[#C8922A] border border-[#C8922A]/30">
              {data.user?.role?.replace('_',' ')}
            </span>
          {/if}
        </div>
        <button on:click={startEdit} aria-label="Edit profile"
          class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
          <Icon name="edit" size={15} strokeWidth={2} color="white"/>
        </button>
      </div>
    </div>

    <!-- Edit form — shown when editing -->
    {#if editing}
      <div class="bg-white rounded-2xl p-5 shadow-card border border-[#E6D9C0] mb-5 animate-slide-up">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-xl text-[#1E0F06]">Edit Profile</h2>
          <button on:click={cancelEdit} aria-label="Cancel"
            class="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F2EBD9] hover:bg-[#E6D9C0] transition-colors">
            <Icon name="close" size={14} strokeWidth={2.5} color="#1E0F06"/>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="font-body text-xs font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">
              Full Name *
            </label>
            <input
              type="text"
              bind:value={name}
              placeholder="Enter your name"
              class="input"
              maxlength="60"
            />
          </div>
          <div>
            <label class="font-body text-xs font-800 text-[#1E0F06]/45 uppercase tracking-wider mb-1.5 block">
              Email Address <span class="font-500 normal-case text-[#1E0F06]/30">(optional)</span>
            </label>
            <input
              type="email"
              bind:value={email}
              placeholder="your@email.com"
              class="input"
            />
          </div>

          <div class="flex gap-3 pt-1">
            <button on:click={save} disabled={saving || !name.trim()}
              class="btn-primary flex-1 justify-center py-3.5 text-sm">
              {#if saving}
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>
                Saving…
              {:else}
                <Icon name="save" size={15} strokeWidth={2} color="white"/>
                Save Changes
              {/if}
            </button>
            <button on:click={cancelEdit}
              class="btn-ghost flex-1 justify-center py-3.5 text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      {#each [
        ['receipt',      'Orders',    data.orderCount    || 0],
        ['checkCircle',  'Delivered', data.deliveredCount|| 0],
        ['phone',        'Addresses', data.addressCount  || 0],
      ] as [icon, label, val]}
        <div class="bg-white rounded-2xl p-4 text-center shadow-card border border-[#E6D9C0]">
          <div class="w-10 h-10 rounded-xl bg-[#C8922A]/10 flex items-center justify-center mx-auto mb-2">
            <Icon name={icon} size={17} strokeWidth={2} color="#C8922A"/>
          </div>
          <p class="font-display text-2xl text-[#1E0F06] leading-none">{val}</p>
          <p class="font-body text-[10px] text-[#1E0F06]/40 uppercase tracking-wider mt-1">{label}</p>
        </div>
      {/each}
    </div>

    <!-- Menu -->
    <div class="bg-white rounded-2xl shadow-card border border-[#E6D9C0] overflow-hidden mb-4">
      {#each [
        ['receipt',  'My Orders',      '/orders'        ],
        ['back',     'Return Policy',  '/return-policy' ],
        ['phone',    'Contact Us',     '/contact-us'    ],
        ['star',     'About Us',       '/about-us'      ],
      ] as [icon, label, href]}
        <button on:click={() => goto(href)}
          class="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-[#FBF4E6] transition-colors border-b border-[#F2EBD9] last:border-0">
          <div class="w-9 h-9 rounded-xl bg-[#F2EBD9] flex items-center justify-center shrink-0">
            <Icon name={icon} size={16} strokeWidth={2} color="#C8922A"/>
          </div>
          <span class="font-body font-600 text-sm text-[#1E0F06] flex-1 text-left">{label}</span>
          <Icon name="chevronR" size={15} strokeWidth={2.5} color="#1E0F06"/>
        </button>
      {/each}

      {#if ['SUPER_ADMIN','OPERATOR'].includes(data.user?.role)}
        <button on:click={() => goto('/admin/dashboard')}
          class="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-[#FBF4E6] transition-colors">
          <div class="w-9 h-9 rounded-xl bg-[#C8922A]/10 flex items-center justify-center shrink-0">
            <Icon name="settings" size={16} strokeWidth={2} color="#C8922A"/>
          </div>
          <span class="font-body font-700 text-sm text-[#C8922A] flex-1 text-left">Admin Panel</span>
          <Icon name="chevronR" size={15} strokeWidth={2.5} color="#C8922A"/>
        </button>
      {/if}
    </div>

    <!-- Sign out -->
    <button on:click={() => { authUser.logout(); goto('/'); }}
      class="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 font-body font-700 text-sm hover:bg-red-100 transition-colors">
      <Icon name="logout" size={16} strokeWidth={2} color="currentColor"/>
      Sign Out
    </button>
  {/if}
</div>
