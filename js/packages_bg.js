// js/packages_bg.js
(() => {
  const canvas = document.getElementById('pkg-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ W=canvas.width=innerWidth; H=canvas.height=innerHeight; init(); });

  let PIX, cols, rows, grid;
  function init(){
    PIX = Math.max(3, Math.floor(Math.min(W,H)/120));
    cols = Math.ceil(W/PIX); rows = Math.ceil(H/PIX);
    grid = new Array(cols*rows);
    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x+y*cols;
        grid[idx] = {phase:Math.random()*Math.PI*2, coin: Math.random()<0.07};
      }
    }
  }

  function drawPixel(x,y,color){ ctx.fillStyle=color; ctx.fillRect(x*PIX,y*PIX, PIX, PIX); }

  function shade(h){
    const r = Math.max(30, Math.min(255, 220 + h*100));
    const g = Math.max(20, Math.min(200, 150 + h*40));
    const b = Math.max(0, Math.min(140, 60 + h*20));
    return `rgb(${r},${g},${b})`;
  }

  function render(t){
    ctx.fillStyle='#020207'; ctx.fillRect(0,0,W,H);
    const cx = cols/2, cy = rows/2;
    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x+y*cols; const cell = grid[idx];
        const dx = x-cx, dy = y-cy; const dist = Math.sqrt(dx*dx+dy*dy);
        const wave = Math.sin(t*0.0015 + dist*0.14 + cell.phase) * 0.9;
        const h = 0.35 + wave*0.9;
        if(cell.coin){
          const shine = Math.sin(t*0.003 + idx) * 0.5 + 0.5;
          drawPixel(x,y, shade(h*1.1));
          if(Math.random()<0.0015) cell.coin = false;
        } else {
          const gval = Math.floor(6 + h*40);
          drawPixel(x,y, `rgb(${gval},${gval},${gval+6})`);
        }
      }
    }
    requestAnimationFrame(render);
  }

  init(); requestAnimationFrame(render);
})();
