// js/background.js
// Safe multi-layer sacred-geometry + fractal-like galaxy background (no fragile fragment shaders)
// Works with three.js r128 included in pages.

(() => {
  if (typeof THREE === 'undefined') return console.error('Three.js missing. Include r128.');

  // Select canvas
  let canvas = document.getElementById('background-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'background-canvas';
    document.body.appendChild(canvas);
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1.5, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 2000);
  camera.position.z = 160;

  window.addEventListener('resize', ()=> {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // SCALE factor (15% larger)
  const GLOBAL_SCALE = 1.15;

  // === Particle Galaxy Layer ===
  function createParticles(count, size, color) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count*3);
    for (let i=0;i<count;i++){
      const radius = (Math.random()**0.9) * (200 * GLOBAL_SCALE) + 10;
      const ang = Math.random()*Math.PI*2;
      pos[3*i] = Math.cos(ang)*radius;
      pos[3*i+1] = (Math.random()-0.5)*60;
      pos[3*i+2] = Math.sin(ang)*radius;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: size,
      color: color,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    return new THREE.Points(geo, mat);
  }

  const bigStarLayer = createParticles(1800, 1.6, 0xffffff);
  const smallStarLayer = createParticles(900, 1.0, 0xffffff);
  bigStarLayer.rotation.x = 0.02;
  smallStarLayer.rotation.x = -0.01;
  scene.add(bigStarLayer);
  scene.add(smallStarLayer);

  // === Sacred Geometry Rings (flower-like) ===
  const ringGroup = new THREE.Group();
  ringGroup.scale.set(GLOBAL_SCALE, GLOBAL_SCALE, GLOBAL_SCALE);
  scene.add(ringGroup);

  function ring(radius, segments=256) {
    const arr = new Float32Array((segments+1)*3);
    for (let i=0;i<=segments;i++){
      const a = (i/segments)*Math.PI*2;
      arr[3*i] = Math.cos(a)*radius;
      arr[3*i+1] = Math.sin(a)*radius;
      arr[3*i+2] = 0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const m = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    return new THREE.Line(g, m);
  }

  const BASE_R = 16;
  for (let i=0;i<6;i++){
    const r = ring(BASE_R*3.2);
    const theta = (i/6)*Math.PI*2;
    r.position.set(Math.cos(theta)*BASE_R*3.2*0.12, Math.sin(theta)*BASE_R*3.2*0.12, 0);
    ringGroup.add(r);
  }
  const outer = ring(BASE_R*6);
  ringGroup.add(outer);

  // hex grid (line segments)
  function addHexGrid(radius, rings=5) {
    const coords = [];
    const hexSize = radius;
    for (let q=-rings;q<=rings;q++) {
      for (let r=-rings;r<=rings;r++) {
        const x = (Math.sqrt(3)*(q + r/2)) * hexSize * 0.5;
        const y = (1.5 * r) * hexSize * 0.5;
        for (let s=0;s<6;s++){
          const a1 = (s/6)*Math.PI*2;
          const a2 = ((s+1)/6)*Math.PI*2;
          coords.push(x + Math.cos(a1)*hexSize*0.25, y + Math.sin(a1)*hexSize*0.25, 0);
          coords.push(x + Math.cos(a2)*hexSize*0.25, y + Math.sin(a2)*hexSize*0.25, 0);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const lines = new THREE.LineSegments(geo, mat);
    lines.position.z = -1.5;
    ringGroup.add(lines);
  }
  addHexGrid(10, 6);

  // subtle depth tilt
  ringGroup.rotation.x = 0.02;

  // === Animation ===
  let last = performance.now();
  function animate() {
    const now = performance.now();
    const dt = now - last;
    last = now;

    // rotate layers
    bigStarLayer.rotation.y += 0.0004 * (1 + Math.sin(now*0.0002)*0.3);
    smallStarLayer.rotation.y -= 0.00025 * (1 + Math.cos(now*0.00015)*0.2);

    // pulsating rainbow on ringGroup
    ringGroup.children.forEach((ch, idx) => {
      if (ch.material) {
        const hue = (now*0.00008 + idx*0.08) % 1;
        ch.material.color.setHSL(hue, 0.9, 0.6);
        ch.material.opacity = 0.85 - idx*0.03;
      }
    });

    // camera gentle zoom / parallax
    camera.position.z = 150 + 6 * Math.sin(now*0.0002);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // Pause on hidden tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) renderer.setAnimationLoop(null);
    else requestAnimationFrame(animate);
  });

})();
