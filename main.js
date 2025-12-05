/* main.js - static (no React) port of the Quantum Galaxy scene */
import { EffectComposer } from 'https://unpkg.com/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// DOM elements
const mount = document.getElementById('mount');
const titleEl = document.getElementById('title');
const tickerEl = document.getElementById('quantum-ticker');

// build animated title letters
const titleText = 'QUANTUMBUSINESSSTRATEGIES';
titleEl.innerHTML = '';
titleText.split('').forEach((ch, i) => {
  const sp = document.createElement('span');
  sp.textContent = ch;
  sp.style.animationDelay = `${i * 0.06}s`;
  titleEl.appendChild(sp);
});

// simple SPA navigation (show/hide)
document.querySelectorAll('.pixel-button').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    showScreen(target);
  });
});
document.querySelectorAll('.back-btn').forEach(b => b.addEventListener('click', () => showScreen('home')));

function showScreen(name) {
  const screens = {
    home: 'screen-home',
    apply: 'screen-apply',
    packages: 'screen-packages',
    why: 'screen-why'
  };
  Object.values(screens).forEach(id => document.getElementById(id).classList.remove('active'));
  const id = screens[name] || screens.home;
  document.getElementById(id).classList.add('active');
  // if returning home, resize renderer if exists
  if (window._QG_renderer && window._QG_renderer.domElement && name === 'home') {
    window.dispatchEvent(new Event('resize'));
  }
}

// ---- ticker logic ----
function randomBinary(len = 12) {
  let s = '';
  for (let i = 0; i < len; i++) s += Math.random() > 0.5 ? '1' : '0';
  return s;
}
const headlines = [
  "World's Smartest Goldfish Earns Master's Degree",
  "Time Traveler From 3022 Just Wanted a Burrito",
  `Binary burst: 101010010110`,
  `Binary burst: ${randomBinary()}`
];
for (let i=0;i<8;i++) headlines.push(`Extra headline ${i+1} - ${randomBinary()}`);

function updateTicker() {
  const text = document.createElement('div');
  text.className = 'text';
  text.textContent = headlines[Math.floor(Math.random()*headlines.length)] + '   ' + headlines[Math.floor(Math.random()*headlines.length)];
  tickerEl.innerHTML = '';
  tickerEl.appendChild(text);
  let pos = tickerEl.offsetWidth;
  function step() {
    pos -= 2;
    text.style.transform = `translateX(${pos}px)`;
    if (pos < -text.offsetWidth) {
      updateTicker();
    } else {
      requestAnimationFrame(step);
    }
  }
  step();
}
updateTicker();

// ---- Three.js scene ----
function initThree() {
  // scene/camera/renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 2000);
  camera.position.z = 7.5;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  // attach globally for resize events
  window._QG_renderer = renderer;

  // galaxy
  const particleCount = 11000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const arm = (i % 4) / 4;
    let radius = Math.pow(Math.random(), 1.6) * (7.8 + Math.random() * 2.8);
    if (radius < 2 && Math.random() < 0.12) radius *= 1.12;
    const angle = radius * 0.6 + arm * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const spread = (Math.random() - 0.5) * 0.55 * (1 + radius * 0.04);
    positions[i * 3] = Math.cos(angle) * radius + spread * 0.3;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1.6 * (1 + radius * 0.02);
    positions[i * 3 + 2] = Math.sin(angle) * radius + spread * 0.3;
    const hue = (angle * 0.1 + i / particleCount) % 1;
    const c = new THREE.Color().setHSL(hue, 0.9, Math.max(0.18, 0.55 - Math.random() * 0.25));
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  const galaxyGeometry = new THREE.BufferGeometry();
  galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const galaxyMaterial = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.78, depthWrite: false, blending: THREE.AdditiveBlending });
  const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxy);

  // wireframes
  const innerWire = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.8, 1));
  const innerMat = new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false });
  const wireframe = new THREE.LineSegments(innerWire, innerMat);
  scene.add(wireframe);

  const outerWire = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.36, 1));
  const outerMat = new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false });
  const outerFrame = new THREE.LineSegments(outerWire, outerMat);
  scene.add(outerFrame);

  // electrons group
  const electrons = new THREE.Group();
  scene.add(electrons);
  for (let i = 0; i < 20; i++) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0x88ffff }));
    e.userData = { radius: (1.2 + Math.random()*1.2)*1.6, speed: 0.4 + Math.random()*0.9, angle: Math.random()*Math.PI*2, tilt: (Math.random()-0.5) };
    electrons.add(e);
  }

  // composer + bloom
  // EffectComposer was imported as module above, so use the module exports directly.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.35, 0.6, 0);
  composer.addPass(bloom);

  // animate loop
  let last = 0;
  function animate(now) {
    const t = now * 0.001;
    const delta = Math.min(0.05, t - last);
    last = t;
    galaxy.rotation.y += delta * 0.04;
    wireframe.rotation.x = Math.sin(t * 0.4) * 0.3;
    wireframe.rotation.y = t * 0.4;

    electrons.children.forEach(e => {
      e.userData.angle += e.userData.speed * delta;
      const a = e.userData.angle;
      const rx = Math.cos(a) * e.userData.radius * 1.6;
      const rz = Math.sin(a) * e.userData.radius * (1.2 + Math.abs(e.userData.tilt));
      const ry = Math.sin(a * 1.2) * (0.5 + Math.abs(e.userData.tilt) * 0.8);
      e.position.set(rx * Math.cos(e.userData.tilt), ry, rz * Math.sin(e.userData.tilt));
      if (Math.random() < 0.004) e.visible = !e.visible;
    });

    composer.render();
    window._QG_raf = requestAnimationFrame(animate);
  }
  window._QG_raf = requestAnimationFrame(animate);

  // resize handler
  function onResize() {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // cleanup on unload
  window.addEventListener('unload', () => {
    cancelAnimationFrame(window._QG_raf);
    try { mount.removeChild(renderer.domElement); } catch(e){}
    renderer.dispose();
  });

  // store references for potential future cleanup
  window._QG_scene = { scene, renderer, composer, galaxyGeometry, galaxyMaterial };
}

initThree();
