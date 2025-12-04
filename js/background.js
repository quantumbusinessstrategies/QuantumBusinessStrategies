// js/background.js
// Safe but rich sacred-geometry + galaxy background (Three.js r128)
// Works across browsers. No custom GLSL shaders to avoid compile errors.

(function(){
  try {
    if (typeof THREE === 'undefined') {
      console.error('Three.js missing - include r128');
      return;
    }

    // pick canvas
    const canvas = document.getElementById('background-canvas') || (function(){
      const c = document.createElement('canvas'); c.id='background-canvas'; document.body.appendChild(c); return c;
    })();

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1.5, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.z = 220;

    // scale multiplier (15% larger visuals)
    const SCALE_MULT = 1.15;

    // Particles (dust / stars)
    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for(let i=0;i<particleCount;i++){
      const r = (Math.random()**0.8) * 420 * SCALE_MULT + 10;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = (Math.random()-0.5) * 80 * SCALE_MULT;
      positions[i*3] = x;
      positions[i*3+1] = y;
      positions[i*3+2] = z;

      // initial color (will cycle)
      colors[i*3] = 1.0;
      colors[i*3+1] = 1.0;
      colors[i*3+2] = 1.0;
    }

    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(positions,3));
    pg.setAttribute('color', new THREE.BufferAttribute(colors,3));

    const pMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(pg, pMat);
    scene.add(points);

    // Sacred geometry: circles + hex grid lines
    const lines = new THREE.Group();
    scene.add(lines);

    function makeCircle(radius, seg=256){
      const arr = new Float32Array((seg+1)*3);
      for(let i=0;i<=seg;i++){
        const t = (i/seg)*Math.PI*2;
        arr[i*3] = Math.cos(t)*radius;
        arr[i*3+1] = Math.sin(t)*radius;
        arr[i*3+2] = 0;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(arr,3));
      const m = new THREE.LineBasicMaterial({ color: 0xffffff, transparent:true, opacity:0.9 });
      return new THREE.Line(g,m);
    }

    const baseR = 18 * SCALE_MULT;
    for(let i=0;i<6;i++){
      const theta = (i/6)*Math.PI*2;
      const cx = Math.cos(theta)*baseR;
      const cy = Math.sin(theta)*baseR;
      const c = makeCircle(baseR,512);
      c.position.set(cx,cy,0);
      c.scale.set(3.6,3.6,1);
      lines.add(c);
    }
    const big = makeCircle(baseR*3.3,1024); big.scale.set(1,1,1); lines.add(big);

    // hex grid overlay
    (function addHexGrid(radius, rings=5){
      const coords = [];
      const hex = radius;
      for(let q=-rings;q<=rings;q++){
        for(let r=-rings;r<=rings;r++){
          const x = (Math.sqrt(3)*(q + r/2)) * hex * 0.65;
          const y = (1.5*r) * hex * 0.65;
          for(let s=0;s<6;s++){
            const a1 = (s/6)*Math.PI*2;
            const a2 = ((s+1)/6)*Math.PI*2;
            coords.push(x + Math.cos(a1)*hex*0.24, y + Math.sin(a1)*hex*0.24, 0);
            coords.push(x + Math.cos(a2)*hex*0.24, y + Math.sin(a2)*hex*0.24, 0);
          }
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(coords,3));
      const m = new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:0.45 });
      const lineseg = new THREE.LineSegments(g,m);
      lineseg.position.z = -1.5;
      lines.add(lineseg);
    })(12 * SCALE_MULT, 6);

    // slight tilt / aesthetic
    lines.rotation.x = 0.02;
    lines.scale.set(3.4,3.4,1);

    // animation variables
    let last = performance.now();
    let t = 0;

    // update loop: color cycling & particle motion (safe)
    function animate(){
      requestAnimationFrame(animate);
      const now = performance.now();
      const dt = now - last;
      last = now;
      t += dt * 0.001;

      // rotate geometry slowly
      lines.rotation.z += 0.00045 * dt;

      // color cycle
      const hueBase = (t * 0.08) % 1;
      lines.children.forEach((ch, idx) => {
        if (ch.material) {
          const h = (hueBase + idx*0.03) % 1;
          ch.material.color.setHSL(h, 0.9, 0.6);
          ch.material.opacity = 0.92 - idx*0.02;
        }
      });

      // particles swirl toward center slightly and orbit
      const pos = pg.getAttribute('position').array;
      for (let i=0;i<particleCount;i++){
        const ix = i*3;
        let x = pos[ix], y = pos[ix+1], z = pos[ix+2];

        // radial
        const dx = -x*0.00002 * dt * (1 + 0.6*Math.exp(-Math.hypot(x,y,z)/120));
        const dz = -z*0.00002 * dt * (1 + 0.6*Math.exp(-Math.hypot(x,y,z)/120));

        // orbital tweak
        const r = Math.sqrt(x*x + z*z) + 0.0001;
        const ang = Math.atan2(z,x) + 0.0009 * dt * (1 + 80/(r+30));

        pos[ix] = Math.cos(ang)*r + dx + (Math.random()-0.5)*0.2;
        pos[ix+2] = Math.sin(ang)*r + dz + (Math.random()-0.5)*0.2;
        pos[ix+1] += (Math.random()-0.5)*0.02 * (dt*0.002);
      }
      pg.getAttribute('position').needsUpdate = true;

      // update particle colors: rainbow pulse
      const cols = pg.getAttribute('color').array;
      for(let i=0;i<particleCount;i++){
        const h = (hueBase + (i/particleCount)*0.5) % 1;
        const c = new THREE.Color(); c.setHSL(h, 0.9, 0.65);
        cols[i*3]=c.r; cols[i*3+1]=c.g; cols[i*3+2]=c.b;
      }
      pg.getAttribute('color').needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    // handle resize
    window.addEventListener('resize', ()=> {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    console.log('background.js loaded (safe sacred geometry).');

  } catch(e){
    console.error('background init error', e);
    // fallback: ensure dark gradient
    try { document.body.style.background = 'radial-gradient(circle at 50% 40%, #070719 0%, #000 60%)'; } catch(e){}
  }
})();
