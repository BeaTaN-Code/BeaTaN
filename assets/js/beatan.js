/* ==========================================================================
   BeaTaN Group — comportamiento compartido de las landings
   Sin dependencias. Todo es mejora progresiva: sin JS el contenido se lee igual.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("bt-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Almacenamiento local opcional (puede fallar en modo privado)
  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) { /* sin almacenamiento: no pasa nada */ }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Toast discreto (anunciado a lectores de pantalla con aria-live)     */
  /* ------------------------------------------------------------------ */
  var toastEl;
  var toastTimer;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "bt-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    // fuerza reflow para reiniciar la transición
    void toastEl.offsetWidth;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 4200);
  }

  window.BT = window.BT || {};
  window.BT.toast = toast;
  window.BT.reduceMotion = reduceMotion;

  /* ------------------------------------------------------------------ */
  /* Cabecera: estado al hacer scroll y menú móvil                       */
  /* ------------------------------------------------------------------ */
  var header = document.querySelector(".bt-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
    updateDangler();
  }

  var nav = document.querySelector(".bt-nav");
  var toggle = document.querySelector(".bt-nav__toggle");
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Revelado progresivo de secciones                                    */
  /* ------------------------------------------------------------------ */
  var reveals = document.querySelectorAll(".bt-reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------------ */
  /* Easter egg 1 — la araña que baja con el scroll                      */
  /* ------------------------------------------------------------------ */
  var dangler = document.querySelector(".bt-dangler");
  var danglerVisits = 0;
  function updateDangler() {
    if (!dangler || dangler.classList.contains("is-climbing")) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var progress = max > 0 ? window.scrollY / max : 0;
    // baja como mucho un 55% de la ventana: acompaña, nunca estorba
    dangler.style.setProperty("--bt-drop", Math.round(progress * window.innerHeight * 0.55) + "px");
  }
  if (dangler) {
    var spider = dangler.querySelector(".bt-dangler__spider");
    var lines = [
      "Sube a revisar la red. Siempre vuelve.",
      "Una red no se termina: se mantiene.",
      "Cada hilo sostiene a los demás.",
      "Sigue bajando. Hay más hilos por descubrir."
    ];
    spider.addEventListener("click", function () {
      toast(lines[danglerVisits % lines.length]);
      danglerVisits++;
      dangler.classList.add("is-climbing");
      setTimeout(function () {
        dangler.classList.remove("is-climbing");
        updateDangler();
      }, reduceMotion.matches ? 200 : 5200);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Easter egg 2 — modo «Seda roja»                                     */
  /* Escribe «beatan» en cualquier parte que no sea un campo de texto,   */
  /* o usa el botón del pie de página.                                   */
  /* ------------------------------------------------------------------ */
  function setSilk(on, announce) {
    root.classList.toggle("bt-silk", on);
    store("bt-silk", on ? "1" : null);
    document.querySelectorAll("[data-bt-silk-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(on));
    });
    window.dispatchEvent(new CustomEvent("bt:silk", { detail: on }));
    if (announce) toast(on ? "Modo seda roja: la red se enciende." : "La seda vuelve a su color.");
  }
  if (store("bt-silk") === "1") setSilk(true, false);

  var secret = "beatan";
  var typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    typed = (typed + e.key.toLowerCase()).slice(-secret.length);
    if (typed === secret) {
      typed = "";
      setSilk(!root.classList.contains("bt-silk"), true);
    }
  });
  document.querySelectorAll("[data-bt-silk-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setSilk(!root.classList.contains("bt-silk"), true);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Cuenta regresiva hacia una fecha (usada en /fest)                   */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll("[data-bt-countdown]").forEach(function (el) {
    var target = new Date(el.getAttribute("data-bt-countdown")).getTime();
    if (isNaN(target)) return;
    var parts = {
      d: el.querySelector("[data-unit='d']"),
      h: el.querySelector("[data-unit='h']"),
      m: el.querySelector("[data-unit='m']")
    };
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / 864e5);
      var h = Math.floor((diff % 864e5) / 36e5);
      var m = Math.floor((diff % 36e5) / 6e4);
      if (parts.d) parts.d.textContent = pad(d);
      if (parts.h) parts.h.textContent = pad(h);
      if (parts.m) parts.m.textContent = pad(m);
      el.hidden = false;
    }
    tick();
    setInterval(tick, 30000);
  });

  /* ------------------------------------------------------------------ */
  /* Utilidades menores                                                  */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll("[data-bt-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateDangler, { passive: true });
  onScroll();

  // Easter egg 3 — un saludo para quien abre la consola
  if (window.console && console.log) {
    console.log(
      "%c🕷  BeaTaN Group%c\nSi estás leyendo esto, ya eres parte de la red.\nPista: la seda tiene una palabra clave.",
      "font:700 16px system-ui;color:#ff5c63",
      "font:12px system-ui;color:#a8a2a4"
    );
  }
})();
