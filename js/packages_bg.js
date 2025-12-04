
// js/packages_bg.js - pixel ocean of coins (lightweight canvas2D)
(() => {
  const canvas = document.getElementById('pkg-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const PIX = Math.max(4, Math.floor(Math.min(W,H) / 120));
  let cols = Math.ceil(W/PIX), rows = Math.ceil(H/PIX);
  let grid = [];

  function init(){
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    cols = Math.ceil(W/PIX);
    rows = Math.ceil(H/PIX);
    grid = new Array(cols*rows);
    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x + y*cols;
        grid[idx] = { phase: Math.random()*Math.PI*2, coin: Math.random() < 0.06 };
      }
    }
  }

  function draw(){
    ctx.fillStyle = '#030308';
    ctx.fillRect(0,0,W,H);

    const cx = cols/2, cy = rows/2;
    const t = performance.now();

    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x + y*cols;
        const cell = grid[idx];
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const wave = Math.sin(t*0.0015 + dist*0.12 + cell.phase) * 0.85;
        const h = 0.3 + wave*0.7;

        if (cell.coin) {
          const r = Math.floor(200 + h*55);
          const g = Math.floor(150 + h*40);
          const b = Math.floor(50 + h*20);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        } else {
          const v = Math.floor(8 + h*24);
          ctx.fillStyle = `rgb(${v},${v},${v+6})`;
        }
        ctx.fillRect(x*PIX, y*PIX, PIX, PIX);
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    init();
  });

  init();
  requestAnimationFrame(draw);
})();
