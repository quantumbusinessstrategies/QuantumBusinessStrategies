// js/packages_bg.js
// Pixelated vault / coin ocean wave effect using canvas 2D for pixel-art lightweight effect

(() => {
  const canvas = document.getElementById('pkg-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    init();
  });

  // pixel size (bigger = more pixelated)
  const PIX = Math.max(4, Math.floor(Math.min(W,H) / 140));

  let cols, rows, grid = [];

  function init(){
    cols = Math.ceil(W / PIX);
    rows = Math.ceil(H / PIX);
    grid = new Array(cols * rows);
    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x + y*cols;
        // base height using sin + random for organic waves
        grid[idx] = { h: Math.random()*0.001, phase: Math.random()*Math.PI*2, coin: Math.random() < 0.06 };
      }
    }
  }

  function drawPixel(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*PIX, y*PIX, PIX, PIX);
  }

  function shadeForHeight(h){
    // gold-ish palette mapped to pixel height
    const r = Math.max(30, Math.min(255, 220 + h*120));
    const g = Math.max(20, Math.min(200, 140 + h*60));
    const b = Math.max(0, Math.min(140, 50 + h*30));
    return `rgb(${r},${g},${b})`;
  }

  function render(t){
    ctx.clearRect(0,0,W,H);
    // background tile (very dark vault)
    ctx.fillStyle = '#030308';
    ctx.fillRect(0,0,W,H);

    const centerX = cols/2, centerY = rows/2;
    for(let x=0;x<cols;x++){
      for(let y=0;y<rows;y++){
        const idx = x + y*cols;
        const cell = grid[idx];
        // wave propagation: distance from center & time
        const dx = (x-centerX);
        const dy = (y-centerY);
        const dist = Math.sqrt(dx*dx + dy*dy);
        const wave = Math.sin(t*0.0015 + dist*0.15 + cell.phase) * 0.9;
        const h = 0.3 + wave * 0.8;
        cell.h = cell.h * 0.92 + h * 0.08;

        // If coin cell - draw coin highlight and rim darker
        if(cell.coin){
          // coin center highlight with slight shimmer
          const shine = Math.sin(t*0.004 + idx) * 0.5 + 0.5;
          const color = shadeForHeight(cell.h*1.2);
          drawPixel(x,y,color);
          // occasionally animate neighbor glow for "ocean of coins"
          if(Math.random() < 0.0009) {
            cell.coin = false; // temporary disappearance to resemble motion
          }
        } else {
          // dark vault tiles
          const val = Math.floor(10 + cell.h*40);
          const grey = `rgb(${val},${val},${val+6})`;
          drawPixel(x,y,grey);
        }
      }
    }

    requestAnimationFrame(render);
  }

  init();
  requestAnimationFrame(render);
})();
