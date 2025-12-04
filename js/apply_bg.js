// js/apply_bg.js
(() => {
  const canvas = document.getElementById('apply-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth, H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=>{ W=canvas.width=innerWidth; H=canvas.height=innerHeight; init(); });

  // draw circuit board faint lines
  function drawCircuit(){
    ctx.strokeStyle = 'rgba(20,200,20,0.08)'; ctx.lineWidth=1;
    const gap = 28;
    for(let x=0;x<W;x+=gap){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for(let y=0;y<H;y+=gap){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
    // some random thin traces
    for(let i=0;i<120;i++){
      ctx.beginPath();
      ctx.moveTo(Math.random()*W, Math.random()*H);
      ctx.lineTo(Math.random()*W, Math.random()*H);
      ctx.strokeStyle = `rgba(180,240,80,0.04)`;
      ctx.stroke();
    }
  }

  let cols, fontSize, columns;
  function init(){
    fontSize = Math.max(12, Math.floor(Math.min(W,H)/36));
    cols = Math.ceil(W / fontSize);
    columns = new Array(cols).fill(0).map(()=> ({ y: Math.random()*H, speed: 0.6+Math.random()*1.4 }));
  }

  function hsvToRgb(h,s,v){
    let r,g,b; const i=Math.floor(h*6); const f=h*6-i; const p=v*(1-s); const q=v*(1-f*s); const t=v*(1-(1-f)*s);
    switch(i%6){ case 0: r=v; g=t; b=p; break; case 1: r=q; g=v; b=p; break; case 2: r=p; g=v; b=t; break; case 3: r=p; g=q; b=v; break; case 4: r=t; g=p; b=v; break; default: r=v; g=p; b=q; }
    return `rgb(${Math.floor(r*255)},${Math.floor(g*255)},${Math.floor(b*255)})`;
  }

  function draw(t){
    // black base
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);
    drawCircuit();

    // translucent fade for trails
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0,0,W,H);

    // draw columns
    ctx.font = `${fontSize}px monospace`;
    for(let i=0;i<cols;i++){
      const col = columns[i];
      col.y += col.speed * fontSize * 0.6;
      if(col.y > H + 100) col.y = -Math.random()*300;

      for(let k=0;k<Math.floor(H / fontSize / 1.4); k++){
        const x = i*fontSize;
        const y = col.y - k*fontSize*1.05;
        if(y < -50 || y>H+50) continue;
        const char = Math.random() < 0.7 ? (Math.random()<0.5?'0':'1') : (Math.random()<0.5?'.':'/');
        const hue = ((t*0.00008) + i*0.002 + k*0.001) % 1;
        ctx.fillStyle = hsvToRgb(hue,0.9,0.9);
        ctx.globalAlpha = 0.22 + Math.max(0, 0.6 - k*0.06);
        ctx.fillText(char, x, y);
      }
      if(Math.random()<0.002) col.y = -Math.random()*400;
    }
    requestAnimationFrame(draw);
  }

  init(); requestAnimationFrame(draw);
})();
