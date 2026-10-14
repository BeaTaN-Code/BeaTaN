/*
 * BeaTaN Shop — interacciones progresivas.
 * Todo funciona sin JavaScript; esto solo mejora la experiencia.
 * Nunca se confía en el navegador para precios, pagos ni permisos.
 */
(function () {
  'use strict';
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* Paneles que se abren/cierran: menú móvil, búsqueda, filtros, menú admin */
  function toggler(buttonSel, getTarget, openClass) {
    $$(buttonSel).forEach(function (btn) {
      var target = getTarget(btn);
      if (!target) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        $$('[aria-controls="' + target.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
        if (openClass) target.classList.toggle(openClass, open); else target.hidden = !open;
        document.documentElement.style.overflow = open && target.dataset.lock ? 'hidden' : '';
        if (open) {
          var focusable = target.querySelector('input, a, button');
          if (focusable) setTimeout(function () { focusable.focus(); }, 30);
        } else {
          btn.focus();
        }
      });
    });
  }
  toggler('[data-toggle]', function (b) { return document.getElementById(b.getAttribute('aria-controls')); }, null);
  toggler('[data-toggle-class]', function (b) { return document.getElementById(b.getAttribute('aria-controls')); }, 'is-open');

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('[aria-expanded="true"][aria-controls]').forEach(function (b) { b.click(); });
  });

  /* Selector de cantidad */
  $$('[data-qty]').forEach(function (wrap) {
    var input = $('input', wrap);
    $$('[data-step]', wrap).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var min = parseInt(input.min || '0', 10), max = parseInt(input.max || '10', 10);
        var v = (parseInt(input.value, 10) || 0) + parseInt(btn.getAttribute('data-step'), 10);
        input.value = Math.max(min, Math.min(max, v));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  });

  /* Galería de producto */
  var main = $('[data-gallery-main]');
  $$('[data-gallery-thumb]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!main) return;
      main.src = btn.getAttribute('data-full');
      main.alt = btn.getAttribute('data-alt') || '';
      $$('[data-gallery-thumb]').forEach(function (b) { b.setAttribute('aria-current', 'false'); });
      btn.setAttribute('aria-current', 'true');
    });
  });

  /* Variantes: actualiza el precio mostrado (solo visual; el servidor recalcula) */
  var priceOut = $('[data-variant-price]');
  $$('input[name="variant_id"][data-price]').forEach(function (r) {
    r.addEventListener('change', function () { if (priceOut && r.checked) priceOut.textContent = r.getAttribute('data-price'); });
  });

  /* Confirmación de acciones delicadas */
  $$('[data-confirm]').forEach(function (el) {
    var evt = el.tagName === 'FORM' ? 'submit' : 'click';
    el.addEventListener(evt, function (e) {
      if (!window.confirm(el.getAttribute('data-confirm'))) { e.preventDefault(); e.stopImmediatePropagation(); }
    });
  });

  /* Evita doble envío de formularios y muestra estado de carga */
  $$('form[data-once]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (form.dataset.sent === '1') { e.preventDefault(); return; }
      form.dataset.sent = '1';
      var btn = e.submitter || $('button[type="submit"], button:not([type])', form);
      if (btn) { btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); }
      setTimeout(function () { form.dataset.sent = ''; if (btn) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); } }, 15000);
    });
  });

  /* Envío automático (redirección a la pasarela) con botón visible de respaldo */
  var auto = $('form[data-autosubmit]');
  if (auto) {
    setTimeout(function () { if (auto.dataset.sent !== '1') { auto.dataset.sent = '1'; auto.submit(); } }, 1400);
  }

  /* Enviar al cambiar (filtros y ordenamiento) */
  $$('[data-submit-on-change]').forEach(function (el) {
    el.addEventListener('change', function () { if (el.form) el.form.submit(); });
  });

  /* Alturas/anchos de gráficos sin estilos en línea (compatible con CSP) */
  $$('[data-h]').forEach(function (el) { el.style.height = Math.max(2, parseInt(el.getAttribute('data-h'), 10) || 0) + '%'; });
  $$('[data-w]').forEach(function (el) { el.style.width = Math.min(100, Math.max(0, parseInt(el.getAttribute('data-w'), 10) || 0)) + '%'; });

  /* Contador de caracteres */
  $$('[data-count]').forEach(function (el) {
    var out = document.getElementById(el.getAttribute('data-count'));
    var update = function () { if (out) out.textContent = el.value.length + ' / ' + el.maxLength; };
    el.addEventListener('input', update); update();
  });
})();
