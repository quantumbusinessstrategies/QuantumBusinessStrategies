const walletCanvas = document.getElementById("wallet-3d");
const wRenderer = new THREE.WebGLRenderer({ canvas: walletCanvas, alpha: true });
wRenderer.setSize(300, 300);
const wScene = new THREE.Scene();
const wCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
wCamera.position.z = 5;

const geo2 = new THREE.IcosahedronGeometry(2, 1);
const edges = new THREE.EdgesGeometry(geo2);
const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x00ffcc })
);
wScene.add(line);

function wAnim() {
    requestAnimationFrame(wAnim);
    line.rotation.x += 0.004;
    line.rotation.y += 0.006;
    wRenderer.render(wScene, wCamera);
}
wAnim();
