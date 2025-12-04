// js/background.js
// Safe, production-ready fractal / sacred geometry background (homepage + why).
(() => {
  if (typeof THREE === 'undefined') {
    console.error('Three.js missing. Include r128 before this script.');
    return;
  }

  const canvas = document.getElementById('bg');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1.5, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 2000);
  camera.position.z = 220;

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // SCALE multiplier 1.15 (15% larger)
  const GLOBAL_SCALE = 1.15;

  // ---------------------------
  // Particles (galaxy dust)
  // ---------------------------
  const particleCount = 1800; // moderate, safe
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i=0;i<particleCount;i++){
    const r = (Math.random()**1.5) * 420 * GLOBAL_SCALE + 20;
    const angle = Math.random() * Math.PI * 2;
    positions[3*i] = Math.cos(angle) * r;
    positions[3*i+1] = (Math.random()-0.5) * 120;
    positions[3*i+2] = Math.sin(angle) * r;
    sizes[i] = 1.0 + Math.random()*1.6;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(sizes,1));

  const pMaterial = new THREE.PointsMaterial({
    size: 1.6,
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particlePoints = new THREE.Points(pGeo, pMaterial);
  scene.add(particlePoints);

  // ---------------------------
  // Sacred geometry group
  // ---------------------------
  const geomGroup = new THREE.Group();
  geomGroup.scale.set(GLOBAL_SCALE, GLOBAL_SCALE, GLOBAL_SCALE);
  scene.add(geomGroup);

  // Add multiple concentric circles (flower-of-life style)
  function makeCircle(radius, segments=256){
    const arr = new Float32Array((segments+1)*3);
    for (let i=0;i<=segments;i++){
      const a = (i/segments)*Math.PI*2;
      arr[i*3] = Math.cos(a)*radius;
      arr[i*3+1] = Math.sin(a)*radius;
      arr[i*3+2] = 0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr,3));
    const m = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
    return new THREE.Line(g,m);
  }

  const baseR = 18;
  for (let i=0;i<7;i++){
    const c = makeCircle(baseR * (1 + i*0.9), 512);
    c.position.z = -i*0.6;
    geomGroup.add(c);
  }

  // add hex grid (wireframe)
  function makeHexGrid(size, rings=6){
    const coords = [];
    for (let q=-rings;q<=rings;q++){
      for (let r=-rings;r<=rings;r++){
        const x = (Math.sqrt(3)*(q + r/2)) * size * 0.6;
        const y = (1.5 * r) * size * 0.6;
        for (let s=0;s<6;s++){
          const a1 = (s/6)*Math.PI*2;
          const a2 = ((s+1)/6)*Math.PI*2;
          coords.push(x + Math.cos(a1)*size*0.28, y + Math.sin(a1)*size*0.28, 0);
          coords.push(x + Math.cos(a2)*size*0.28, y + Math.sin(a2)*size*0.28, 0);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent:true, opacity:0.45 });
    const lines = new THREE.LineSegments(g, mat);
    return lines;
  }

  const hex = makeHexGrid(12, 6);
  hex.position.z = -2;
  geomGroup.add(hex);

  // add triangle overlay (rotating)
  function makeTriangle(radius){
    const pts = new Float32Array(4*3);
    for (let i=0;i<=3;i++){
      const a = (i/3)*Math.PI*2;
      pts[i*3] = Math.cos(a)*radius;
      pts[i*3+1] = Math.sin(a)*radius;
      pts[i*3+2] = 0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pts,3));
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent:true, opacity:0.8 });
    return new THREE.Line(g, mat);
  }
  const tri = makeTriangle(baseR*6.2);
  tri.rotation.z = Math.PI/6;
  geomGroup.add(tri);

  // color cycling helper
  function hslToHex(h,s,l){
    const c = (1 - Math.abs(2*l -1)) * s;
    const x = c * (1 - Math.abs((h*6)%2 -1));
    const m = l - c/2;
    let r=0,g=0,b=0;
    if(h<1/6){ r=c; g=x; b=0; }
    else if(h<2/6){ r=x; g=c; b=0; }
    else if(h<3/6){ r=0; g=c; b=x; }
    else if(h<4/6){ r=0; g=x; b=c; }
    else if(h<5/6){ r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }
    return new THREE.Color(r+m, g+m, b+m);
  }

  // subtle camera movement
  let last = performance.now();
  function animate(){
    const now = performance.now();
    const dt = now - last;
    last = now;

    // particle slight swirl
    particlePoints.rotation.y += 0.0006 * (dt/16);
    particlePoints.rotation.x += 0.00015 * (dt/16);

    // rotate geometry
    geomGroup.rotation.z += 0.0004 * (dt/16);
    geomGroup.rotation.x = Math.sin(now*0.00005)*0.02;

    // rainbow color shift across lines
    const hueBase = (now * 0.00006) % 1.0;
    geomGroup.children.forEach((ch, idx) => {
      if (ch.material) {
        const h = (hueBase + idx*0.03) % 1;
        ch.material.color.copy(hslToHex(h, 0.9, 0.55));
        ch.material.opacity = 0.85 - idx*0.03;
      }
    });

    // particles tint shifts via PointsMaterial color
    const pHue = (now*0.00004) % 1.0;
    pMaterial.color.copy(hslToHex(pHue, 0.85, 0.7));

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // pause when hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // let it pause by not rendering (no requestAnimationFrame)
    } else {
      last = performance.now();
      requestAnimationFrame(animate);
    }
  });

  console.log('Safe sacred geometry background initialized.');
})();
