/* Noopie — partage d'un lien sur les réseaux sociaux. */
(function () {
  const ICON = {
    whatsapp: '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2z"/>',
    facebook: '<path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/>',
    x: '<path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.5z"/>',
    telegram: '<path fill="currentColor" d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3z"/>',
    sms: '<path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/>',
    mail: '<path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.3L4 7.2V8l8 5 8-5v-.8z"/>',
    link: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/>',
    tiktok: '<path fill="currentColor" d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7 7 0 0 1-3.9-1.2v6.1A5.8 5.8 0 1 1 10.8 9v3.1a2.8 2.8 0 1 0 2 2.7V3z"/>',
    messenger: '<path fill="currentColor" d="M12 2C6.4 2 2 6.1 2 11.6c0 2.9 1.2 5.4 3.2 7.1V22l3-1.6c1.2.3 2.5.5 3.8.5 5.6 0 10-4.1 10-9.6S17.6 2 12 2zm1 12.9-2.5-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7z"/>',
    more: '<path fill="currentColor" d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z"/>',
  };
  const NETS = [
    ['whatsapp', 'WhatsApp', '#25D366', (u, t) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}`],
    ['facebook', 'Facebook', '#1877F2', (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`],
    ['messenger', 'Messenger', '#0084FF', (u) => /Android|iPhone|iPad/i.test(navigator.userAgent) ? `fb-messenger://share?link=${encodeURIComponent(u)}` : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`],
    ['x', 'X', '#111111', (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`],
    ['telegram', 'Telegram', '#229ED9', (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`],
    ['sms', 'SMS', '#34C759', (u, t) => `sms:?&body=${encodeURIComponent(t + ' ' + u)}`],
    ['mail', 'E-mail', '#5B6475', (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(t + '\n\n' + u)}`],
  ];
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
  function render(host) {
    const url = new URL(host.dataset.shareUrl, location.href).href;
    const text = host.dataset.shareText || document.title;
    let h = '<div class="np-share-row">';
    if (navigator.share) h += `<button type="button" class="np-share-btn" data-native style="--c:#1F6FEB">${svg('more')}<span>Partager…</span></button>`;
    const story = host.dataset.shareImage;
    if (story) {
      h += `<button type="button" class="np-share-btn" data-story="instagram" style="--c:linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF)">${svg('instagram')}<span>Instagram</span></button>`;
      h += `<button type="button" class="np-share-btn" data-story="tiktok" style="--c:#010101">${svg('tiktok')}<span>TikTok</span></button>`;
    }
    for (const [k, label, c, fn] of NETS) h += `<a class="np-share-btn" style="--c:${c}" href="${fn(url, text)}" target="_blank" rel="noopener">${svg(k)}<span>${label}</span></a>`;
    h += `</div><div class="np-share-link"><input readonly value="${url}" aria-label="Lien à partager"><button type="button" data-copy>${svg('link')}Copier le lien</button></div>`;
    host.innerHTML = h;
    host.querySelectorAll('[data-story]').forEach(b => b.onclick = async () => {
      const app = b.dataset.story === 'instagram' ? 'Instagram' : 'TikTok';
      const imgUrl = new URL(story, location.href).href;
      try { await navigator.clipboard.writeText(url); } catch (_) {}
      try {
        const blob = await fetch(imgUrl).then(r => r.blob());
        const file = new File([blob], 'noopie-perdu.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: text + ' ' + url }); return; }
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'noopie-perdu-story.png'; document.body.appendChild(a); a.click(); a.remove();
      } catch (_) {}
      note(`Image de story enregistrée et lien copié : ouvrez ${app}, publiez l’image en story et ajoutez le lien (sticker « Lien »).`);
    });
    const note = m => { let n = host.querySelector('.np-share-note'); if (!n) { n = document.createElement('p'); n.className = 'np-share-note'; host.appendChild(n); } n.textContent = m; };
    const nat = host.querySelector('[data-native]');
    if (nat) nat.onclick = () => navigator.share({ title: text, text, url }).catch(() => {});
    host.querySelector('[data-copy]').onclick = async (e) => {
      const b = e.currentTarget, inp = host.querySelector('input');
      try { await navigator.clipboard.writeText(url); } catch (_) { inp.select(); document.execCommand && document.execCommand('copy'); }
      const t = b.innerHTML; b.textContent = 'Lien copié ✓'; setTimeout(() => (b.innerHTML = t), 1800);
    };
  }
  const css = `.np-share-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.np-share-btn{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:64px;padding:8px 4px;border-radius:14px;border:0;background:none;cursor:pointer;text-decoration:none;color:#26211C;font:800 12px "DM Sans",system-ui,sans-serif}
.np-share-btn svg{width:44px;height:44px;padding:11px;border-radius:50%;background:var(--c);color:#fff;box-shadow:0 6px 14px rgba(0,0,0,.12);transition:transform .15s}
.np-share-btn:hover svg{transform:translateY(-2px)}
.np-share-link{display:flex;gap:8px;margin-top:14px}
.np-share-link input{flex:1;min-width:0;font:600 13px "DM Sans",system-ui,sans-serif;border:1.5px solid #E6ECF5;border-radius:12px;padding:10px 12px;color:#5B544C;background:#F7F9FD}
.np-share-link button{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:12px;padding:0 14px;background:#1F6FEB;color:#fff;font:800 13px "DM Sans",system-ui,sans-serif;cursor:pointer;white-space:nowrap}
.np-share-link button svg{width:16px;height:16px}
.np-share-note{margin:10px 0 0;font:800 12.5px "DM Sans",system-ui,sans-serif;color:#1C9A63;text-align:center;background:#E6F6EE;border-radius:12px;padding:8px 10px}
.np-share-hint{margin:10px 0 0;font:600 12px "DM Sans",system-ui,sans-serif;color:#7A8291;text-align:center}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  window.NoopieShare = { render, renderAll: () => document.querySelectorAll('[data-share-url]').forEach(render) };
  if (document.readyState !== 'loading') window.NoopieShare.renderAll(); else document.addEventListener('DOMContentLoaded', window.NoopieShare.renderAll);
})();
