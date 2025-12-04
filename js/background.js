// js/background.js
// Shader-based sacred geometry + galaxy + black-hole postprocess
// Requires three.js included in the page before this script

(() => {
  try {
    if (typeof THREE === 'undefined') {
      console.error('Three.js not loaded. Add <script src="https://unpkg.com/three@0.155.0/build/three.min.js"></script>');
      return;
    }

    const CONFIG = {
      particleCount: 1400,
      particleSize: 1.6,
      bgColor: 0x000000,
      blackHoleScreenPct: 0.02,
      hueSpeed: 0.06
    };

    let canvas = document.getElementById('bg');
    const renderer = new THREE.WebGLRenderer({ canvas: canvas || undefined, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1.5, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(CONFIG.bgColor, 1);

    if (!canvas) {
      canvas = renderer.domElement;
      canvas.id = 'bg';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '-20';
      document.body.appendChild(canvas);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 140;

    const rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { depthBuffer: true, stencilBuffer: false });

    window.addEventListener('resize', () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rt.setSize(w, h);
    });

    // Particles
    const particleGeo = new THREE.BufferGeometry();
    const pc = Math.max(200, Math.min(5000, CONFIG.particleCount));
    const positions = new Float32Array(pc * 3);
    const baseAngles = new Float32Array(pc);
    const radii = new Float32Array(pc);

    for (let i = 0; i < pc; i++) {
      const r = Math.pow(Math.random(), 0.85) * 220 + 6;
      const arm = (Math.random() < 0.5) ? 1 : -1;
      const angle = (r * 0.08) * arm + (Math.random() * 0.7 - 0.35);
      positions[3*i + 0] = Math.cos(angle) * r + (Math.random() - 0.5) * 8;
      positions[3*i + 1] = (Math.random() - 0.5) * 30;
      positions[3*i + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 8;
      baseAngles[i] = angle;
      radii[i] = r;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('aBase', new THREE.BufferAttribute(baseAngles, 1));
    particleGeo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));

    const particleMat = new THREE.PointsMaterial({
      size: CONFIG.particleSize,
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // Sacred geometry
    const lineGroup = new THREE.Group();
    scene.add(lineGroup);

    function addCircle(radius, seg = 256) {
      const arr = new Float32Array((seg + 1) * 3);
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        arr[i*3] = Math.cos(a) * radius;
        arr[i*3+1] = Math.sin(a) * radius;
        arr[i*3+2] = 0;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const m = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      const line = new THREE.Line(g, m);
      return line;
    }

    const baseR = 14;
    for (let i = 0; i < 6; i++) {
      const theta = (i / 6) * Math.PI * 2;
      const cx = Math.cos(theta) * baseR;
      const cy = Math.sin(theta) * baseR;
      const c = addCircle(baseR);
      c.position.set(cx, cy, 0);
      c.scale.set(3.2, 3.2, 1);
      lineGroup.add(c);
    }
    const centerRing = addCircle(baseR * 3.1, 512);
    lineGroup.add(centerRing);

    function hexGrid(radius, rings = 4) {
      const coords = [];
      const hexSize = radius;
      for (let q = -rings; q <= rings; q++) {
        for (let r = -rings; r <= rings; r++) {
          const x = (Math.sqrt(3) * (q + r/2)) * hexSize * 0.62;
          const y = (1.5 * r) * hexSize * 0.62;
          for (let s = 0; s < 6; s++) {
            const a1 = (s / 6) * Math.PI * 2;
            const a2 = ((s + 1) / 6) * Math.PI * 2;
            coords.push(x + Math.cos(a1) * hexSize * 0.22, y + Math.sin(a1) * hexSize * 0.22, 0);
            coords.push(x + Math.cos(a2) * hexSize * 0.22, y + Math.sin(a2) * hexSize * 0.22, 0);
          }
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
      const lines = new THREE.LineSegments(geo, mat);
      return lines;
    }
    const hex = hexGrid(12, 5);
    hex.position.z = -1.5;
    lineGroup.add(hex);

    lineGroup.rotation.x = 0.02;
    lineGroup.scale.set(3.2, 3.2, 1);

    // postprocess shader
    const quadGeo = new THREE.PlaneGeometry(2,2);
    const frag = `
    precision mediump float;
    uniform sampler2D uTex;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec2 uBH;
    uniform float uBHRadius;
    vec3 hsl2rgb(vec3 hsl) {
      float h = hsl.x, s = hsl.y, l = hsl.z;
      float c = (1.0 - abs(2.0*l - 1.0)) * s;
      float x = c * (1.0 - abs(mod(h*6.0, 2.0) - 1.0));
      float m = l - c/2.0;
      vec3 rgb;
      if (h < 1.0/6.0) rgb = vec3(c,x,0.0);
      else if (h < 2.0/6.0) rgb = vec3(x,c,0.0);
      else if (h < 3.0/6.0) rgb = vec3(0.0,c,x);
      else if (h < 4.0/6.0) rgb = vec3(0.0,x,c);
      else if (h < 5.0/6.0) rgb = vec3(x,0.0,c);
      else rgb = vec3(c,0.0,x);
      return rgb + vec3(m);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      vec2 centered = (uv - vec2(0.5)) * vec2(uResolution.x/uResolution.y, 1.0);
      vec2 bhCentered = (uBH - vec2(0.5)) * vec2(uResolution.x/uResolution.y, 1.0);
      vec2 v = centered - bhCentered;
      float dist = length(v);
      float bhRadius = uBHRadius * (uResolution.x/uResolution.y);
      float strength = smoothstep(bhRadius*1.6, bhRadius*0.2, dist);
      float pull = 0.0045 * (1.0 + (1.0 - smoothstep(0.0,bhRadius*1.6,dist)) * 12.0);
      vec2 dir = normalize(v + vec2(1e-6));
      vec2 disp = -dir * pull * strength * (1.0 + 0.35*sin(uTime*0.002));
      float chroma = 0.0025 * (1.0 + (1.0 - smoothstep(bhRadius*0.0, bhRadius*1.8, dist))*8.0);
      vec2 ruv = uv + disp + dir * chroma * 1.2;
      vec2 guv = uv + disp;
      vec2 buv = uv + disp - dir * chroma * 1.2;
      vec3 rc = texture2D(uTex, ruv).rgb;
      vec3 gc = texture2D(uTex, guv).rgb;
      vec3 bc = texture2D(uTex, buv).rgb;
      vec3 color = vec3(rc.r, gc.g, bc.b);
      float vign = smoothstep(bhRadius*0.8, bhRadius*0.02, dist);
      color *= (1.0 - 0.6 * (1.0 - vign));
      float ring = smoothstep(bhRadius*1.6, bhRadius*1.2, dist) - smoothstep(bhRadius*1.0, bhRadius*0.95, dist);
      color += vec3(0.12,0.08,0.2) * ring * 1.2;
      float hue = mod(uTime * 0.00003, 1.0);
      vec3 hsl = vec3(hue, 0.5, 0.55);
      vec3 overlay = hsl2rgb(hsl) * 0.06;
      color = clamp(color + overlay, 0.0, 1.0);
      gl_FragColor = vec4(color, 1.0);
    }
    `;

    const vert = `precision mediump float; attribute vec3 position; void main(){ gl_Position = vec4(position,1.0); }`;

    const postMat = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: rt.texture },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTime: { value: 0.0 },
        uBH: { value: new THREE.Vector2(0.5, 0.5) },
        uBHRadius: { value: CONFIG.blackHoleScreenPct }
      },
      vertexShader: vert,
      fragmentShader: frag,
      depthWrite: false
    });

    const quad = new THREE.Mesh(quadGeo, postMat);
    const postScene = new THREE.Scene();
    postScene.add(quad);
    const postCamera = new THREE.Camera();

    let last = performance.now();

    function animate() {
      const now = performance.now();
      const dt = now - last;
      last = now;

      const posAttr = particleGeo.getAttribute('position');
      for (let i = 0; i < pc; i++) {
        const ix = 3*i;
        let x = posAttr.array[ix];
        let y = posAttr.array[ix+1];
        let z = posAttr.array[ix+2];

        const dx = -x;
        const dy = -y;
        const dz = -z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.001;

        const pullBase = 0.00045 * (1.0 + Math.max(0.0, (150.0 / (dist + 40.0))) * 0.002);
        posAttr.array[ix] += dx * pullBase * dt * 0.6 + (Math.random() - 0.5) * 0.02;
        posAttr.array[ix+1] += dy * pullBase * dt * 0.4 + (Math.random() - 0.5) * 0.01;
        posAttr.array[ix+2] += dz * pullBase * dt * 0.6 + (Math.random() - 0.5) * 0.02;

        const r = Math.sqrt(posAttr.array[ix]*posAttr.array[ix] + posAttr.array[ix+2]*posAttr.array[ix+2]) + 0.0001;
        const ang = Math.atan2(posAttr.array[ix+2], posAttr.array[ix]) + 0.0009 * (1.0 + (60.0 / (r + 12.0))) * (dt * 0.06);
        posAttr.array[ix] = Math.cos(ang) * r;
        posAttr.array[ix+2] = Math.sin(ang) * r;

        const screenShort = Math.min(window.innerWidth, window.innerHeight);
        const bhScreen = CONFIG.blackHoleScreenPct * screenShort * 0.5;
        if (Math.sqrt(posAttr.array[ix]*posAttr.array[ix] + posAttr.array[ix+1]*posAttr.array[ix+1] + posAttr.array[ix+2]*posAttr.array[ix+2]) < bhScreen * 0.02) {
          const R = 160 + Math.random() * 80;
          const a = Math.random() * Math.PI * 2;
          posAttr.array[ix] = Math.cos(a) * R;
          posAttr.array[ix+1] = (Math.random() - 0.5) * 20;
          posAttr.array[ix+2] = Math.sin(a) * R;
        }
      }
      posAttr.needsUpdate = true;

      lineGroup.rotation.z += 0.00045 * dt;
      const hueTime = now * CONFIG.hueSpeed * 0.00002;
      lineGroup.children.forEach((ch, idx) => {
        if (ch.material) {
          const h = (hueTime + idx * 0.07) % 1.0;
          ch.material.color.setHSL(h, 0.9, 0.6);
          ch.material.opacity = 0.9 - idx * 0.04;
        }
      });

      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      postMat.uniforms.uTime.value = now;
      postMat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);

      renderer.render(postScene, postCamera);

      requestAnimationFrame(animate);
    }

    animate();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { renderer.setAnimationLoop(null); }
      else { last = performance.now(); requestAnimationFrame(animate); }
    });

    console.log('Background shader loaded (black hole mode).');

  } catch (err) {
    console.error('Background init error:', err);
    try { document.getElementById('bg').style.background = 'radial-gradient(circle at 50% 50%, #081021 0%, #000 60%)'; } catch(e) {}
  }
})();
