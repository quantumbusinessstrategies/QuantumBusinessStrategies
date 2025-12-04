// js/apply_bg.js
// Rainbow neon binary Matrix with subtle circuit board background lines

(() => {
  const canvas = document.getElementById('apply-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

  // circuitboard lines pre-render
  function drawCircuit(){
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,W,H);
    ctx.lineWidth = 1;
    for(let i=0;i<200;i++){
      ctx.strokeStyle = i%2 ? 'rgba(60,200,80,0.06)' : 'rgba(200,200,80,0.03)';
      ctx.beginPath();
      const y = Math.random()*H;
      ctx.moveTo(0,y);
      ctx.bezierCurveTo(W*0.25, y + (Math.random()*200-100), W*0.75, y + (Math.random()*200-100), W, y + (Math.random()*40-20));
      ctx.stroke();
    }
    ctx.restore();
  }

  let columns = [];
  let fontSize = Math.max(12, Math.floor(Math.min(W,H) / 40));
  let cols = Math.ceil(W / fontSize);

  function init(){
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    fontSize = Math.max(12, Math.floor(Math.min(W,H) / 40));
    cols = Math.ceil(W / fontSize);
    columns = [];
    for(let i=0;i<cols;i++){
      columns[i] = { y: Math.random()*H, speed: 0.6 + Math.random()*1.6 };
    }
    // pre-draw static circuitboard
    drawCircuit();
  }

  function hsvToRgb(h,s,v){
    let r,g,b; const i = Math.floor(h*6); const f = h*6 - i; const p = v*(1-s); const q = v*(1-f*s); const t = v*(1-(1-f)*s);
    switch(i%6){ case 0:r=v;g=t;b=p;break; case 1:r=q;g=v;b=p;break; case 2:r=p;g=v;b=t;break; case 3:r=p;g=q;b=v;break; case 4:r=t;g=p;b=v;break; default:r=v;g=p;b=q; }
    return `rgb(${Math.floor(r*255)},${Math.floor(g*255)},${Math.floor(b*255)})`;
  }

  function draw(t){
    // dark overlay to keep circuitboard visible
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0,0,W,H);

    for(let i=0;i<cols;i++){
      const col = columns[i];
      col.y += col.speed * fontSize * 0.45;
      if(col.y > H + 50) col.y = -Math.random()*200;

      const x = i * fontSize;
      for(let k=0;k<Math.floor(H / fontSize / 1.2); k++){
        const y = col.y - k * fontSize * 1.02;
        if(y < -50 || y > H + 50) continue;
        const c = Math.random() < 0.7 ? (Math.random()<0.5?'0':'1') : '.';
        const hue = ((t*0.0001) + i*0.002 + k*0.001) % 1;
        const color = hsvToRgb(hue, 0.95, 0.9);
        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.25 + Math.max(0, 0.6 - k*0.06);
        ctx.fillText(c, x, y);
      }
      if(Math.random() < 0.002) columns[i].y = -Math.random()*200;
    }
    requestAnimationFrame(draw);
  }

  init();
  requestAnimationFrame(draw);
})();
