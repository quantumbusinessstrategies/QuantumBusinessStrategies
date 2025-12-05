import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Full Quantum Background + Title + Buttons Component
export default function App() {
  const mountRef = useRef(null);
  const rafRef = useRef(null);
  const composerRef = useRef(null);

  useEffect(() => {
    // inject Silkscreen font + animation styles
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Silkscreen&display=swap';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes rainbowShift { 
        0% { color: #ff0000; }
        20% { color: #ff00ff; }
        40% { color: #00ffff; }
        60% { color: #00ff00; }
        80% { color: #ffff00; }
        100% { color: #ff0000; }
      }

      .pixel-button {
        font-size: 1.38em;
        image-rendering: pixelated;
        font-family: Silkscreen, monospace;
        font-weight: 700;
        letter-spacing: 1px;
        padding: 18.4px 36.8px;
        min-width: 193.2px;
        text-align: center;
        border: 4px solid #fff;
        background: var(--pixel-random);
        background-size: 100% 100%;
        animation: pixelNoise 0.6s steps(4) infinite;
        box-shadow:
          0 0 0 4px #000 inset,
          0 0 0 6px rgba(255,255,255,0.15) inset,
          0 8px 0 #000,
          0 0 22px rgba(255,255,255,0.18),
          0 0 42px rgba(255,0,255,0.14);
        cursor: pointer;
        color: white;
        text-transform: uppercase;
      }

      @keyframes pixelNoise {
        0% { --pixel-random: repeating-linear-gradient(0deg, red 0 12px, yellow 12px 24px, green 24px 36px, blue 36px 48px); }
        25% { --pixel-random: repeating-linear-gradient(90deg, yellow 0 12px, green 12px 24px, blue 24px 36px, red 36px 48px); }
        50% { --pixel-random: repeating-linear-gradient(180deg, green 0 12px, blue 12px 24px, red 24px 36px, yellow 36px 48px); }
        75% { --pixel-random: repeating-linear-gradient(270deg, blue 0 12px, red 12px 24px, yellow 24px 36px, green 36px 48px); }
        100% { --pixel-random: repeating-linear-gradient(0deg, red 0 12px, yellow 12px 24px, green 24px 36px, blue 36px 48px); }
      }

      .pixel-button:active {
        transform: translateY(4px);
        box-shadow: 0 2px 0 rgba(0,0,0,0.6);
      }

      .pixel-button.glow {
        box-shadow: 
          0 8px 18px rgba(255,0,255,0.18),
          0 0 40px rgba(0,255,255,0.06);
        border-radius: 6px;
      }

      .pixel-button.rainbow {
        animation: rainbowShift 3s linear infinite;
        background-size: 300% 300%;
      }
    `;
    document.head.appendChild(style);

    // THREE.js setup
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 6.4;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    // Galaxy particle field
    const galaxyGeometry = new THREE.BufferGeometry();
    const particleCount = 25000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const arm = (i % 4) / 4;
      const radius = Math.pow(Math.random(), 0.9) * 10;
      const angle = radius * 0.6 + arm * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const spread = (Math.random() - 0.5) * 0.6 * (1 + radius * 0.05);

      const x = Math.cos(angle) * radius + spread * 0.3;
      const y = (Math.random() - 0.5) * 1.8 * (1 + radius * 0.02);
      const z = Math.sin(angle) * radius + spread * 0.3;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const hue = (angle * 0.1 + i / particleCount) % 1;
      const col = new THREE.Color().setHSL(hue, 1, 0.6 - Math.random() * 0.3);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.012,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxy);

    // Inner wireframe
    const innerGeo = new THREE.IcosahedronGeometry(2.8, 2);
    const innerWire = new THREE.WireframeGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false });
    let hueShift = 0;
    const wireframe = new THREE.LineSegments(innerWire, innerMat);
    scene.add(wireframe);

    // Outer wireframe
    const outerGeo = new THREE.IcosahedronGeometry(3.36, 3);
    const outerWire = new THREE.WireframeGeometry(outerGeo);
    const outerMat = new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false });
    let outerHue = 0;
    const outerFrame = new THREE.LineSegments(outerWire, outerMat);
    scene.add(outerFrame);

    // Matrix sprites
    const matrixGroup = new THREE.Group();
    scene.add(matrixGroup);
    const matrixChars = [];
    const matrixCount = 500;

    for (let i = 0; i < matrixCount; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;

      const ctx = canvas.getContext('2d');
      ctx.font = '24px monospace';
      const char = Math.random() > 0.5 ? '1' : '0';

      const hue = Math.random();
      ctx.fillStyle = `hsl(${hue * 360}, 100%, 60%)`;
      ctx.fillText(char, 4, 24);

      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(mat);
      sprite.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 12,
        -8 - Math.random() * 4
      );
      sprite.scale.set(0.375, 0.375, 0.375);
      sprite.userData.speed = 0.01 + Math.random() * 0.03;

      matrixGroup.add(sprite);
      matrixChars.push(sprite);
    }

    // Postprocessing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,
      0.8,
      0.0
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Animation
    let lastTime = 0;
    function animate(time) {
      const t = time * 0.001;
      const delta = Math.min(0.05, t - lastTime);
      lastTime = t;

      galaxy.rotation.y += delta * 0.06;

      wireframe.rotation.x = Math.sin(t * 0.4) * 0.4;
      wireframe.rotation.y = t * 0.6;
      hueShift = (hueShift + 0.0025) % 1;
      innerMat.color.setHSL(hueShift, 0.95, 0.55);

      outerFrame.rotation.x += 0.0012 + Math.sin(t * 0.7) * 0.0006;
      outerFrame.rotation.y += 0.001 + Math.cos(t * 0.5) * 0.0007;
      outerFrame.rotation.z += 0.0005 + Math.sin(t * 0.3) * 0.0004;
      outerHue = (outerHue + 0.0055) % 1;
      outerMat.color.setHSL(
        (Math.sin(t * 0.6) * 0.2 + outerHue) % 1,
        0.98,
        0.55
      );

      matrixChars.forEach((s) => {
        s.position.y -= s.userData.speed;
        if (s.position.y < -8) {
          s.position.y = 8;
          s.material.opacity = 0.2 + Math.random() * 0.4;
        }
        if (Math.random() < 0.02)
          s.material.opacity = 0.1 + Math.random() * 0.6;
      });

      composer.render(delta);
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        mount.removeChild(renderer.domElement);
      } catch (e) {}
      if (composerRef.current?.dispose) composerRef.current.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          width: '100%',
          textAlign: 'center',
          fontFamily: `'Silkscreen', monospace`,
          fontSize: '48px',
          fontWeight: 'bold',
          letterSpacing: '-2px',
          pointerEvents: 'none',
          textShadow:
            '0 0 8px #ff00ff, 0 0 16px #00ffff, 0 0 24px #ffff00, 0 0 32px #ff00ff',
          filter: 'drop-shadow(0 0 6px #ff00ff)',
          animation: 'rainbowShift 6s linear infinite',
        }}
      >
        <span style={{ fontSize: '52px' }}>Q</span>UANTUM
        <span style={{ fontSize: '52px' }}>B</span>USINESS
        <span style={{ fontSize: '52px' }}>S</span>TRATEGIES
      </div>

      {/* Buttons */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 96,
          display: 'flex',
          gap: 18,
        }}
      >
        {['Apply', 'Packages', 'Why'].map((label, i) => (
          <div
            key={i}
            className="pixel-button glow rainbow"
            onClick={() => console.log(label + ' clicked')}
          >
            {label}
          </div>
        ))}
      </div>
    </>
  );
}
