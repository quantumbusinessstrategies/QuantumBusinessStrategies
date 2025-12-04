// js/background.js
// Layered sacred geometry + fractal-like visual + particle universe
// No custom GLSL shaders — uses Three.js primitives and dynamic HSL color cycling
(() => {
  if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded. Include r128 before this script.');
    return;
  }

  const page = document.body.getAttribute('data-page') || 'home';
  const canvas = document.getElementById('background-canvas');

  const renderer = new THREE.WebGLRenderer({ canvas: canvas || undefined, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1.5, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  if (!canvas) {
    const c = renderer.domElement;
    c.id = 'background-canvas';
    document.body.appendChild(c);
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.z = 320;

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // ---------- Helpers ----------
  function mkLineCircle(radius, segments=256, color=0xffffff, opacity=0.9) {
    const pts = [];
    for (let i=0;i<=segments;i++){
      const a = (i/segments)*Math.PI*2;
      pts.push(new THREE.Vector3(Math.cos(a)*radius, Math.sin(a)*radius, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity });
    return new THREE.Line(geo, mat);
  }

  function mkHexGrid(size, rings=4, color=0xffffff, opacity=0.5) {
    const coords = [];
    for (let q=-rings;q<=rings;q++){
      for (let r=-rings;r<=rings;r++){
        const x = (Math.sqrt(3)*(q + r/2)) * size;
        const y = (1.5 * r) * size;
        for (let s=0;s<6;s++){
          const a1 = (s/6)*Math.PI*2;
          const a2 = ((s+1)/6)*Math.PI*2;
          coords.push(x + Math.cos(a1)*size*0.45, y + Math.sin(a1)*size*0.45, 0);
          coords.push(x + Math.cos(a2)*size*0.45, y + Math.sin(a2)*size*0.45, 0);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    const mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity });
    return new THREE.LineSegments(geo, mat);
  }

  // ---------- Layered sacred geometry group ----------
  const sacred = new THREE.Group();
  scene.add(sacred);

  const baseR = 12;
  // Flower-of-life rings
  for (let i=0;i<7;i++){
    const c = mkLineCircle(baseR * (i+1) * 1.8, 256, 0xffffff, 0.9 - i*0.08);
    c.rotation.x = 0.03 * (i%2?1:-1);
    c.position.z = -i*2;
    c.scale.set(1.0 + i*0.02, 1.0 + i*0.02, 1);
    sacred.add(c);
  }

  // overlapping petal circles
  for (let j=0;j<6;j++){
    const theta = (j/6)*Math.PI*2;
    const cx = Math.cos(theta)*baseR*2.2;
    const cy = Math.sin(theta)*baseR*2.2;
    const pet = mkLineCircle(baseR*2.2, 192, 0xffffff, 0.85);
    pet.position.set(cx, cy, -6);
    pet.scale.set(1.1,1.1,1);
    sacred.add(pet);
  }

  // hex grid overlay
  const hex = mkHexGrid(8, 6, 0xffffff, 0.45);
  hex.position.z = -10;
  sacred.add(hex);

  // nested icosahedrons to create fractal feel (wireframe)
  const icoGroup = new THREE.Group();
  for (let s=0;s<5;s++){
    const size = 10 + s*8;
    const g = new THREE.IcosahedronGeometry(size, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.08 + (0.12 * (5-s)) });
    const mesh = new THREE.Mesh(g, mat);
    mesh.rotation.x = Math.random()*0.4;
    mesh.rotation.y = Math.random()*0.4;
    mesh.position.z = -20 - s*6;
    icoGroup.add(mesh);
  }
  sacred.add(icoGroup);

  // ---------- Particles (dust / stars) ----------
  const particleCount = 1800;
  const partPos = new Float32Array(particleCount * 3);
  for (let i=0;i<particleCount;i++){
    const r = Math.random()*900;
    const theta = Math.random()*Math.PI*2;
    const y = (Math.random()-0.5)*700;
    partPos[i*3] = Math.cos(theta)*r;
    partPos[i*3+1] = y;
    partPos[i*3+2] = Math.sin(theta)*r;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  const pMat = new THREE.PointsMaterial({ size: 1.2, color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(pGeo, pMat);
  points.position.z = -80;
  scene.add(points);

  // ---------- Color cycling parameters ----------
  let clock = 0;
  const paletteSpeed = (page === 'why') ? 0.002 : 0.008; // why slower/desaturated
  const baseSat = (page === 'why') ? 0.35 : 0.95;
  const baseLight = (page === 'why') ? 0.45 : 0.55;

  // make function to convert hsl -> THREE.Color
  function hslToColor(h, s, l){ const c = new THREE.Color(); c.setHSL(h, s, l); return c; }

  // ---------- Animation ----------
  function animate(){
    requestAnimationFrame(animate);
    clock += 1;

    // global rotation / expansion feel for homepage
    sacred.rotation.z += 0.0009;
    sacred.rotation.x = Math.sin(clock*0.00012)*0.02;
    icoGroup.children.forEach((m,idx)=>{ m.rotation.y += 0.0004 + idx*0.00012; m.rotation.x += 0.0002; });

    // particle sweep (gentle inward spiral)
    const pos = pGeo.attributes.position.array;
    for (let i=0;i<particleCount;i++){
      const idx = i*3;
      // rotate around center slowly
      const x = pos[idx], y = pos[idx+1], z = pos[idx+2];
      const ang = Math.atan2(z,x) + 0.00012;
      const r = Math.sqrt(x*x + z*z);
      pos[idx] = Math.cos(ang) * r;
      pos[idx+2] = Math.sin(ang) * r;
      // slight bob
      pos[idx+1] = y + Math.sin((i + clock*0.001) * 0.002) * 0.05;
    }
    pGeo.attributes.position.needsUpdate = true;

    // Rainbow color cycling across line objects
    const timeHue = (clock * paletteSpeed * 0.0007) % 1;
    sacred.children.forEach((child, i) => {
      if (child.material) {
        const hue = (timeHue + i*0.06) % 1;
        const sat = baseSat;
        const lig = baseLight;
        child.material.color = hslToColor(hue, sat, lig);
        child.material.opacity = Math.max(0.12, child.material.opacity);
      }
    });
    icoGroup.children.forEach((m, i) => {
      m.material.color = hslToColor((timeHue + i*0.03)%1, baseSat*0.6, baseLight*0.9);
    });
    points.material.color = hslToColor((timeHue + 0.2) % 1, baseSat*0.7, baseLight*0.95);

    // gentle camera zoom pulse for expansive effect
    camera.position.z = 300 + Math.sin(clock*0.00035) * 18;

    renderer.render(scene, camera);
  }

  animate();

  // pause when not visible
  document.addEventListener('visibilitychange', () => {
    // nothing heavy required; animation loop will auto-stop when tab hidden in many browsers
  });

  console.log('Background fractal-sacred loaded for page:', page);
})();
