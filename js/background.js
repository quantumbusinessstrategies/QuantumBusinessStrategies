// ===================================================================
// FIXED + SAFE + UNIVERSAL BACKGROUND VORTEX
// Blue/Purple cosmic swirl for Home + Why pages
// ===================================================================

let scene, camera, renderer, particles, particleGeometry, particleMaterial;

function initBackground() {
    const canvas = document.getElementById("background-canvas");

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.z = 400;

    // -------------------------------------------------------------
    // PARTICLE FIELD (SAFE VERSION, NO SHADERS)
    // -------------------------------------------------------------
    const count = 6000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        let r = Math.random() * 600 + 50;
        let theta = Math.random() * Math.PI * 2;
        let y = (Math.random() - 0.5) * 400;

        positions[i] = r * Math.cos(theta); 
        positions[i + 1] = y;
        positions[i + 2] = r * Math.sin(theta);
    }

    particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    particleMaterial = new THREE.PointsMaterial({
        size: 2,
        color: new THREE.Color(0x88aaff),
        transparent: true,
        opacity: 0.9
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    animateBackground();
}

function animateBackground() {
    requestAnimationFrame(animateBackground);

    particles.rotation.y += 0.0006;
    particles.rotation.x += 0.00025;

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

initBackground();
console.log("Background vortex loaded successfully.");
