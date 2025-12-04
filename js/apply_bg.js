// js/apply_bg.js
(() => {
  const canvas = document.getElementById('apply-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=> { W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

  // circuit board pattern generation (thin lines)
  function drawCircuit(){
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);
    ctx.lineWidth = 1;
    // grid of lines
    ctx.strokeStyle = 'rgba(20,200,30,0.12)';
    for(let x=50;x<W;x+=120){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for(let y=40;y<H;y+=120){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
    // some thin traces
    ctx.strokeStyle = 'rgba(200,230,60,0.06)';
    for(let i=0;i<40;i++){
      ctx.beginPath();
      const sx = Math.random()*W, sy = Math.random()*H;
      ctx.moveTo(sx, sy);
      for(let j=0;j<4;j++){
        ctx.lineTo(sx + (Math.random()-0.5)*200, sy + (Math.random()-0.5)*200);
      }
      ctx.stroke();
    }
  }

  // binary rain config
  const fontSize = Math.max(12, Math.floor(Math.min(W,H)/40));
  let cols = Math.ceil(W / fontSize);
  let columns = [];

  function init(){
    cols = Math.ceil(W / fontSize);
    columns = [];
    for(let i=0;i<cols;i++){
      columns[i] = { y: Math.random()*H, speed: 0.6 + Math.random()*1.4 };
    }
    drawCircuit();
  }

  function hsvToRgb(h,s,v){
    let r,g,b; const i=Math.floor(h*6), f=h*6 - i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
    switch(i%6){ case 0: r=v; g=t; b=p; break; case 1: r=q; g=v; b=p; break; case 2: r=p; g=v; b=t; break; case 3: r=p; g=q; b=v; break; case 4: r=t; g=p; b=v; break; case 5: r=v; g=p; b=q; break; }
    return `rgb(${Math.floor(r*255)},${Math.floor(g*255)},${Math.floor(b*255)})`;
  }

  function draw(t){
    // background circuit board
    drawCircuit();

    // overlay semi-transparent black for contrast
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0,0,W,H);

    ctx.font = `${fontSize}px monospace`;
    for(let i=0;i<cols;i++){
      const col = columns[i];
      col.y += col.speed * fontSize * 0.9;
      if(col.y > H + 50) col.y = -Math.random()*200;

      for(let k=0;k<Math.floor(H / fontSize / 1.8); k++){
        const x = i * fontSize;
        const y = col.y - k * fontSize * 1.08;
        if(y < -50 || y > H + 50) continue;
        const c = Math.random() < 0.7 ? (Math.random() < 0.5 ? '0' : '1') : '.';
        const hue = ((t*0.00012) + i*0.002 + k*0.001) % 1;
        const color = hsvToRgb(hue, 0.9, 0.95);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.28 + Math.max(0, 0.6 - k*0.06);
        ctx.fillText(c, x, y);
      }

      if(Math.random() < 0.0025) columns[i].y = -Math.random()*200;
    }

    requestAnimationFrame(draw);
  }

  init();
  requestAnimationFrame(draw);
})();
