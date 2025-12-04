/* SAFEST FRACTAL + NEON SACRED GEOMETRY BACKGROUND */

const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 5;

/* PARTICLE FIELD (galaxy dust) */
const particles = new THREE.Group();
scene.add(particles);

const pGeometry = new THREE.BufferGeometry();
const count = 1500;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 12;
}

pGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const pMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.025,
    transparent: true,
    opacity: 0.8
});

const points = new THREE.Points(pGeometry, pMaterial);
particles.add(points);

/* GEOMETRIC FRACTAL LAYERS */
function neonLine(color) {
    return new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.65
    });
}

function makeHex(size, color) {
    const shape = new THREE.CircleGeometry(size, 6);
    return new THREE.LineLoop(shape, neonLine(color));
}

let hex1 = makeHex(2.5, "#ff00ff");
let hex2 = makeHex(3.5, "#00ffff");
let hex3 = makeHex(4.8, "#00ff00");

scene.add(hex1, hex2, hex3);

/* ANIMATION LOOP */
function animate() {
    requestAnimationFrame(animate);

    particles.rotation.y += 0.0008;

    hex1.rotation.z += 0.001;
    hex2.rotation.z -= 0.0006;
    hex3.rotation.z += 0.0004;

    renderer.render(scene, camera);
}
animate();

/* RESIZE */
window.addEventListener("resize", () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
});
