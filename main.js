// build rainbow title
const titleEl = document.getElementById("title");
const titleText = "QUANTUMBUSINESSSTRATEGIES";
titleEl.innerHTML = titleText
  .split("")
  .map((c, i) => `<span style="animation-delay:${i * 0.06}s">${c}</span>`)
  .join("");

// navigation
const screens = document.querySelectorAll('.screen');
const buttons = document.querySelectorAll('.pixel-button');
const backBtns = document.querySelectorAll('.back-btn');

function switchTo(id) {
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${id}`).classList.add('active');
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => switchTo(btn.dataset.target));
});
backBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTo('home'));
});

// ticker
const ticker = document.getElementById("quantum-ticker");
const msg = "WELCOME TO QUANTUM BUSINESS STRATEGIES — POWERING THE IMPOSSIBLE.";
ticker.innerHTML = `<span>${msg} ${msg} ${msg}</span>`;
