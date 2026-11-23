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
  const NEAR = [[2.3810, 48.8780, 'Chien · 120 m'], [2.3758, 48.8772, 'Chat · 300 m'], [2.3864, 48.8790, 'Chien · 210 m'], [2.3822, 48.8826, 'Chien · 400 m']];

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
  function nearMarker(label) {
    const el = document.createElement('div'); el.className = 'ml-near'; el.innerHTML = `<i></i><b>${label}</b>`; return el;
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
      const near = [];
      if (opts.near) for (const [lng, lat, l] of NEAR) near.push(new maplibregl.Marker({ element: nearMarker(l) }).setLngLat([lng, lat]).addTo(map));
      host._np = { map, mk, near, setRadius(r) { map.getSource('zone') && map.getSource('zone').setData(circle(HOME, r)); },
        focus(k) { if (k === 'all') { map.fitBounds([[2.3750, 48.8768], [2.3870, 48.8830]], { padding: 60, duration: 700 }); }
          else { map.flyTo({ center: PETS[k].pos, zoom: 16, duration: 700 }); }
          for (const [kk, m] of Object.entries(mk)) m.getElement().style.opacity = (k === 'all' || kk === k) ? 1 : 0.4; },
        showNear(v) { near.forEach(m => m.getElement().style.display = v ? '' : 'none'); } };
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
  window.NoopieMap = { boot, PETS };
})();
