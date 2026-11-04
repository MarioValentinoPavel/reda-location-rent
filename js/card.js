// La tarjeta de visita de Reda en 3D (WebGL 1): papel negro mate y dorado en caliente que coge la luz.
// Las dos caras se dibujan en canvas con los trazos vectorizados de su tarjeta (assets/brand/*.svg) y Satoshi.
// Textura: R = dorado, G = fibra del papel, B = zona satinada del anverso. Sin WebGL: la cara en 2D, plana.
// API: Card.scroll(p 0..1) da la vuelta con el scroll; Card.toggle() la gira con el botón o al tocarla.
(() => {
  const stage = document.getElementById('card-stage');
  const cv = document.getElementById('card-gl');
  if (!stage || !cv) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const AR = 1.5455;                 // 85 × 55 mm
  const TW = 2048, TH = 1024;        // textura potencia de 2 (mipmaps); la cara se dibuja estirada y el UV la devuelve
  const FW = 2048, FH = Math.round(FW / AR);
  const GOLD = '#d8b24a';

  const api = { scroll() {}, toggle() {}, face: 0, ready: false };
  window.Card = api;

  // ---------- trazos ----------
  async function svg(url) {
    const t = await (await fetch(url)).text();
    const vb = t.match(/viewBox="([^"]+)"/)[1].trim().split(/\s+/).map(Number);
    return { w: vb[2], h: vb[3], p: new Path2D(t.match(/ d="([^"]+)"/)[1]) };
  }
  function put(g, P, x, y, w) { const s = w / P.w; g.save(); g.translate(x, y); g.scale(s, s); g.fill(P.p, 'evenodd'); g.restore(); return P.h * s; }
  function spaced(g, text, x, y, track) { // texto con espaciado manual (letterSpacing no está en todos los canvas)
    let w = 0; for (const ch of text) w += g.measureText(ch).width + track; w -= track;
    let cx = x - w / 2; for (const ch of text) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + track; }
    return w;
  }
  // icono de WhatsApp como en su tarjeta (mismo dibujo que el sprite del HTML, en 24 × 24)
  const WA = new Path2D('M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 1.8a8 8 0 1 1-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0 1 12 4Zm-3.3 3.9c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.5-.5-.5-.7-.5h-.5Z');

  // Cara A: el dorso con el monograma (lo primero que se ve)
  function faceA(g, B, show) {
    g.fillStyle = show ? GOLD : '#f00';
    const jrW = FW * 0.262, jrX = (FW - jrW) / 2, jrY = FH * 0.215;
    const jrH = put(g, B.jr, jrX, jrY, jrW);
    const fs = FW * 0.0335;
    g.font = `500 ${fs}px Satoshi, system-ui, sans-serif`; g.textBaseline = 'alphabetic';
    const base = jrY + jrH + fs * 1.25;
    spaced(g, 'LOCATION / RENT', FW / 2, base, fs * 0.2);
    const byW = FW * 0.17, byH = byW * B.by.h / B.by.w, byY = base + fs * 0.42;
    put(g, B.by, (FW - byW) / 2, byY, byW);
    const ly = byY + byH * 0.53, lw = FW * 0.052, gap = FW * 0.022, lh = Math.max(3, FW * 0.0016);
    g.fillRect(FW / 2 - byW / 2 - gap - lw, ly, lw, lh);
    g.fillRect(FW / 2 + byW / 2 + gap * 0.6, ly, lw, lh);
  }
  // Cara B: el anverso, igual que su tarjeta (firma, servicios FR | EN, WhatsApp y líneas doradas)
  function faceB(g, B, show) {
    const X = (v) => v * FW, Y = (v) => v * FH;
    if (!show) { // zona satinada abajo a la derecha (canal azul)
      g.fillStyle = '#00f'; g.beginPath(); g.moveTo(X(0.719), Y(1)); g.lineTo(X(1), Y(0.596)); g.lineTo(X(1), Y(1)); g.closePath(); g.fill();
      g.globalCompositeOperation = 'lighter';
    }
    g.fillStyle = show ? GOLD : '#f00';
    g.strokeStyle = show ? GOLD : '#f00';
    const fw = X(0.462); const fh = put(g, B.firma, X(0.093), Y(0.165), fw);
    g.fillRect(X(0.1), Y(0.165) + fh * 1.02, X(0.103), Math.max(3, FW * 0.0017));
    const fs = Y(0.043);
    g.font = `500 ${fs}px Satoshi, system-ui, sans-serif`; g.textBaseline = 'alphabetic';
    const fr = ['Agent immobilier', 'Location appartement', 'Location villa', 'Location voiture', 'Transport Touristique'];
    const en = ['Real estate agent', 'Apartment rentals', 'Villa rentals', 'Car rentals', 'Tourist transportation'];
    const rows = [0.446, 0.51, 0.574, 0.638, 0.702];
    rows.forEach((r, i) => { g.fillText(fr[i], X(0.093), Y(r)); g.fillText(en[i], X(0.494), Y(r)); });
    const ps = Y(0.062); const pb = Y(0.873);
    g.save(); g.translate(X(0.088), pb - ps * 0.86); g.scale(ps * 0.95 / 24, ps * 0.95 / 24); g.fill(WA); g.restore();
    g.font = `500 ${ps}px Satoshi, system-ui, sans-serif`;
    g.fillText('+212 652 291 153', X(0.088) + ps * 1.15, pb);
    // líneas: V arriba, «<» a la derecha (el brazo de abajo más apagado) y diagonal abajo
    g.lineWidth = Math.max(3, FW * 0.0019); g.lineCap = 'round'; g.lineJoin = 'round';
    // esquina redondeada: tramo p0→p1 + arco; devuelve el punto donde el arco toca el tramo p1→p2
    const corner = (p0, p1, p2, r) => {
      const a = [X(p0[0]), Y(p0[1])], b = [X(p1[0]), Y(p1[1])], c = [X(p2[0]), Y(p2[1])];
      const u1 = [a[0] - b[0], a[1] - b[1]], u2 = [c[0] - b[0], c[1] - b[1]];
      const l1 = Math.hypot(u1[0], u1[1]), l2 = Math.hypot(u2[0], u2[1]);
      const th = Math.acos((u1[0] * u2[0] + u1[1] * u2[1]) / (l1 * l2)), dd = r / Math.tan(th / 2);
      g.beginPath(); g.moveTo(a[0], a[1]); g.arcTo(b[0], b[1], c[0], c[1], r); g.stroke();
      return [b[0] + u2[0] / l2 * dd, b[1] + u2[1] / l2 * dd, c];
    };
    const v = corner([0.566, -0.02], [0.791, 0.347], [1.02, 0.06], FW * 0.03);
    g.beginPath(); g.moveTo(v[0], v[1]); g.lineTo(v[2][0], v[2][1]); g.stroke();
    const k = corner([1.02, 0.322], [0.815, 0.587], [0.851, 0.723], FW * 0.012);
    g.save(); g.globalAlpha = 0.42; g.beginPath(); g.moveTo(k[0], k[1]); g.lineTo(k[2][0], k[2][1]); g.stroke(); g.restore();
    g.beginPath(); g.moveTo(X(0.709), Y(1.02)); g.lineTo(X(1.02), Y(0.585)); g.stroke();
    g.globalCompositeOperation = 'source-over';
  }
  // canvas de textura (cara estirada a 2048 × 1024) con la fibra del papel en verde
  function texture(B, which) {
    const c = document.createElement('canvas'); c.width = TW; c.height = TH;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#000'; g.fillRect(0, 0, TW, TH);
    g.save(); g.scale(TW / FW, TH / FH); (which ? faceB : faceA)(g, B, false); g.restore();
    const im = g.getImageData(0, 0, TW, TH), d = im.data;
    let s = which ? 7 : 3; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    // fibra: ruido fino + vetas horizontales muy suaves
    const rowN = new Float32Array(TH); for (let y = 0; y < TH; y++) rowN[y] = rnd();
    for (let i = 0, p = 0; p < TW * TH; p++, i += 4) d[i + 1] = Math.min(255, 70 + rnd() * 110 + rowN[(p / TW) | 0] * 40);
    g.putImageData(im, 0, 0);
    return c;
  }
  // cara para mostrar sin WebGL
  function flat(B, which, w, h) {
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d'); g.clearRect(0, 0, w, h);
    const cw = Math.min(w * 0.86, h * 0.78 * AR), ch = cw / AR, x = (w - cw) / 2, y = (h - ch) / 2;
    g.fillStyle = '#121110'; g.fillRect(x, y, cw, ch);
    g.save(); g.translate(x, y); g.scale(cw / FW, ch / FH); (which ? faceB : faceA)(g, B, true); g.restore();
  }

  // ---------- WebGL ----------
  const VS = `
attribute vec3 aP; attribute vec3 aN; attribute vec2 aU; attribute float aF;
uniform mat4 uMV; uniform mat4 uPr;
varying vec2 vU; varying vec3 vN; varying vec3 vP; varying float vF; varying vec3 vTu; varying vec3 vTv;
void main() {
  vec4 p = uMV * vec4(aP, 1.0);
  vP = p.xyz; vU = aU; vF = aF;
  mat3 m = mat3(uMV);
  vN = m * aN;
  vTu = m * vec3(aF > 0.5 && aF < 1.5 ? -1.0 : 1.0, 0.0, 0.0);
  vTv = m * vec3(0.0, -1.0, 0.0);
  gl_Position = uPr * p;
}`;
  const FS = `
precision highp float;
uniform sampler2D uA; uniform sampler2D uB;
uniform vec3 uL; uniform vec2 uTx; uniform float uGlow;
varying vec2 vU; varying vec3 vN; varying vec3 vP; varying float vF; varying vec3 vTu; varying vec3 vTv;
vec4 tex(vec2 u) { return vF < 0.5 ? texture2D(uA, u) : texture2D(uB, u); }
vec3 env(vec3 r) {
  float top = smoothstep(-0.05, 0.9, r.y);
  float win = smoothstep(0.3, 0.7, r.x) * (1.0 - smoothstep(0.78, 1.0, r.x)) * smoothstep(-0.4, 0.3, r.y);
  return vec3(1.0, 0.95, 0.86) * (0.08 + 0.85 * top * top + 0.55 * win);
}
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(-vP);
  vec3 L = normalize(uL - vP);
  if (vF > 1.5) {
    float d = max(dot(N, L), 0.0);
    gl_FragColor = vec4(vec3(0.10, 0.095, 0.088) * (0.35 + 0.9 * d), 1.0);
    return;
  }
  vec4 t = tex(vU);
  float foil = t.r, fib = t.g, panel = t.b;
  // relieve del estampado: el dorado está un poco hundido y sus bordes cogen la luz
  float gx = tex(vU + vec2(uTx.x, 0.0)).r - tex(vU - vec2(uTx.x, 0.0)).r;
  float gy = tex(vU + vec2(0.0, uTx.y)).r - tex(vU - vec2(0.0, uTx.y)).r;
  vec3 Tu = normalize(vTu), Tv = normalize(vTv);
  vec3 Np = normalize(N + (Tu * gx + Tv * gy) * 0.55);
  vec3 H = normalize(L + V);
  // papel negro mate (soft touch) con fibra; la zona satinada brilla un poco más
  vec3 paper = mix(vec3(0.047, 0.044, 0.041), vec3(0.066, 0.062, 0.057), panel) * (0.86 + 0.28 * fib);
  float nl = max(dot(Np, L), 0.0);
  float sheen = pow(max(dot(Np, H), 0.0), mix(14.0, 40.0, panel)) * mix(0.035, 0.12, panel);
  vec3 cPaper = paper * (0.55 + 0.75 * nl) + vec3(sheen);
  // dorado: metal con micro-rayado (de la fibra) y reflejo de una caja de luz cálida
  vec3 Nf = normalize(Np + (Tu * (fib - 0.5) * 0.16 + Tv * (fract(fib * 7.13) - 0.5) * 0.05));
  vec3 R = reflect(-V, Nf);
  float spec = pow(max(dot(Nf, H), 0.0), 64.0);
  float spec2 = pow(max(dot(Nf, H), 0.0), 8.0);
  float fres = pow(1.0 - max(dot(Nf, V), 0.0), 4.0);
  vec3 gold = vec3(0.96, 0.75, 0.31);
  vec3 cFoil = gold * (0.40 + 0.95 * env(R) * (0.75 + 0.25 * nl)) + gold * spec2 * 0.45 + vec3(1.0, 0.93, 0.72) * spec * (1.3 + uGlow) + gold * fres * 0.35;
  vec3 col = mix(cPaper, cFoil, smoothstep(0.08, 0.92, foil));
  col = col / (1.0 + col * 0.3);
  gl_FragColor = vec4(pow(col, vec3(0.94)), 1.0);
}`;

  function boxGeo() {
    const w = AR / 2, h = 0.5, d = 0.0065, P = [], N = [], U = [], F = [];
    const q = (a, b, c, e, n, f) => { const uv = [[0, 1], [1, 1], [1, 0], [0, 0]]; const v = [a, b, c, e]; for (const i of [0, 1, 2, 0, 2, 3]) { P.push(...v[i]); N.push(...n); U.push(...uv[i]); F.push(f); } };
    q([-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d], [0, 0, 1], 0);
    q([w, -h, -d], [-w, -h, -d], [-w, h, -d], [w, h, -d], [0, 0, -1], 1);
    q([w, -h, d], [w, -h, -d], [w, h, -d], [w, h, d], [1, 0, 0], 2);
    q([-w, -h, -d], [-w, -h, d], [-w, h, d], [-w, h, -d], [-1, 0, 0], 2);
    q([-w, h, d], [w, h, d], [w, h, -d], [-w, h, -d], [0, 1, 0], 2);
    q([-w, -h, -d], [w, -h, -d], [w, -h, d], [-w, -h, d], [0, -1, 0], 2);
    return { P: new Float32Array(P), N: new Float32Array(N), U: new Float32Array(U), F: new Float32Array(F), n: P.length / 3 };
  }
  // matrices (columna mayor)
  const persp = (fov, a, n, f) => { const t = 1 / Math.tan(fov / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]; };
  const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
  const rx = (t) => { const c = Math.cos(t), s = Math.sin(t); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; };
  const ry = (t) => { const c = Math.cos(t), s = Math.sin(t); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; };
  const rz = (t) => { const c = Math.cos(t), s = Math.sin(t); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };
  const tr = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  const sc = (s) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];

  function startGL(B) {
    const gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    if (!gl) return false;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    const geo = boxGeo();
    const attr = (name, data, size) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0); };
    attr('aP', geo.P, 3); attr('aN', geo.N, 3); attr('aU', geo.U, 2); attr('aF', geo.F, 1);
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    const mkTex = (canvas, unit) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    };
    mkTex(texture(B, 0), 0); mkTex(texture(B, 1), 1);
    const U = (n) => gl.getUniformLocation(pr, n);
    gl.uniform1i(U('uA'), 0); gl.uniform1i(U('uB'), 1); gl.uniform2f(U('uTx'), 1.6 / TW, 1.6 / TH);
    const uMV = U('uMV'), uPr = U('uPr'), uL = U('uL'), uGlow = U('uGlow');
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE);

    // ---------- estado y muelles ----------
    const S = { flip: 0, flipV: 0, base: 0, scroll: 0, tx: 0, ty: 0, x: 0.42, y: -0.62, vx: 0, vy: 0,
      lx: -1.6, ly: 1.0, ltx: 1.1, lty: 0.9, z: 0.86, vz: 0, glow: 0, idle: 0, px: 0.5, py: 0.5, t0: performance.now(), last: performance.now() };
    let W = 0, Hh = 0, dpr = 1, running = false, visible = true, dirty = true;
    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = stage.getBoundingClientRect(); W = Math.max(1, Math.round(r.width * dpr)); Hh = Math.max(1, Math.round(r.height * dpr));
      if (cv.width !== W || cv.height !== Hh) { cv.width = W; cv.height = Hh; }
      gl.viewport(0, 0, W, Hh);
      const a = W / Hh, fov = 26 * Math.PI / 180, th = Math.tan(fov / 2);
      S.cam = Math.max((AR / 2) * 1.14 / (th * a), 0.5 * 1.32 / th);
      gl.uniformMatrix4fv(uPr, false, new Float32Array(persp(fov, a, 0.1, 30)));
      dirty = true; kick();
    };
    new ResizeObserver(fit).observe(stage);

    const spring = (cur, vel, target, k, damp, dt) => { const a = (target - cur) * k - vel * damp; vel += a * dt; cur += vel * dt; return [cur, vel]; };
    function frame(now) {
      running = false;
      const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
      const t = (now - S.t0) / 1000;
      // objetivo de giro: vuelta por scroll + vueltas del botón
      const target = (S.base + S.scroll) * Math.PI;
      if (RM) { S.flip = target; S.x = S.tx; S.y = S.ty; S.z = 1; }
      else {
        [S.flip, S.flipV] = spring(S.flip, S.flipV, target, 38, 10.5, dt);
        // inclinación: cursor (escritorio) o vaivén lento (táctil / sin cursor)
        S.idle += dt;
        let tx = S.tx, ty = S.ty;
        if (!FINE || S.idle > 3.5) { tx = Math.sin(t * 0.45) * 0.07; ty = Math.sin(t * 0.32) * 0.13; S.ltx = Math.cos(t * 0.38) * 1.35; S.lty = 0.75 + Math.sin(t * 0.29) * 0.55; }
        [S.x, S.vx] = spring(S.x, S.vx, tx, 22, 7.5, dt);
        [S.y, S.vy] = spring(S.y, S.vy, ty, 22, 7.5, dt);
        [S.z, S.vz] = spring(S.z, S.vz, 1, 30, 9, dt);
        S.lx += (S.ltx - S.lx) * Math.min(1, dt * 4); S.ly += (S.lty - S.ly) * Math.min(1, dt * 4);
        S.glow *= Math.pow(0.04, dt);
      }
      const face = Math.round((S.flip / Math.PI)) % 2 === 0 ? 0 : 1;
      api.face = Math.abs(face);
      const model = mul(rx(S.x), mul(ry(S.flip + S.y), mul(rz(-0.035 + S.y * 0.08), sc(S.z))));
      const mv = mul(tr(0, 0, -S.cam), model);
      gl.uniformMatrix4fv(uMV, false, new Float32Array(mv));
      gl.uniform3f(uL, S.lx * S.cam * 0.55, S.ly * S.cam * 0.5, S.cam * 0.75 - S.cam);
      gl.uniform1f(uGlow, S.glow);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, geo.n);
      const moving = !RM && (visible && (Math.abs(S.flip - target) > 0.0005 || Math.abs(S.flipV) > 0.001 || Math.abs(S.vx) > 0.0004 || Math.abs(S.vy) > 0.0004 || Math.abs(S.z - 1) > 0.0005 || !FINE || S.idle > 3.5 || Math.abs(S.lx - S.ltx) > 0.002));
      if (moving || dirty) { dirty = false; kick(); }
    }
    function kick() { if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(frame); } }
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; kick(); }).observe(stage);
    document.addEventListener('visibilitychange', kick);

    if (FINE && !RM) {
      const hero = stage.closest('section') || stage;
      hero.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        S.tx = Math.max(-0.32, Math.min(0.32, (py - 0.5) * 0.42));
        S.ty = Math.max(-0.42, Math.min(0.42, (px - 0.5) * 0.55));
        S.ltx = (px - 0.5) * 3.2; S.lty = (0.5 - py) * 2.6 + 0.4;
        S.idle = 0; kick();
      });
      hero.addEventListener('pointerleave', () => { S.tx = 0; S.ty = 0; S.idle = 2.5; kick(); });
    }
    api.scroll = (p) => { S.scroll = Math.max(0, Math.min(1, p)); kick(); };
    api.toggle = () => { S.base = S.base ? 0 : 1; S.glow = 1.4; S.idle = 0; kick(); };
    api.shot = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(cv, 0, 0, w, h); return c; };
    // entrada: la tarjeta llega girada y una luz la barre
    if (!RM) { S.ltx = 1.2; S.lty = 0.95; S.glow = 0.8; }
    fit();
    return true;
  }

  function startFlat(B) {
    stage.classList.add('fallback');
    let which = 0;
    const draw = () => { const r = stage.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2); flat(B, which, Math.round(r.width * d), Math.round(r.height * d)); };
    new ResizeObserver(draw).observe(stage);
    api.toggle = () => { which = 1 - which; api.face = which; draw(); };
    api.scroll = (p) => { const w = p > 0.5 ? 1 : 0; if (w !== which) { which = w; api.face = w; draw(); } };
    draw();
  }

  (async () => {
    try {
      const [jr, firma, by] = await Promise.all([svg('assets/brand/jr.svg'), svg('assets/brand/firma.svg'), svg('assets/brand/by-reda.svg')]);
      await Promise.race([document.fonts.load('500 64px Satoshi'), new Promise((r) => setTimeout(r, 2500))]);
      const B = { jr, firma, by };
      let ok = false;
      try { ok = startGL(B); } catch (err) { console.warn('card: WebGL', err); ok = false; }
      if (!ok) startFlat(B);
      api.ready = true;
      document.dispatchEvent(new CustomEvent('cardready'));
    } catch (err) { console.warn('card', err); stage.classList.add('fallback'); }
  })();

  const btn = document.getElementById('card-flip');
  if (btn) btn.addEventListener('click', () => api.toggle());
  cv.addEventListener('click', () => api.toggle());
})();
