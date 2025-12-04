
// js/apply_bg.js - rainbow binary rain + circuit board lines
(() => {
  const canvas = document.getElementById('apply-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;

  window.addEventListener('resize', ()=> { W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

  // circuit board lines pre-draw onto an offscreen canvas
  const board = document.createElement('canvas');
  const bctx = board.getContext('2d');

  function drawBoard(){
    board.width = W; board.height = H;
    bctx.fillStyle = '#000';
    bctx.fillRect(0,0,W,H);
    bctx.strokeStyle = '#173a00';
    bctx.lineWidth = 1;
    // grid lines
    for(let x=60; x<W; x+=60){
      bctx.beginPath();
      bctx.moveTo(x,0);
      bctx.lineTo(x,H);
      bctx.stroke();
    }
    for(let y=60; y<H; y+=60){
      bctx.beginPath();
      bctx.moveTo(0,y);
      bctx.lineTo(W,y);
      bctx.stroke();
    }
    // random thin traces
    for(let i=0;i<180;i++){
      bctx.strokeStyle = (Math.random()<0.6)?'#2a8a00':'#9acd00';
      bctx.beginPath();
      const sx = Math.random()*W, sy = Math.random()*H;
      const ex = sx + (Math.random()-0.5)*200;
      const ey = sy + (Math.random()-0.5)*200;
      bctx.moveTo(sx,sy); bctx.lineTo(ex,ey); bctx.stroke();
    }
  }

  let fontSize = Math.max(12, Math.floor(Math.min(W,H)/36));
  let cols = Math.ceil(W / fontSize);
  let columns = [];

  function init(){
    W = canvas.width = innerWidth; H = canvas.height = innerHeight;
    fontSize = Math.max(12, Math.floor(Math.min(W,H)/36));
    cols = Math.ceil(W / fontSize);
    columns = [];
    for(let i=0;i<cols;i++){
      columns[i] = { y: Math.random()*H, speed: 1 + Math.random()*1.6 };
    }
    drawBoard();
  }

  function hsvToRgb(h,s,v){
    const i = Math.floor(h*6); const f = h*6 - i;
    const p = v*(1-s), q = v*(1 - f*s), t = v*(1 - (1-f)*s);
    let r,g,b;
    switch(i%6){ case 0: r=v;g=t;b=p;break; case 1: r=q;g=v;b=p;break; case 2: r=p;g=v;b=t;break; case 3: r=p;g=q;b=v;break; case 4: r=t;g=p;b=v;break; default: r=v;g=p;b=q;break;}
    return `rgb(${Math.floor(r*255)},${Math.floor(g*255)},${Math.floor(b*255)})`;
  }

  function render(t){
    ctx.clearRect(0,0,W,H);
    // draw board background
    ctx.drawImage(board,0,0);

    // translucent black overlay to increase contrast for text
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0,0,W,H);

    for(let i=0;i<cols;i++){
      const col = columns[i];
      col.y += col.speed * fontSize * 0.45;
      if(col.y > H + 50) col.y = -Math.random()*200;

      for(let k=0;k<Math.floor(H / fontSize / 1.6); k++){
        const x = i * fontSize;
        const y = col.y - k * fontSize * 1.05;
        if(y < -50 || y > H + 50) continue;
        const c = Math.random() < 0.7 ? (Math.random()<0.5 ? '0' : '1') : (Math.random()<0.5?'.':'/');
        const hue = ((t*0.00008) + i*0.002 + k*0.001) % 1;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = hsvToRgb(hue, 0.85, 0.95);
        ctx.globalAlpha = 0.22 + Math.max(0, 0.6 - k*0.06);
        ctx.fillText(c, x, y);
      }
      if(Math.random() < 0.0025) columns[i].y = -Math.random()*200;
    }

    requestAnimationFrame(render);
  }

  init();
  requestAnimationFrame(render);
})();
