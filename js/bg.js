const canvas = document.getElementById("bg-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.z = 600;

let geo = new THREE.BufferGeometry();
let count = 8000;
let positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i += 3) {
    let r = (Math.random() * 0.5 + 0.5) * 500;
    let angle = Math.random() * Math.PI * 6;
    positions[i] = Math.cos(angle) * r;
    positions[i+1] = (Math.random()-0.5) * 300;
    positions[i+2] = Math.sin(angle) * r;
}
geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

let mat = new THREE.PointsMaterial({
    size: 2.2,
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
});

let points = new THREE.Points(geo, mat);
scene.add(points);

function animate() {
    requestAnimationFrame(animate);

    points.rotation.y += 0.0007;
    points.rotation.x += 0.0003;

    let time = performance.now() * 0.0006;
    mat.color.setHSL((time % 1), 1, 0.6);

    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
