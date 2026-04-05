<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
</script>
<div style="font-family:'Nunito',system-ui,sans-serif;min-height:100vh;background:#FBF8F2;display:flex;align-items:center;justify-content:center;padding:1.5rem;">
  <div style="text-align:center;max-width:420px;">
    <div style="width:80px;height:80px;background:#FBF4E6;border-radius:24px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;border:2px solid rgba(200,146,42,0.2);">
      <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#C8922A" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
    </div>
    <h1 style="font-family:'Playfair Display',serif;font-size:3rem;font-weight:600;color:#1E0F06;margin-bottom:0.5rem;">{$page.status}</h1>
    <h2 style="font-size:1.25rem;font-weight:700;color:#1E0F06;margin-bottom:0.75rem;">{$page.status===404?'Page Not Found':'Something Went Wrong'}</h2>
    <p style="color:rgba(30,15,6,0.5);margin-bottom:2rem;font-size:0.9rem;">{$page.error?.message||'An unexpected error occurred.'}</p>
    <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
      <button onclick="history.back()" style="padding:12px 24px;background:white;border:2px solid #E6D9C0;border-radius:100px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">← Go Back</button>
      <button onclick="location.href='/'" style="padding:12px 24px;background:#C8922A;color:white;border:none;border-radius:100px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;box-shadow:0 4px 16px rgba(200,146,42,0.4);">Go Home</button>
    </div>
  </div>
</div>
