(function() {
  const canvas = document.createElement('canvas');
  const legend = document.createElement('div');
  canvas.id = 'dbg-overlay-canvas';
  legend.id = 'dbg-legend';
  legend.innerHTML = '🟥 marge &nbsp;&nbsp; 🟩 padding';
  document.body.appendChild(canvas);
  document.body.appendChild(legend);

  const style = document.createElement('style');
  style.textContent = `
    #dbg-overlay-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483647;
    }
    #dbg-legend {
      position: fixed;
      left: 10px;
      bottom: 10px;
      background: rgba(0,0,0,0.65);
      color: #fff;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 6px;
      font-family: system-ui, sans-serif;
      z-index: 2147483647;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  const ctx = canvas.getContext('2d');
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  function resizeCanvas() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const IGNORE = new Set(['HTML','HEAD','BODY','SCRIPT','STYLE','LINK','META','SVG','IMG','IFRAME','CANVAS','INPUT','TEXTAREA','SELECT','OPTION','BUTTON','LABEL','VIDEO','AUDIO']);
  const pxToNum = px => parseFloat(px) || 0;
  const isVisibleRect = r => r.width > 0 && r.height > 0 && r.bottom >= 0 && r.top <= window.innerHeight && r.right >= 0 && r.left <= window.innerWidth;

  function drawDebugOverlay() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const all = Array.from(document.querySelectorAll('body *'));
    for (const el of all) {
      try {
        if (IGNORE.has(el.tagName)) continue;
        const r = el.getBoundingClientRect();
        if (!isVisibleRect(r)) continue;

        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;

        const mt = pxToNum(s.marginTop), mr = pxToNum(s.marginRight),
              mb = pxToNum(s.marginBottom), ml = pxToNum(s.marginLeft);
        const bt = pxToNum(s.borderTopWidth), br = pxToNum(s.borderRightWidth),
              bb = pxToNum(s.borderBottomWidth), bl = pxToNum(s.borderLeftWidth);

        // marge
        ctx.fillStyle = 'rgba(255,0,0,0.12)';
        ctx.strokeStyle = 'rgba(255,0,0,0.45)';
        ctx.lineWidth = 1;
        ctx.fillRect(r.left - ml, r.top - mt, r.width + ml + mr, r.height + mt + mb);
        ctx.strokeRect(r.left - ml, r.top - mt, r.width + ml + mr, r.height + mt + mb);

        // padding
        ctx.fillStyle = 'rgba(0,255,0,0.09)';
        ctx.strokeStyle = 'rgba(0,150,0,0.6)';
        ctx.lineWidth = 0.5;
        ctx.fillRect(r.left + bl, r.top + bt, r.width - bl - br, r.height - bt - bb);
        ctx.strokeRect(r.left + bl, r.top + bt, r.width - bl - br, r.height - bt - bb);
      } catch(e) { }
    }
  }

  function loop() {
    drawDebugOverlay();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resizeCanvas);

  // exécution différée pour laisser le DOM finir de se peindre
  requestAnimationFrame(() => {
    resizeCanvas();
    loop();
  });
})();
