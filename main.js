document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // BUILD ANIMATED TITLE LETTERS
  // ============================================================
  const titleEl = document.getElementById("title");
  const titleText = "QUANTUMBUSINESSSTRATEGIES";

  titleText.split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.style.animationDelay = `${i * 0.06}s`;
    titleEl.appendChild(span);
  });

  // ============================================================
  // SCREEN SWITCHING SYSTEM
  // ============================================================
  function showScreen(target) {
    const all = document.querySelectorAll(".screen");
    all.forEach(s => s.classList.remove("active"));
    document.getElementById(`screen-${target}`).classList.add("active");
  }

  document.querySelectorAll(".pixel-button").forEach(btn => {
    btn.addEventListener("click", () => {
      showScreen(btn.dataset.target);
    });
  });

  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      showScreen("home");
    });
  });

  // ============================================================
  // THREE.JS STARFIELD BACKGROUND
  // ============================================================
  const mount = document.getElementById("mount");
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    mount.clientWidth / mount.clientHeight,
    0.1,
    2000
  );
  camera.position.z = 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  // Create starfield
  const stars = new THREE.BufferGeometry();
  const starCount = 5000;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 2000;
  }

  stars.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1
  });

  const starMesh = new THREE.Points(stars, starMaterial);
  scene.add(starMesh);

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    starMesh.rotation.y += 0.0005;
    starMesh.rotation.x += 0.0002;
    renderer.render(scene, camera);
  }
  animate();

  // Handle resize
  window.addEventListener("resize", () => {
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
  });
});
