// js/background.js
// Safe fullscreen fragment shader background (procedural rainbow sacred geometry + fractal)
// Works on modern browsers; no external libs required

(function(){
  const canvas = document.getElementById('background-canvas');
  if(!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: true });
  if(!gl){ console.error('WebGL not supported'); return; }

  // size
  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // shader helpers
  const vs = `
    attribute vec2 position;
    varying vec2 vUv;
    void main(){
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fs = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform int u_why;
    varying vec2 vUv;

    // hash / noise helpers
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i+vec2(1.0,0.0));
      float c = hash(i+vec2(0.0,1.0));
      float d = hash(i+vec2(1.0,1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
    }

    // hsl to rgb
    vec3 hsl2rgb(vec3 hsl){
      float h = hsl.x, s = hsl.y, l = hsl.z;
      float c = (1.0 - abs(2.0*l - 1.0)) * s;
      float x = c * (1.0 - abs(mod(h*6.0,2.0)-1.0));
      float m = l - c/2.0;
      vec3 rgb;
      if(h < 1.0/6.0) rgb = vec3(c,x,0.0);
      else if(h < 2.0/6.0) rgb = vec3(x,c,0.0);
      else if(h < 3.0/6.0) rgb = vec3(0.0,c,x);
      else if(h < 4.0/6.0) rgb = vec3(0.0,x,c);
      else if(h < 5.0/6.0) rgb = vec3(x,0.0,c);
      else rgb = vec3(c,0.0,x);
      return rgb + vec3(m);
    }

    // hex grid mask
    float hex(in vec2 p, float scale){
      p *= scale;
      vec2 q = abs(vec2(p.x*0.57735 + p.y*0.57735, p.y*1.1547));
      return step(0.5, fract(q.x*2.0) + fract(q.y*2.0));
    }

    void main(){
      vec2 uv = vUv;
      vec2 center = vec2(0.5,0.5);
      vec2 pos = (uv - center) * vec2(u_res.x/u_res.y,1.0);

      // time
      float t = u_time * 0.0006;

      // base galaxy noise
      float n = 0.0;
      vec2 p = pos * 0.4;
      n += 0.6 * noise(p * 0.8 + t*0.2);
      n += 0.3 * noise(p * 2.4 - t*0.25);
      n += 0.12 * noise(p * 6.0 + vec2(t*0.6, -t*0.4));
      n = smoothstep(0.08, 0.9, n);

      // radial falloff
      float r = length(pos);
      float galaxy = smoothstep(1.2, 0.1, r) * n;

      // sacred geometry rings + hex overlay
      float rings = 0.0;
      float ringCount = 8.0;
      for(float i=1.0;i<=8.0;i+=1.0){
        float radius = 0.08 * i;
        float d = abs(r - radius + 0.03*sin(t*0.5 + i*0.6 + pos.x*3.0));
        float s = smoothstep(0.005, 0.0008, d);
        rings += s * (1.0 - i*0.08);
      }

      // hex lattice subtle
      float hexline = hex(uv * (1.0 + 0.5*sin(t*0.2)), 6.0);
      float hexFade = smoothstep(0.33, 0.5, fract((uv.x+uv.y+ t*0.02)*3.0));

      // tiny particle flecks
      float fleck = pow(max(0.0, 1.0 - r*3.0), 3.0) * (0.3 + 0.7 * hash(floor(uv.xy * 200.0 + t*10.0)));

      // color base: rainbow shift by angle and time
      float angle = atan(pos.y, pos.x) / 6.28318 + 0.5;
      float hue = mod(angle + t*0.08 + (sin(r*6.0 + t*0.6)*0.03), 1.0);

      // why-page tint
      vec3 tint = vec3(1.0,1.0,1.0);
      if(u_why == 1){
        tint = vec3(0.6,0.7,1.0); // dismal blue/purple tone multiplier
      }

      // combine channels
      float glow = galaxy * 1.2 + rings * 0.95 + fleck * 0.9;
      vec3 base = hsl2rgb(vec3(hue, 0.85, 0.5)) * glow;

      // chroma + soft vignette
      float vign = smoothstep(1.2, 0.3, r);
      vec3 color = base * tint * vign;

      // add subtle hex overlay as glint
      color += vec3(0.06,0.04,0.12) * hexline * hexFade * 0.9;

      // final tone mapping + saturation boost
      color = pow(color, vec3(0.95));
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // compile shader helper
  function createShader(gl, type, source){
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.error('Shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vert = createShader(gl, gl.VERTEX_SHADER, vs);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if(!vert || !frag) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.bindAttribLocation(prog, 0, "position");
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  // full screen triangle / quad
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  const verts = new Float32Array([
    -1,-1,
     1,-1,
    -1, 1,
    -1, 1,
     1,-1,
     1, 1
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);

  // uniforms
  const u_res = gl.getUniformLocation(prog, 'u_res');
  const u_time = gl.getUniformLocation(prog, 'u_time');
  const u_why = gl.getUniformLocation(prog, 'u_why');

  // animation
  let start = performance.now();
  function frame(){
    const now = performance.now();
    const t = now - start;
    // update size if needed
    if(canvas.width !== Math.floor(window.innerWidth * Math.min(window.devicePixelRatio||1,2)) ||
       canvas.height !== Math.floor(window.innerHeight * Math.min(window.devicePixelRatio||1,2))){
      resize();
    }
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform2f(u_res, canvas.width, canvas.height);
    gl.uniform1f(u_time, t);
    // detect why page by body class
    const isWhy = document.body.classList.contains('page-why') ? 1 : 0;
    gl.uniform1i(u_why, isWhy);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  console.log('Safe fullscreen shader initialized.');
})();
