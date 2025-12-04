// js/packages_bg.js
(() => {
  const canvas = document.getElementById('pkg-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

  // pixel size
  const PIX = Math.max(4, Math.floor(Math.min(W,H) / 140));
  let cols, rows, grid = [];

  function init(){
    cols = Math.ceil(W/PIX); rows = Math.ceil(H/PIX);
    grid = new Array(cols*rows);
    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x + y*cols;
        grid[idx] = { phase: Math.random()*Math.PI*2, coin: Math.random() < 0.08, h:0 };
      }
    }
  }

  function shadeGold(h){
    const r = Math.min(255, Math.floor(200 + h*120));
    const g = Math.min(200, Math.floor(140 + h*80));
    const b = Math.min(140, Math.floor(40 + h*30));
    return `rgb(${r},${g},${b})`;
  }

  function draw(){
    ctx.fillStyle = '#030308'; ctx.fillRect(0,0,W,H);
    const cx = cols/2, cy = rows/2;
    const t = performance.now();

    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x + y*cols;
        const cell = grid[idx];
        const dx = x-cx, dy = y-cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const wave = Math.sin(t*0.0015 + dist*0.12 + cell.phase);
        const h = 0.35 + wave*0.85;
        cell.h = cell.h*0.9 + h*0.1;

        if(cell.coin){
          const shine = (Math.sin(t*0.003 + idx)*0.5 + 0.5)*0.5 + 0.5;
          ctx.fillStyle = shadeGold(cell.h*1.3);
        } else {
          const gval = Math.floor(6 + cell.h*26);
          ctx.fillStyle = `rgb(${gval},${gval},${gval+6})`;
        }
        ctx.fillRect(x*PIX, y*PIX, PIX, PIX);
      }
    }
    requestAnimationFrame(draw);
  }

  init();
  requestAnimationFrame(draw);
})();
