// js/apply_bg.js
// Rainbow neon binary Matrix style, soft / semi-transparent for readability

(() => {
  const canvas = document.getElementById('apply-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', ()=> { W = canvas.width = innerWidth; H = canvas.height = innerHeight; init(); });

  let columns = [];
  const fontSize = Math.max(12, Math.floor(Math.min(W,H) / 40)); // small stream
  let cols = Math.ceil(W / fontSize);

  function init(){
    cols = Math.ceil(W / fontSize);
    columns = [];
    for(let i=0;i<cols;i++){
      columns[i] = { y: Math.random() * H, speed: 1 + Math.random()*1.6 };
    }
  }

  function hsvToRgb(h, s, v){
    // h in [0,1], s,v in [0,1]
    let r,g,b;
    const i = Math.floor(h*6);
    const f = h*6 - i;
    const p = v*(1-s);
    const q = v*(1 - f*s);
    const t = v*(1 - (1-f)*s);
    switch(i%6){
      case 0: r=v; g=t; b=p; break;
      case 1: r=q; g=v; b=p; break;
      case 2: r=p; g=v; b=t; break;
      case 3: r=p; g=q; b=v; break;
      case 4: r=t; g=p; b=v; break;
      case 5: r=v; g=p; b=q; break;
    }
    return `rgb(${Math.floor(r*255)},${Math.floor(g*255)},${Math.floor(b*255)})`;
  }

  function draw(t){
    ctx.clearRect(0,0,W,H);
    // translucent overlay to fade trails slightly
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0,0,W,H);

    for(let i=0;i<cols;i++){
      const col = columns[i];
      col.y += col.speed * fontSize * 0.4;
      if(col.y > H + 50) col.y = -Math.random()*200;

      // draw a column of characters
      for(let k=0;k<Math.floor(H / fontSize / 1.8); k++){
        const x = i * fontSize;
        const y = col.y - k * fontSize * 1.08;
        if(y < -50 || y > H + 50) continue;
        // random binary or punctuation
        const c = Math.random() < 0.7 ? (Math.random() < 0.5 ? '0' : '1') : (Math.random()<0.5?'.':'/');
        // color cycles slowly across hue
        const hue = ((t*0.0001) + i*0.002 + k*0.001) % 1;
        const color = hsvToRgb(hue, 0.85, 0.9);
        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.22 + Math.max(0, 0.65 - k*0.06); // head brighter, tail faded
        ctx.fillText(c, x, y);
      }
      // random flicker removal for glitch feel
      if(Math.random() < 0.002) columns[i].y = -Math.random()*200;
    }

    requestAnimationFrame(draw);
  }

  init();
  requestAnimationFrame(draw);
})();
