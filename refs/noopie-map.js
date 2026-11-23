/* Noopie — vraie carte (MapLibre GL + tuiles OpenFreeMap, sans clé).
   Positions de DÉMONSTRATION : à remplacer par l'API du médaillon. */
(function () {
  const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const HOME = [2.3772, 48.8786];
  const PETS = {
    dog: { name: 'Nougat', img: 'refs/portrait-dog.jpg', pos: [2.3842, 48.8803], color: '#1F6FEB' },
    cat: { name: 'Ziggy', img: 'refs/portrait-cat.jpg', pos: [2.3775, 48.8788], color: '#C9A27E' },
  };
  const ROUTE = [HOME, [2.3781, 48.8783], [2.3794, 48.8779], [2.3808, 48.8781], [2.3822, 48.8786], [2.3833, 48.8792], [2.3840, 48.8798], PETS.dog.pos];
  // Noopie à proximité (démo). Une app réelle reçoit ces positions arrondies (~100 m) depuis le serveur.
  const NEAR = window.NP_NEAR || [
    { id: 'a', sp: 'dog', pos: [2.3810, 48.8780] }, { id: 'b', sp: 'cat', pos: [2.3758, 48.8772] },
    { id: 'c', sp: 'dog', pos: [2.3864, 48.8790] }, { id: 'd', sp: 'dog', pos: [2.3822, 48.8826] }];
  const dist = (a, b) => { const R = 6371000, r = Math.PI / 180, dLa = (b[1] - a[1]) * r, dLo = (b[0] - a[0]) * r;
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const fmt = m => m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
  const nearLabel = (n, from) => (n.friend ? `${n.friend} · ` : (n.sp === 'cat' ? 'Chat · ' : 'Chien · ')) + fmt(dist(from, n.pos));

  function circle(center, meters, n = 72) {
    const [lng, lat] = center, out = [];
    const dLat = meters / 111320, dLng = meters / (111320 * Math.cos(lat * Math.PI / 180));
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; out.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]); }
    return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [out] } };
  }
  function petMarker(p, cls = '') {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'ml-pin ' + cls; el.style.background = p.color; el.setAttribute('aria-label', p.name);
    el.innerHTML = `<img src="${p.img}" alt="">`;
    return el;
  }
  function nearMarker(n, from) {
    const el = document.createElement('div'); el.className = 'ml-near' + (n.friend ? ' friend' : '') + (n.sp === 'cat' ? ' cat' : '');
    el.innerHTML = n.friend && n.img ? `<i><img src="${n.img}" alt=""></i><b>${nearLabel(n, from)}</b>` : `<i></i><b>${nearLabel(n, from)}</b>`; return el;
  }
  const maps = [];
  function make(host, opts) {
    if (!window.maplibregl || host.dataset.ml) return null;
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) return null;
    host.dataset.ml = '1';
    const box = document.createElement('div'); box.className = 'ml-box'; host.prepend(box);
    const map = new maplibregl.Map({ container: box, style: STYLE, center: opts.center || [2.3805, 48.8795], zoom: opts.zoom || 15.2, attributionControl: { compact: true }, cooperativeGestures: !!opts.coop });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('load', () => {
      host.classList.add('is-live');
      if (opts.zone !== false) {
        map.addSource('zone', { type: 'geojson', data: circle(HOME, opts.radius || 150) });
        map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zone', paint: { 'fill-color': '#1F6FEB', 'fill-opacity': 0.12 } });
        map.addLayer({ id: 'zone-line', type: 'line', source: 'zone', paint: { 'line-color': '#1F6FEB', 'line-width': 2, 'line-dasharray': [2, 2] } });
      }
      if (opts.route !== false) {
        map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: ROUTE } } });
        map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': 8 } });
        map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#1F6FEB', 'line-width': 5 } });
      }
      const mk = {};
      for (const k of opts.pets || ['dog', 'cat']) {
        const el = petMarker(PETS[k], k);
        el.addEventListener('click', () => host.dispatchEvent(new CustomEvent('np-pet', { detail: k, bubbles: true })));
        mk[k] = new maplibregl.Marker({ element: el }).setLngLat(PETS[k].pos).addTo(map);
      }
      const near = [], from = PETS.dog.pos;
      if (opts.near) {
        map.addSource('near-r', { type: 'geojson', data: circle(from, 500) });
        map.addLayer({ id: 'near-r-fill', type: 'fill', source: 'near-r', paint: { 'fill-color': '#7FA6E8', 'fill-opacity': 0.07 } });
        map.addLayer({ id: 'near-r-line', type: 'line', source: 'near-r', paint: { 'line-color': '#7FA6E8', 'line-width': 1.5, 'line-dasharray': [1, 2] } });
        for (const n of NEAR) { const m = new maplibregl.Marker({ element: nearMarker(n, from) }).setLngLat(n.pos).addTo(map); m._n = n; m._d = dist(from, n.pos); near.push(m); }
      }
      host._np = { map, mk, near, setRadius(r) { map.getSource('zone') && map.getSource('zone').setData(circle(HOME, r)); },
        focus(k) { if (k === 'all') { map.fitBounds([[2.3750, 48.8768], [2.3870, 48.8830]], { padding: 60, duration: 700 }); }
          else { map.flyTo({ center: PETS[k].pos, zoom: 16, duration: 700 }); }
          for (const [kk, m] of Object.entries(mk)) m.getElement().style.opacity = (k === 'all' || kk === k) ? 1 : 0.4; },
        showNear(v) { this.setNear({ show: v }); },
        nearCfg: { show: true, radius: 500, dog: true, cat: true, friends: false },
        setNear(c) { Object.assign(this.nearCfg, c); const k = this.nearCfg;
          near.forEach(m => { const ok = k.show && k[m._n.sp] && m._d <= k.radius && (!k.friends || !!m._n.friend); m.getElement().style.display = ok ? '' : 'none'; });
          if (map.getSource('near-r')) { map.getSource('near-r').setData(circle(from, k.radius));
            ['near-r-fill', 'near-r-line'].forEach(l => map.setLayoutProperty(l, 'visibility', k.show ? 'visible' : 'none')); } } };
      host.dispatchEvent(new CustomEvent('np-map-ready', { bubbles: true }));
    });
    maps.push(map);
    return map;
  }
  function boot() {
    document.querySelectorAll('[data-realmap]').forEach(host => {
      const o = JSON.parse(host.dataset.realmap || '{}');
      const go = () => { if (host.offsetParent !== null) { make(host, o); return true; } return false; };
      if (!go()) {
        const obs = new MutationObserver(() => { if (go()) obs.disconnect(); });
        let p = host; while (p && !p.matches('section[data-view]')) p = p.parentElement;
        if (p) obs.observe(p, { attributes: true, attributeFilter: ['hidden'] });
        obs.observe(document.getElementById('app') || document.body, { attributes: true, attributeFilter: ['hidden'] });
      }
    });
  }
  window.addEventListener('resize', () => maps.forEach(m => m.resize()));
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
  window.NoopieMap = { boot, PETS, NEAR, dist, fmt };
})();
