// js/packages_bg.js
// Pixelated vault / coin ocean wave effect using canvas 2D (Mario64-like pixel aesthetic)

(() => {
  const canvas = document.getElementById('pkg-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

  const PIX = Math.max(3, Math.floor(Math.min(W,H) / 140));
  let cols, rows, grid;

  function init(){
    const PIX = Math.max(3, Math.floor(Math.min(W,H) / 140));
    cols = Math.ceil(W / PIX);
    rows = Math.ceil(H / PIX);
    grid = new Array(cols * rows);
    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x + y*cols;
        grid[idx] = {phase: Math.random()*Math.PI*2, coin: Math.random() < 0.08};
      }
    }
  }

  function drawPixel(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*PIX, y*PIX, PIX, PIX);
  }

  function shadeForHeight(h){
    const r = Math.round(180 + h*60);
    const g = Math.round(130 + h*40);
    const b = Math.round(40 + h*20);
    return `rgb(${r},${g},${b})`;
  }

  function render(t){
    ctx.fillStyle = '#030308';
    ctx.fillRect(0,0,W,H);

    const centerX = cols/2, centerY = rows/2;
    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x + y*cols;
        const cell = grid[idx];
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const wave = Math.sin(t*0.0015 + dist*0.12 + cell.phase) * 0.9;
        const h = 0.4 + wave * 0.6;
        if(cell.coin){
          const shine = Math.sin(t*0.004 + idx) * 0.5 + 0.5;
          const color = shadeForHeight(h);
          drawPixel(x,y, color);
        } else {
          const val = Math.max(5, Math.min(40, Math.floor(8 + h*40)));
          drawPixel(x,y, `rgb(${val},${val},${val+6})`);
        }
        // occasional motion
        if(Math.random() < 0.0006) grid[idx].coin = !grid[idx].coin;
      }
    }
    requestAnimationFrame(render);
  }

  init();
  requestAnimationFrame(render);
})();
