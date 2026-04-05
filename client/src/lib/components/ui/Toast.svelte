<script lang="ts">
  import { toasts } from '$lib/stores';
  import { fly } from 'svelte/transition';
  import Icon from './Icon.svelte';
  const iconMap: Record<string,string> = { success:'checkCircle', error:'xCircle', warning:'warning', info:'info' };
  const styles: Record<string,string> = {
    success: 'bg-[#173422]/95 border-[#255C38]/40',
    error:   'bg-[#5C1A1A]/95 border-red-400/30',
    warning: 'bg-[#3D1F0E]/95 border-[#C8922A]/30',
    info:    'bg-[#1E0F06]/95 border-white/15',
  };
  const iconColor: Record<string,string> = { success:'#86efac', error:'#fca5a5', warning:'#E5B858', info:'#93c5fd' };
</script>

<div class="fixed top-5 right-5 z-[200] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
  {#each $toasts as t (t.id)}
    <div class="flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl text-white pointer-events-auto shadow-elevated {styles[t.type]}"
      in:fly={{ x:320, duration:350 }} out:fly={{ x:320, duration:200 }}>
      <div class="shrink-0 mt-0.5">
        <Icon name={iconMap[t.type]} size={18} strokeWidth={2} color={iconColor[t.type]}/>
      </div>
      <p class="font-body text-[13px] font-500 leading-snug flex-1">{t.message}</p>
      <button on:click={() => toasts.remove(t.id)} aria-label="Dismiss"
        class="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors text-white/50 hover:text-white mt-0.5">
        <Icon name="close" size={11} strokeWidth={2.5} color="currentColor"/>
      </button>
    </div>
  {/each}
</div>
