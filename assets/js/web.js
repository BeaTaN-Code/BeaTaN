/* ==========================================================================
   BeaTaN Group — la red viva (canvas 2D)
   Telaraña orbital generada por código: radios + espiral con caída suave.
   - Se teje una sola vez al cargar (≈1.6 s) y luego queda quieta.
   - Solo vuelve a dibujar mientras hay energía (puntero, pulsos) y está visible.
   - Con prefers-reduced-motion se dibuja estática y no reacciona al puntero.
   Marcado esperado:
     <canvas data-bt-web></canvas>
     <a data-web-anchor="-60">…</a>   (ángulo en grados; 0 = derecha)
     <button data-web-pluck>…</button>
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.querySelector("[data-bt-web]");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var host = canvas.parentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var anchors = Array.prototype.slice.call(document.querySelectorAll("[data-web-anchor]"));

  var SPOKES = 18;
  var RINGS = 13;
  var TAU = Math.PI * 2;

  var W = 0, H = 0, dpr = 1, cx = 0, cy = 0, reach = 0;
  var spokes = [];   // { a, far: {x,y}, nodes: [] }
  var nodes = [];    // lista plana para la física
  var pointer = { x: -9999, y: -9999, inside: false };
  var highlight = -1, highlightAmt = 0, highlightTarget = 0;
  var flash = 0;
  var silk = document.documentElement.classList.contains("bt-silk");
  var introStart = 0, intro = 1;
  var raf = 0, visible = true;
  var plucks = 0;

  // Pseudoaleatorio con semilla: la red siempre tiene la misma forma
  var seed = 7;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function build() {
    var rect = host.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    var wide = W >= 860;
    cx = wide ? W * (W < 1200 ? 0.76 : 0.72) : W * 0.72;
    cy = wide ? H * 0.48 : H * 0.26;
    var webR = wide ? Math.min(W * 0.28, H * 0.4) : Math.max(W, H * 0.5) * 0.62;
    reach = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 40;

    seed = 7;
    spokes = [];
    nodes = [];
    for (var i = 0; i < SPOKES; i++) {
      var a = (i / SPOKES) * TAU + (rand() - 0.5) * 0.12;
      var s = { a: a, far: { x: cx + Math.cos(a) * reach, y: cy + Math.sin(a) * reach }, nodes: [] };
      for (var k = 0; k < RINGS; k++) {
        var t = (k + 1) / RINGS;
        var r = webR * (0.08 + 0.92 * Math.pow(t, 1.15)) * (1 + (rand() - 0.5) * 0.06);
        var x = cx + Math.cos(a) * r;
        var y = cy + Math.sin(a) * r;
        var n = { x: x, y: y, x0: x, y0: y, vx: 0, vy: 0, r: r, kick: 0, kx: 0, ky: 0 };
        s.nodes.push(n);
        nodes.push(n);
      }
      spokes.push(s);
    }
    placeAnchors();
  }

  function nearestSpoke(deg) {
    var target = ((deg * Math.PI) / 180 + TAU) % TAU;
    var best = 0, bestD = 9;
    spokes.forEach(function (s, i) {
      var d = Math.abs(Math.atan2(Math.sin(s.a - target), Math.cos(s.a - target)));
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  function placeAnchors() {
    anchors.forEach(function (el) {
      var idx = nearestSpoke(parseFloat(el.getAttribute("data-web-anchor")) || 0);
      el._spoke = idx;
      var n = spokes[idx].nodes[RINGS - 1];
      var a = spokes[idx].a;
      var x = n.x0 + Math.cos(a) * 26;
      var y = n.y0 + Math.sin(a) * 26;
      // El texto crece hacia fuera de la red
      var w = el.offsetWidth, h = el.offsetHeight;
      var ax = Math.cos(a) < -0.3 ? -1 : Math.cos(a) > 0.3 ? 0 : -0.5;
      var ay = Math.sin(a) < -0.3 ? -1 : Math.sin(a) > 0.3 ? 0 : -0.5;
      // Nunca fuera de la pantalla ni debajo de la cabecera
      var left = Math.max(12, Math.min(W - w - 12, x + ax * w));
      var top = Math.max(84, Math.min(H - h - 12, y + ay * h));
      el.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
    });
  }

  /* ---------------------------------------------------------------- */
  /* Física: muelles amortiguados + empuje del puntero + pulsos        */
  /* ---------------------------------------------------------------- */
  function step() {
    var energy = 0;
    var PR = Math.min(170, W * 0.22);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var ax = (n.x0 - n.x) * 0.06;
      var ay = (n.y0 - n.y) * 0.06;

      if (pointer.inside && !reduce.matches) {
        var dx = n.x - pointer.x, dy = n.y - pointer.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < PR && d > 0.01) {
          var f = (1 - d / PR);
          f = f * f * 2.2;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }

      if (n.kick > 0) {
        n.kick -= 1;
        if (n.kick <= 0) { n.vx += n.kx; n.vy += n.ky; }
        energy += 1;
      }

      n.vx = (n.vx + ax) * 0.86;
      n.vy = (n.vy + ay) * 0.86;
      n.x += n.vx;
      n.y += n.vy;
      energy += Math.abs(n.vx) + Math.abs(n.vy) + Math.abs(n.x - n.x0) * 0.05 + Math.abs(n.y - n.y0) * 0.05;
    }
    highlightAmt += (highlightTarget - highlightAmt) * 0.14;
    if (Math.abs(highlightTarget - highlightAmt) > 0.01) energy += 1;
    if (flash > 0) { flash = Math.max(0, flash - 0.012); energy += 1; }
    return energy;
  }

  /* ---------------------------------------------------------------- */
  /* Dibujo                                                           */
  /* ---------------------------------------------------------------- */
  function strand(alpha) {
    var base = silk ? "255,92,99" : "236,232,230";
    return "rgba(" + base + "," + alpha.toFixed(3) + ")";
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";

    var spokeP = Math.min(1, intro / 0.45);           // los radios se tienden primero
    var ringP = Math.max(0, (intro - 0.3) / 0.7);      // luego la espiral, de dentro hacia fuera
    var redFlash = flash;

    // Radios
    for (var i = 0; i < SPOKES; i++) {
      var s = spokes[i];
      var isHi = i === highlight;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      var limit = reach * spokeP;
      for (var k = 0; k < RINGS; k++) {
        var n = s.nodes[k];
        if (n.r > limit) break;
        ctx.lineTo(n.x, n.y);
      }
      if (spokeP >= 1) ctx.lineTo(s.far.x, s.far.y);
      else ctx.lineTo(cx + Math.cos(s.a) * limit, cy + Math.sin(s.a) * limit);
      ctx.lineWidth = isHi ? 1.4 : 0.8;
      ctx.strokeStyle = isHi
        ? "rgba(255,92,99," + (0.25 + 0.6 * highlightAmt).toFixed(3) + ")"
        : redFlash > 0 ? "rgba(255,92,99," + (0.1 + 0.4 * redFlash).toFixed(3) + ")" : strand(0.11);
      ctx.stroke();
    }

    // Espiral (anillos con caída hacia el centro, como seda con peso)
    var visibleRings = RINGS * ringP;
    for (var k2 = 0; k2 < RINGS; k2++) {
      if (k2 >= visibleRings) break;
      var ringAlpha = Math.min(1, visibleRings - k2);
      var depth = 1 - k2 / RINGS;
      var alpha = (0.07 + depth * 0.16) * ringAlpha;
      ctx.beginPath();
      for (var j = 0; j < SPOKES; j++) {
        var p = spokes[j].nodes[k2];
        var q = spokes[(j + 1) % SPOKES].nodes[k2];
        var mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
        var tx = cx - mx, ty = cy - my;
        var tl = Math.sqrt(tx * tx + ty * ty) || 1;
        var sag = Math.hypot(q.x - p.x, q.y - p.y) * 0.09;
        if (j === 0) ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(mx + (tx / tl) * sag, my + (ty / tl) * sag, q.x, q.y);
      }
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = redFlash > 0
        ? "rgba(255,92,99," + (alpha + 0.35 * redFlash * depth).toFixed(3) + ")"
        : strand(alpha);
      ctx.stroke();
    }

    // Rocío: gotas que brillan donde la red se mueve
    if (intro >= 1) {
      for (var m = 0; m < nodes.length; m++) {
        var nd = nodes[m];
        var disp = Math.abs(nd.x - nd.x0) + Math.abs(nd.y - nd.y0);
        if (disp > 1.5) {
          var g = Math.min(1, disp / 22);
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, 1 + g * 1.4, 0, TAU);
          ctx.fillStyle = "rgba(255,120,126," + (0.25 + g * 0.6).toFixed(3) + ")";
          ctx.fill();
        }
      }
    }

    // Centro de la red: el corazón rojo
    var hubR = 5 + 3 * flash;
    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    glow.addColorStop(0, "rgba(227,38,47,0.55)");
    glow.addColorStop(1, "rgba(227,38,47,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, hubR * Math.min(1, intro * 3), 0, TAU);
    ctx.fillStyle = "#e3262f";
    ctx.fill();
  }

  /* ---------------------------------------------------------------- */
  /* Bucle: solo corre cuando hace falta                              */
  /* ---------------------------------------------------------------- */
  function frame(now) {
    raf = 0;
    if (intro < 1) {
      if (!introStart) introStart = now;
      intro = Math.min(1, (now - introStart) / 1600);
    }
    var energy = step();
    draw();
    if (visible && !document.hidden && (intro < 1 || energy > 0.6 || pointer.inside && energy > 0.05)) {
      raf = requestAnimationFrame(frame);
    }
  }
  function wake() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- */
  /* Pulsar la red: una onda que viaja desde el punto tocado          */
  /* ---------------------------------------------------------------- */
  function pluck(x, y, strength) {
    if (reduce.matches) {
      flash = 0.6; draw(); flash = 0;
      return;
    }
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var dx = n.x0 - x, dy = n.y0 - y;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var amp = strength * Math.exp(-d / 360);
      n.kick = 1 + Math.round(d / 14);
      n.kx = (dx / d) * amp;
      n.ky = (dy / d) * amp;
    }
    plucks++;
    if (plucks === 7 && window.BT && window.BT.toast) {
      flash = 1;
      window.BT.toast("Siete pulsos. La red te reconoce.");
    }
    wake();
  }

  function local(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  host.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var p = local(e);
    pointer.x = p.x; pointer.y = p.y; pointer.inside = true;
    wake();
  });
  host.addEventListener("pointerleave", function () {
    pointer.inside = false;
    pointer.x = pointer.y = -9999;
    wake();
  });
  canvas.addEventListener("click", function (e) {
    var p = local(e);
    pluck(p.x, p.y, 9);
  });
  document.querySelectorAll("[data-web-pluck]").forEach(function (btn) {
    btn.addEventListener("click", function () { pluck(cx, cy, 12); });
  });

  anchors.forEach(function (el) {
    var on = function () { highlight = el._spoke; highlightTarget = 1; wake(); };
    var off = function () { highlightTarget = 0; wake(); };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
  });

  window.addEventListener("bt:silk", function (e) {
    silk = !!e.detail;
    wake();
    if (!raf) draw();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) wake();
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", wake);

  var resizeTimer;
  var lastW = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var w = host.getBoundingClientRect().width;
      // En móvil la barra del navegador cambia la altura: solo reconstruimos si cambia el ancho
      if (Math.abs(w - lastW) < 2 && W < 860) return;
      lastW = w;
      build();
      draw();
    }, 150);
  });

  build();
  lastW = W;
  if (reduce.matches) {
    intro = 1;
    draw();
  } else {
    intro = 0;
    wake();
  }
  canvas.classList.add("is-ready");
})();
