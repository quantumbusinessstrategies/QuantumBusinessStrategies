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

// simple SPA navigation
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
  if (window._QG_renderer && name === 'home') window.dispatchEvent(new Event('resize'));
}

document.querySelectorAll('.pixel-button').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.getAttribute('data-target')));
});
document.querySelectorAll('.back


## index.html
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Quantum Business Strategies</title>
  <link rel="stylesheet" href="style.css" />
  <script type="module" src="main.js"></script>
</head>
<body>
  <div id="app-root">
    <div id="screen-home" class="screen active">
      <div id="mount" class="mount"></div>
      <div id="title" class="title" aria-hidden="true"></div>
      <div class="bottom-buttons">
        <button class="pixel-button" data-target="apply">Apply</button>
        <button class="pixel-button" data-target="packages">Packages</button>
        <button class="pixel-button" data-target="why">Why</button>
      </div>
      <div id="tv-overlay"><div id="tv-anim"></div></div>
    </div>

    <div id="screen-apply" class="screen">
      <div class="placeholder">
        <h1>Apply</h1>
        <button class="back-btn">BACKTOMOTHERSHIP</button>
      </div>
    </div>

    <div id="screen-packages" class="screen">
      <div class="placeholder">
        <h1>Packages</h1>
        <button class="back-btn">BACKTOMOTHERSHIP</button>
      </div>
    </div>

    <div id="screen-why" class="screen">
      <div class="placeholder">
        <h1>Why</h1>
        <button class="back-btn">BACKTOMOTHERSHIP</button>
      </div>
    </div>
  </div>

  <div id="quantum-ticker" aria-hidden="true"></div>
</body>
</html>
