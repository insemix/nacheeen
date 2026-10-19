/* Helpers compartidos por todas las calculadoras. Sin dependencias. */
(function (root) {
  'use strict';

  // Acepta "1.234,56", "1,234.56", "1234,5", "1.5", " 12 ".
  function parseNum(raw) {
    if (raw == null) return NaN;
    var s = String(raw).trim().replace(/\s+/g, '').replace(/[€$%]/g, '');
    if (s === '') return NaN;
    var lastDot = s.lastIndexOf('.');
    var lastComma = s.lastIndexOf(',');
    if (lastDot !== -1 && lastComma !== -1) {
      if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
    } else if (lastComma !== -1) {
      s = (s.match(/,/g).length > 1) ? s.replace(/,/g, '') : s.replace(',', '.');
    } else if ((s.match(/\./g) || []).length > 1) {
      s = s.replace(/\./g, '');
    }
    return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) ? parseFloat(s) : NaN;
  }

  function fmt(n, decimals) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    var d = decimals == null ? 2 : decimals;
    return n.toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: d });
  }

  function money(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var H = {
    parseNum: parseNum,
    fmt: fmt,
    money: money,
    esc: esc,
    el: function (id) { return document.getElementById(id); },
    num: function (id) { var e = document.getElementById(id); return e ? parseNum(e.value) : NaN; },
    val: function (id) { var e = document.getElementById(id); return e ? e.value : ''; },
    checked: function (id) { var e = document.getElementById(id); return !!(e && e.checked); },
    out: function (html) { var r = document.getElementById('resultado'); if (r) r.innerHTML = html; },
    stat: function (label, value, big) {
      return '<div class="stat' + (big ? ' big' : '') + '"><span>' + esc(label) + '</span><strong>' + value + '</strong></div>';
    },
    hint: function (text) { return '<p class="hint">' + esc(text) + '</p>'; },
    // Recalcula al escribir, al cambiar y al enviar.
    bind: function (fn) {
      var f = document.getElementById('f');
      if (!f) return;
      var run = function (e) {
        if (e && e.type === 'submit') e.preventDefault();
        try { fn(); } catch (err) { H.out(H.hint('Revisa los datos introducidos.')); }
      };
      f.addEventListener('input', run);
      f.addEventListener('change', run);
      f.addEventListener('submit', run);
      run();
    }
  };

  root.H = H;

  // Filtro de búsqueda en la portada.
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var q = document.getElementById('q');
      if (!q) return;
      var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
      q.addEventListener('input', function () {
        var term = norm(q.value.trim());
        document.querySelectorAll('[data-search]').forEach(function (a) {
          a.hidden = term !== '' && norm(a.getAttribute('data-search')).indexOf(term) === -1;
        });
        document.querySelectorAll('.cat').forEach(function (sec) {
          sec.hidden = !sec.querySelector('[data-search]:not([hidden])');
        });
      });
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
