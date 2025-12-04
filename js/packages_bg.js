// js/packages_bg.js (unchanged concept — pixel vault ocean)
(() => {
  const canvas = document.getElementById('pkg-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

  let PIX = Math.max(3, Math.floor(Math.min(W,H) / 160));
  let cols, rows, grid;

  function init(){
    PIX = Math.max(3, Math.floor(Math.min(W,H) / 140));
    cols = Math.ceil(W/PIX); rows = Math.ceil(H/PIX);
    grid = new Array(cols*rows);
    for (let x=0;x<cols;x++){
      for (let y=0;y<rows;y++){
        const idx = x + y*cols;
        grid[idx] = { h: Math.random()*0.001, phase: Math.random()*Math.PI*2, coin: Math.random() < 0.06 };
      }
    }
  }

  function drawPixel(x,y,color){ ctx.fillStyle = color; ctx.fillRect(x*PIX,y*PIX,PIX,PIX); }
  function shadeForHeight(h){
    const r = Math.max(30, Math.min(255, 200 + h*120));
    const g = Math.max(20, Math.min(200, 120 + h*50));
    const b = Math.max(0, Math.min(140, 40 + h*30));
    return `rgb(${r},${g},${b})`;
  }

  function render(t){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#020205'; ctx.fillRect(0,0,W,H);
    const cx = cols/2, cy = rows/2;
    for (let x=0;x<cols;x++){
      for (let y=0;y<rows;y++){
        const idx = x + y*cols;
        const cell = grid[idx];
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const wave = Math.sin(t*0.0016 + dist*0.12 + cell.phase) * 0.9;
        const h = 0.25 + wave*0.85;
        cell.h = cell.h*0.92 + h*0.08;
        if (cell.coin){
          const shine = Math.sin(t*0.004 + idx) * 0.5 + 0.5;
          const color = shadeForHeight(cell.h*1.3);
          drawPixel(x,y,color);
          if (Math.random() < 0.0008) cell.coin = false;
        } else {
          const val = Math.floor(8 + cell.h*42);
          const grey = `rgb(${val},${val},${val+6})`;
          drawPixel(x,y,grey);
        }
      }
    }
    requestAnimationFrame(render);
  }

  init(); requestAnimationFrame(render);
})();
