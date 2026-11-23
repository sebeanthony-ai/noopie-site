/* Noopie — vraies cartes dans les maquettes d'iPhone (MapLibre + OpenFreeMap).
   Positions de démonstration ; non interactives pour garder l'effet « capture d'écran ». */
(function () {
  if (window.__npMiniBooted) return; window.__npMiniBooted = true;
  const base = (document.currentScript && document.currentScript.src) || location.href;
  const url = p => new URL(p, base).href;
  const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const HOME = [2.3772, 48.8786];
  const PETS = { dog: { img: 'portrait-dog.jpg', pos: [2.3842, 48.8803], color: '#1F6FEB' }, cat: { img: 'portrait-cat.jpg', pos: [2.3775, 48.8788], color: '#C9A27E' } };
  const ROUTE = [HOME, [2.3781, 48.8783], [2.3794, 48.8779], [2.3808, 48.8781], [2.3822, 48.8786], [2.3833, 48.8792], [2.3840, 48.8798], PETS.dog.pos];
  const NEAR = [[2.3810, 48.8780], [2.3758, 48.8772], [2.3864, 48.8790], [2.3822, 48.8826]];
  const circle = (c, m, n = 64) => { const o = [], dLa = m / 111320, dLo = m / (111320 * Math.cos(c[1] * Math.PI / 180)); for (let i = 0; i <= n; i++) { const a = i / n * 2 * Math.PI; o.push([c[0] + dLo * Math.cos(a), c[1] + dLa * Math.sin(a)]); } return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [o] } }; };
  function loadLib() {
    if (window.maplibregl) return Promise.resolve();
    return new Promise((res, rej) => {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = url('vendor/maplibre/maplibre-gl.css'); document.head.appendChild(l);
      const s = document.createElement('script'); s.src = url('vendor/maplibre/maplibre-gl.js'); s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  const st = document.createElement('style');
  st.textContent = `.np-mm,.np-mm.maplibregl-map{position:absolute!important;inset:0;z-index:0;overflow:hidden;border-radius:inherit;background:#E9EEF4;opacity:0;transition:opacity .4s}
.np-mm.ok{opacity:1}
.np-mm .maplibregl-ctrl-attrib{font-size:7px;padding:0 4px;background:rgba(255,255,255,.7)}
.np-mm .maplibregl-ctrl-attrib-button{display:none}
.np-mm-pin{width:34px;height:34px;border-radius:50%;padding:2px;box-shadow:0 4px 10px rgba(0,0,0,.3)}
.np-mm-pin img{width:100%;height:100%;border-radius:50%;display:block}
.np-mm-red{width:16px;height:16px;border-radius:50%;background:#FF3B30;border:3px solid #fff;box-shadow:0 0 0 8px rgba(255,59,48,.25)}
.np-mm-near{width:12px;height:12px;border-radius:50%;background:#7FA6E8;border:2.5px solid #fff;box-shadow:0 0 0 5px rgba(127,166,232,.28)}`;
  document.head.appendChild(st);
  function el(cls, html) { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; return d; }
  function make(box) {
    const o = JSON.parse(box.dataset.minimap || '{}');
    const pet = PETS[o.pet || 'dog'];
    const map = new maplibregl.Map({ container: box, style: STYLE, center: o.center || pet.pos, zoom: o.zoom || 15.4, interactive: false, attributionControl: { compact: true }, fadeDuration: 0 });
    map.on('load', () => {
      if (o.zone) {
        map.addSource('z', { type: 'geojson', data: circle(o.zoneAt || HOME, o.zone) });
        map.addLayer({ id: 'zf', type: 'fill', source: 'z', paint: { 'fill-color': '#1F6FEB', 'fill-opacity': .16 } });
        map.addLayer({ id: 'zl', type: 'line', source: 'z', paint: { 'line-color': '#1F6FEB', 'line-width': 2 } });
      }
      if (o.route) {
        map.addSource('r', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: ROUTE } } });
        map.addLayer({ id: 'rc', type: 'line', source: 'r', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': 7 } });
        map.addLayer({ id: 'rl', type: 'line', source: 'r', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1F6FEB', 'line-width': 4.5 } });
      }
      if (o.near) for (const p of NEAR) new maplibregl.Marker({ element: el('np-mm-near') }).setLngLat(p).addTo(map);
      if (o.red) new maplibregl.Marker({ element: el('np-mm-red') }).setLngLat(pet.pos).addTo(map);
      else if (o.pin !== false) { const m = el('np-mm-pin', `<img src="${url(pet.img)}" alt="">`); m.style.background = pet.color; new maplibregl.Marker({ element: m }).setLngLat(o.pinAt || pet.pos).addTo(map); }
      if (o.offsetY) map.panBy([0, o.offsetY], { duration: 0 });
      box.classList.add('ok'); box.parentElement.classList.add('mm-live');
    });
    map.on('error', () => {});
    new ResizeObserver(() => map.resize()).observe(box);
  }
  function scan() {
    document.querySelectorAll('[data-minimap]:not([data-mm-done])').forEach(box => {
      if (!box.offsetWidth || !box.offsetHeight) return;
      const r = box.getBoundingClientRect();
      if (r.bottom < -400 || r.top > innerHeight + 400) return;
      box.dataset.mmDone = '1'; make(box);
    });
  }
  const test = document.createElement('canvas');
  if (!(test.getContext('webgl2') || test.getContext('webgl'))) return;
  loadLib().then(() => {
    scan();
    let t; const later = () => { clearTimeout(t); t = setTimeout(scan, 120); };
    addEventListener('scroll', later, { passive: true }); addEventListener('resize', later);
    document.addEventListener('change', later, true); document.addEventListener('click', later, true);
  }).catch(() => {});
})();
