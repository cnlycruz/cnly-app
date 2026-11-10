(() => {
  const root = document.documentElement, cv = document.getElementById('field');
  const panel = document.querySelector('.panel'), btn = document.getElementById('theme');
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = cv.getContext && cv.getContext('2d');
  let W, H, cell, cols, rows, R, color, raf = 0, last = 0, still = mq.matches;
  const ptr = { x: -999, y: -999, tx: -999, ty: -999 }, ripples = [];

  // ---- theme ----
  function label() {
    const dark = root.dataset.theme === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    document.getElementById('tc').content = dark ? '#0c0c0f' : '#ffffff';
    color = getComputedStyle(root).getPropertyValue('--dot').trim();
    if (still) draw(0);
  }
  btn.addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = t;
    try { localStorage.setItem('cnly-theme', t); } catch (e) {}
    label();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    let saved = null; try { saved = localStorage.getItem('cnly-theme'); } catch (_) {}
    if (!saved) { root.dataset.theme = e.matches ? 'dark' : 'light'; label(); }
  });

  if (!ctx) return label();

  // ---- field: a square-dot grid that radiates from the panel ----
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = W < 700 ? 10 : 12; cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
    R = panel.getBoundingClientRect();
    if (still) draw(0);
  }
  function draw(s, now) {
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = color;
    const live = !still;
    for (let j = 0; j < rows; j++) {
      const y = j * cell + cell / 2, dy = Math.max(R.top - y, 0, y - R.bottom);
      for (let i = 0; i < cols; i++) {
        const x = i * cell + cell / 2, dx = Math.max(R.left - x, 0, x - R.right);
        if (dx === 0 && dy === 0) continue;               // hidden behind panel
        const d = Math.hypot(dx, dy);
        const a = (Math.sin(x * .011 + s * .6) + Math.sin(y * .013 - s * .45) + Math.sin((x + y) * .007 + s * .3) + 3) / 6;
        let r = .6 + a * a * 1.7 + 1.3 * Math.max(0, Math.sin(d * .045 - s * 1.3)) * Math.exp(-d / 240);
        r *= Math.min(1, .35 + d / 90);                   // calm halo keeps the panel clean
        if (live) {
          const px = x - ptr.x, py = y - ptr.y;
          r += 2.2 * Math.exp(-(px * px + py * py) / 16000);
          for (const p of ripples) {
            const age = (now - p.t) / 1000, k = Math.hypot(x - p.x, y - p.y) - age * 340;
            r += 3 * Math.exp(-(k * k) / 1600) * (1 - age / 1.8);
          }
        }
        if (r > .35) ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (W < 700 && now - last < 33) return;
    last = now;
    ptr.x += (ptr.tx - ptr.x) * .14; ptr.y += (ptr.ty - ptr.y) * .14;
    while (ripples.length && now - ripples[0].t > 1800) ripples.shift();
    draw(now / 1000, now);
  }
  function run() { cancelAnimationFrame(raf); if (!still && !document.hidden) raf = requestAnimationFrame(loop); else if (still) draw(0); }

  addEventListener('pointermove', e => { ptr.tx = e.clientX; ptr.ty = e.clientY; if (ptr.x < -900) { ptr.x = ptr.tx; ptr.y = ptr.ty; } }, { passive: true });
  addEventListener('pointerdown', e => { if (!still && !btn.contains(e.target)) ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() }); }, { passive: true });
  document.addEventListener('pointerleave', () => { ptr.tx = ptr.ty = -999; });
  addEventListener('resize', size);
  new ResizeObserver(size).observe(panel);
  document.addEventListener('visibilitychange', run);
  mq.addEventListener('change', () => { still = mq.matches; ripples.length = 0; size(); run(); });
  document.fonts && document.fonts.ready.then(size);

  label(); size(); run();
})();
