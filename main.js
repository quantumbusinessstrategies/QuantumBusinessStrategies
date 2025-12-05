import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js';
import { EffectComposer } from 'https://unpkg.com/three@0.164.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.164.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.164.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const container = document.querySelector('#container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
camera.position.z = 6.4;

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

// Galaxy
const particles = 25000;
const pos = new Float32Array(particles*3);
const col = new Float32Array(particles*3);
for(let i=0;i<particles;i++){
  const arm = (i%4)/4;
  const radius = Math.pow(Math.random(),0.9)*10;
  const spinAngle = radius*0.6;
  const angle = spinAngle + arm*Math.PI*2 + (Math.random()*0.8-0.4;
  const randSpread = (Math.random()-0.5)*0.6*(1+radius*0.05);
  pos[i*3]   = Math.cos(angle)*radius + randSpread*0.3;
  pos[i*3+1] = (Math.random()-0.5)*1.8*(1+radius*0.02);
  pos[i*3+2] = Math.sin(angle)*radius + randSpread*0.3;
  const hue = (angle*0.1 + i/particles)%1;
  const color = new THREE.Color().setHSL(hue,1,0.6-Math.random()*0.3);
  col[i*3] = color.r; col[i*3+1]=color.g; col[i*3+2]=color.b;
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
geo.setAttribute('color', new THREE.BufferAttribute(col,3));
const mat = new THREE.PointsMaterial({size:0.012, vertexColors:true, transparent:true, opacity:0.95, sizeAttenuation:true, depthWrite:false, blending:THREE.AdditiveBlending});
const galaxy = new THREE.Points(geo,mat);
scene.add(galaxy);

// Wireframes
const inner = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.8,2)), new THREE.LineBasicMaterial({color:0xffffff, toneMapped:false}));
scene.add(inner);
const outer = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.36,3)), new THREE.LineBasicMaterial({color:0xffffff, toneMapped:false}));
scene.add(outer);

// Matrix rain
const matrix = new THREE.Group();
scene.add(matrix);
for(let i=0;i<500;i++){
  const canvas = document.createElement('canvas');
  canvas.width=canvas.height=32;
  const ctx = canvas.getContext('2d');
  ctx.font='24px monospace';
  ctx.fillStyle = `hsl(${Math.random()*360},100%,60%)`;
  ctx.fillText(Math.random()>0.5?'1':'0',4,24);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true, depthWrite:false}));
  sprite.position.set((Math.random()-0.5)*14, (Math.random()-0.5)*12, -2-Math.random()*4);
  sprite.scale.set(0.375,0.375,1);
  sprite.userData={speed:0.01+Math.random()*0.03};
  matrix.add(sprite);
}

// Bloom
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight), 0.85, 0.4, 0.15);
composer.addPass(bloom);

// Animation
let hue=0, outerHue=0;
function animate(t){
  t*=0.001;
  galaxy.rotation.y = t*0.06;
  inner.rotation.x = Math.sin(t*0.4)*0.4;
  inner.rotation.y = t*0.6;
  hue = (hue+0.0025)%1;
  inner.material.color.setHSL(hue,0.95,0.55);
  outer.rotation.x += 0.0012;
  outer.rotation.y += 0.001;
  outerHue = (outerHue+0.0055)%1;
  outer.material.color.setHSL(outerHue,0.98,0.55);
  matrix.children.forEach(s=>{
    s.position.y -= s.userData.speed;
    if(s.position.y < -8) s.position.y = 8;
  });
  composer.render();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener('resize',()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
});

// Button function (you can change the URLs anytime)
window.navigate = function(page){
  const urls = {
    apply: 'https://yourdomain.com/apply',
    packages: 'https://yourdomain.com/packages',
    why: 'https://yourdomain.com/why'
  };
  console.log(`Going to ${page.toUpperCase()}`);
  // Remove the comment below when ready:
  // window.open(urls[page], '_blank');
}
