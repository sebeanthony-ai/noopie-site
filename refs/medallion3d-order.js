// Noopie — médaillon 3D à 360° pour la page de commande (three.js), aux couleurs choisies.
const CDN = new URL('./vendor/three', import.meta.url).href;

async function boot() {
  const test = document.createElement('canvas');
  if (!(test.getContext('webgl2') || test.getContext('webgl'))) return;
  const THREE = await import(`${CDN}/three.module.js`);
  const { RoomEnvironment } = await import(`${CDN}/RoomEnvironment.js`);
  const { SVGLoader } = await import(`${CDN}/SVGLoader.js`);

  const wrap = document.createElement('div'); wrap.className = 'np3d';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'Médaillon Noopie en 3D : glissez pour le faire tourner à 360°');
  canvas.tabIndex = 0; wrap.appendChild(canvas);
  const hint = document.createElement('span'); hint.className = 'np3d-hint';
  hint.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14.5-4.6M20 12a8 8 0 0 1-14.5 4.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 3v4.4h-4.4M5.5 21v-4.4h4.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Glissez pour faire tourner · 360°';
  wrap.appendChild(hint);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  cam.position.set(0, 0.25, 7.6); cam.lookAt(0, 0.25, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe6f2, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff3e6, 0.8); rim.position.set(4, 2, -5); scene.add(rim);
  const COLORS = { bleu: { body: 0x1E4FC4, paw: 0xF4EBDD } };
  const S = 1 / 96;
  const sil = new THREE.MeshPhysicalMaterial({ color: COLORS.bleu.body, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.55, sheen: 0.35, sheenColor: 0xffffff });
  const pawMat = new THREE.MeshPhysicalMaterial({ color: COLORS.bleu.paw, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.4 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xdde1e6, metalness: 1, roughness: 0.18 });

  const shapesFrom = d => new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths.flatMap(p => SVGLoader.createShapes(p));
  const extrude = (shapes, depth, bevel, mat) => {
    const g = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 64 });
    g.scale(S, -S, -S);
    g.translate(0, 0, (depth + bevel) * S);
    return new THREE.Mesh(g, mat);
  };

  const medal = new THREE.Group();
  const TH = 0.3;
  { // disque silicone, bord arrondi
    const R = 1, rr = 0.13, pts = [new THREE.Vector2(0, -TH / 2)];
    for (let i = 0; i <= 20; i++) { const a = -Math.PI / 2 + (i / 20) * Math.PI; pts.push(new THREE.Vector2(R - rr + Math.cos(a) * rr, Math.sin(a) * (TH / 2))); }
    pts.push(new THREE.Vector2(0, TH / 2));
    const g = new THREE.LatheGeometry(pts, 160); g.rotateX(Math.PI / 2);
    medal.add(new THREE.Mesh(g, sil));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.02, 16, 160), sil); ring.position.z = TH / 2 - 0.005; medal.add(ring);
  }
  { // attache avec trou
    const sh = new THREE.Shape(); sh.moveTo(-26, -78); sh.lineTo(-26, -104); sh.absarc(0, -104, 26, Math.PI, 2 * Math.PI, false); sh.lineTo(26, -78); sh.lineTo(-26, -78);
    const hole = new THREE.Path(); hole.absarc(0, -108, 9, 0, Math.PI * 2, true); sh.holes.push(hole);
    const tab = extrude([sh], 14, 5, sil); tab.position.z = -0.125; medal.add(tab);
    const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 32, 120), steel);
    ringM.position.set(0, 108 * S + 0.24, 0); ringM.rotation.y = Math.PI / 2; medal.add(ringM);
    const ring2 = ringM.clone(); ring2.position.x = 0.03; ring2.rotation.y = Math.PI / 2 + 0.12; medal.add(ring2);
  }
  { // patte en relief (face)
    const paw = new THREE.Group();
    for (const [x, y, rx, ry, rot] of [[-30, -14, 11, 14, -22], [-11, -34, 11, 14.5, 0], [11, -34, 11, 14.5, 0], [30, -14, 11, 14, 22]]) {
      const sh = new THREE.Shape(); sh.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
      const m = extrude([sh], 6, 4, pawMat); m.position.set(x * S, -y * S, 0); m.rotation.z = THREE.MathUtils.degToRad(-rot); paw.add(m);
    }
    paw.add(extrude(shapesFrom('M0 -8c-15 0-31 15-31 29 0 13 12 15 20 13 4-1 7-3 11-3s7 2 11 3c8 2 20 0 20-13 0-14-16-29-31-29Z'), 6, 4, pawMat));
    paw.position.set(0, -0.08, TH / 2 - 0.02); paw.scale.set(1.28, 1.28, 1.1); medal.add(paw);
  }
  { // QR au dos
    const tex = await new THREE.TextureLoader().loadAsync(new URL('med/qr-disc.png', import.meta.url).href);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const qr = new THREE.Mesh(new THREE.CircleGeometry(0.72, 128), new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }));
    qr.position.z = -TH / 2 - 0.004; qr.rotation.y = Math.PI; medal.add(qr);
  }
  medal.position.y = 0.05;
  scene.add(medal);

  let rotY = -0.5, rotX = 0.08, vel = 0, drag = false, lastX = 0, lastY = 0, idle = 0, dirty = true, host = null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  canvas.addEventListener('pointerdown', e => { drag = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); hint.classList.add('is-used'); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; vel = dx * 0.012; rotY += vel; rotX = Math.max(-0.5, Math.min(0.5, rotX + dy * 0.006)); idle = 0; dirty = true; });
  const up = () => { drag = false; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { rotY -= 0.3; dirty = true; } if (e.key === 'ArrowRight') { rotY += 0.3; dirty = true; } });
  const resize = () => { if (!host) return; const r = wrap.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); dirty = true; };
  new ResizeObserver(resize).observe(wrap);
  let t0 = performance.now();
  const loop = t => { const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
    if (host) { if (!drag) { idle += dt; if (Math.abs(vel) > 0.0005) { rotY += vel; vel *= 0.94; dirty = true; } else if (!reduce && idle > 1.2) { rotY += dt * 0.7; dirty = true; } rotX += (0.08 - rotX) * Math.min(1, dt * 2); }
      if (dirty) { medal.rotation.set(rotX, rotY, 0); medal.position.y = 0.05 + Math.sin(t / 900) * (reduce ? 0 : 0.03); renderer.render(scene, cam); } }
    requestAnimationFrame(loop); };
  requestAnimationFrame(loop);

  window.NoopieMed3D = {
    show(target, body, paw) {
      if (wrap.parentNode !== target) { host = target; target.appendChild(wrap); target.classList.add('is-3d'); resize(); }
      sil.color.set(body); pawMat.color.set(paw); dirty = true;
      wrap.classList.remove('pop'); void wrap.offsetWidth; wrap.classList.add('pop');
    }
  };
  document.dispatchEvent(new CustomEvent('np3d-ready'));
}
boot().catch(err => console.warn('[noopie 3D commande]', err));
