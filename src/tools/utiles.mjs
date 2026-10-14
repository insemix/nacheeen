// Calculadoras de fechas, matemáticas y utilidades generales.

export const edad = {
  slug: 'calcular-edad',
  category: 'Fechas',
  title: 'Calcular edad exacta: años, meses y días desde tu nacimiento',
  h1: 'Calculadora de edad',
  short: 'Edad exacta en años, meses y días',
  description: 'Calcula tu edad exacta en años, meses y días, los días que has vivido, cuántos faltan para tu cumpleaños y qué día de la semana naciste.',
  publish: '2026-10-14',
  intro: 'Elige tu fecha de nacimiento. Opcionalmente, cambia la fecha de referencia.',
  form: `
    <div class="row">
      <label>Fecha de nacimiento<input id="b" type="date" value="1990-05-15"></label>
      <label>Calcular a fecha de<input id="ref" type="date"></label>
    </div>`,
  logic: {
    // Fechas como 'YYYY-MM-DD'; cálculo en UTC para evitar problemas de horario de verano.
    age(birth, ref) {
      const [by, bm, bd] = birth.split('-').map(Number), [ry, rm, rd] = ref.split('-').map(Number);
      const refT = Date.UTC(ry, rm - 1, rd);
      // Suma meses ajustando al último día si el mes destino es más corto (31 ene + 1 mes = 28/29 feb).
      const plusMonths = k => Date.UTC(by, bm - 1 + k, Math.min(bd, new Date(Date.UTC(by, bm + k, 0)).getUTCDate()));
      let months = (ry - by) * 12 + (rm - bm);
      if (plusMonths(months) > refT) months--;
      const y = Math.floor(months / 12), m = months % 12, d = Math.round((refT - plusMonths(months)) / 86400000);
      const days = Math.round((refT - Date.UTC(by, bm - 1, bd)) / 86400000);
      let next = Date.UTC(ry, bm - 1, bd);
      if (next < Date.UTC(ry, rm - 1, rd)) next = Date.UTC(ry + 1, bm - 1, bd);
      return { years: y, months: m, days: d, totalDays: days, toBirthday: Math.round((next - Date.UTC(ry, rm - 1, rd)) / 86400000) };
    },
  },
  ui(L, H) {
    const ref = H.el('ref');
    if (!ref.value) ref.value = new Date().toISOString().slice(0, 10);
    H.bind(function () {
      const b = H.val('b'), r = H.val('ref');
      if (!b || !r || b > r) return H.out(H.hint('La fecha de nacimiento debe ser anterior a la de referencia.'));
      const x = L.age(b, r);
      const wd = new Date(b + 'T00:00:00Z').toLocaleDateString('es', { weekday: 'long', timeZone: 'UTC' });
      H.out(H.stat('Edad', x.years + ' años, ' + x.months + ' meses y ' + x.days + ' días', true) +
        H.stat('Días vividos', H.fmt(x.totalDays, 0)) + H.stat('Próximo cumpleaños', x.toBirthday === 0 ? '¡Hoy! 🎉' : 'en ' + x.toBirthday + ' días') +
        H.stat('Naciste en', wd));
    });
  },
  content: `
    <h2>Cómo se calcula la edad exacta</h2>
    <p>Se restan los años, meses y días entre la fecha de nacimiento y la fecha actual. Si el día o el mes de la fecha actual son menores que los de nacimiento, se toma prestado un mes o un año, como en una resta con llevadas. La calculadora tiene en cuenta los años bisiestos y los meses de distinta duración.</p>
    <p>Si naciste un 29 de febrero, en los años no bisiestos tu cumpleaños se considera el 1 de marzo a efectos de este cálculo.</p>`,
  faq: [['¿Cuántos días tiene un año?', '365 días, o 366 en los años bisiestos. Son bisiestos los divisibles entre 4, salvo los seculares (como 1900) que no son divisibles entre 400.']],
};

export const diasEntre = {
  slug: 'dias-entre-fechas',
  category: 'Fechas',
  title: 'Calcular días entre dos fechas (naturales y hábiles)',
  h1: 'Días entre dos fechas',
  short: 'Días naturales y laborables entre fechas',
  description: 'Calcula cuántos días, semanas y días hábiles (de lunes a viernes) hay entre dos fechas. Ideal para plazos, contratos y viajes.',
  publish: '2026-10-14',
  intro: 'Elige la fecha de inicio y la de fin.',
  form: `
    <div class="row">
      <label>Fecha inicial<input id="a" type="date"></label>
      <label>Fecha final<input id="b" type="date"></label>
    </div>
    <label class="inline"><input type="checkbox" id="inc"> Incluir el día final en el recuento</label>`,
  logic: {
    between(a, b, includeEnd) {
      const ta = Date.parse(a + 'T00:00:00Z'), tb = Date.parse(b + 'T00:00:00Z');
      const sign = tb >= ta ? 1 : -1, lo = Math.min(ta, tb), hi = Math.max(ta, tb);
      const days = Math.round((hi - lo) / 86400000) + (includeEnd ? 1 : 0);
      let business = 0;
      const startDow = new Date(lo).getUTCDay();
      const full = Math.floor(days / 7);
      business = full * 5;
      for (let i = 0; i < days % 7; i++) { const d = (startDow + full * 7 + i) % 7; if (d !== 0 && d !== 6) business++; }
      return { days: days * sign, weeks: Math.floor(days / 7), rem: days % 7, business };
    },
  },
  ui(L, H) {
    const a = H.el('a'), b = H.el('b'), t = new Date();
    if (!a.value) a.value = t.toISOString().slice(0, 10);
    if (!b.value) b.value = new Date(Date.UTC(t.getFullYear(), 11, 31)).toISOString().slice(0, 10);
    H.bind(function () {
      if (!H.val('a') || !H.val('b')) return H.out(H.hint('Elige ambas fechas.'));
      const x = L.between(H.val('a'), H.val('b'), H.checked('inc'));
      H.out(H.stat('Días naturales', H.fmt(x.days, 0), true) + H.stat('Semanas', x.weeks + ' semanas y ' + x.rem + ' días') + H.stat('Días hábiles (lun–vie)', H.fmt(x.business, 0)));
    });
  },
  content: `
    <h2>Días naturales y días hábiles</h2>
    <p>Los <strong>días naturales</strong> son todos los días del calendario. Los <strong>días hábiles</strong> excluyen fines de semana y, según el caso, festivos. Esta calculadora descuenta sábados y domingos, pero no los festivos, porque cambian según el país y la región.</p>
    <p>Por defecto no se cuenta el día final: del 1 al 2 de enero hay 1 día. Marca la casilla si necesitas incluirlo, por ejemplo para contar los días de unas vacaciones.</p>`,
  faq: [['¿Cuenta los festivos?', 'No. Resta manualmente los festivos de tu localidad que caigan entre lunes y viernes.']],
};

export const sumarDias = {
  slug: 'sumar-dias-a-una-fecha',
  category: 'Fechas',
  title: 'Sumar o restar días a una fecha',
  h1: 'Sumar o restar días a una fecha',
  short: 'Qué fecha será dentro de N días',
  description: 'Calcula qué fecha será dentro de un número de días, semanas o meses, o qué fecha fue hace N días. También admite días hábiles.',
  publish: '2026-10-14',
  intro: 'Usa un número negativo para restar.',
  form: `
    <div class="row">
      <label>Fecha<input id="d" type="date"></label>
      <label>Cantidad<input id="n" inputmode="numeric" value="30"></label>
      <label>Unidad<select id="u"><option value="d">Días naturales</option><option value="b">Días hábiles</option><option value="w">Semanas</option><option value="m">Meses</option></select></label>
    </div>`,
  logic: {
    add(date, n, unit) {
      const [y, m, d] = date.split('-').map(Number);
      if (unit === 'm') {
        const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
        return new Date(Date.UTC(y, m - 1 + n, Math.min(d, last))).toISOString().slice(0, 10);
      }
      let t = Date.UTC(y, m - 1, d);
      if (unit === 'b') {
        const step = n >= 0 ? 1 : -1;
        let left = Math.abs(n);
        while (left > 0) { t += step * 86400000; const w = new Date(t).getUTCDay(); if (w !== 0 && w !== 6) left--; }
        return new Date(t).toISOString().slice(0, 10);
      }
      return new Date(t + n * (unit === 'w' ? 7 : 1) * 86400000).toISOString().slice(0, 10);
    },
  },
  ui(L, H) {
    const d = H.el('d');
    if (!d.value) d.value = new Date().toISOString().slice(0, 10);
    H.bind(function () {
      const n = Math.round(H.num('n'));
      if (!H.val('d') || !isFinite(n) || Math.abs(n) > 100000) return H.out(H.hint('Introduce una fecha y una cantidad.'));
      const r = L.add(H.val('d'), n, H.val('u'));
      H.out(H.stat('Fecha resultante', new Date(r + 'T00:00:00Z').toLocaleDateString('es', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), true));
    });
  },
  content: `
    <h2>Cómo se suman meses a una fecha</h2>
    <p>Al sumar meses se mantiene el mismo día del mes. Si ese día no existe en el mes de destino (por ejemplo, el 31 de enero + 1 mes), se usa el último día del mes: el 28 o 29 de febrero.</p>
    <p>Con días hábiles se saltan sábados y domingos. Los festivos no se tienen en cuenta.</p>`,
  faq: [['¿Qué fecha será dentro de 90 días?', 'Elige la fecha de hoy, escribe 90 y selecciona «Días naturales».']],
};

export const horas = {
  slug: 'calculadora-horas-trabajadas',
  category: 'Fechas',
  title: 'Calculadora de horas trabajadas semanales',
  h1: 'Calculadora de horas trabajadas',
  short: 'Suma tus horas de la semana y calcula tu pago',
  description: 'Suma las horas trabajadas cada día con hora de entrada, salida y descanso. Obtén el total semanal en horas y minutos, en decimal y el importe a cobrar.',
  publish: '2026-10-14',
  intro: 'Rellena la hora de entrada y de salida de cada día. Deja en blanco los días que no trabajes.',
  form: (() => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days.map((n, i) => `<div class="row"><label>${n}: entrada<input type="time" id="s${i}"${i < 5 ? ' value="09:00"' : ''}></label><label>salida<input type="time" id="e${i}"${i < 5 ? ' value="17:30"' : ''}></label><label>descanso (min)<input id="b${i}" inputmode="numeric"${i < 5 ? ' value="30"' : ''}></label></div>`).join('') +
      '<label>Precio por hora (opcional)<input id="rate" inputmode="decimal"></label>';
  })(),
  logic: {
    minutes(start, end, breakMin) {
      if (!start || !end) return 0;
      const [sh, sm] = start.split(':').map(Number), [eh, em] = end.split(':').map(Number);
      let m = (eh * 60 + em) - (sh * 60 + sm);
      if (m < 0) m += 1440; // turno que cruza la medianoche
      return Math.max(0, m - (breakMin || 0));
    },
  },
  ui(L, H) {
    H.bind(function () {
      let total = 0;
      for (let i = 0; i < 7; i++) total += L.minutes(H.val('s' + i), H.val('e' + i), H.num('b' + i) || 0);
      const rate = H.num('rate');
      H.out(H.stat('Total semanal', Math.floor(total / 60) + ' h ' + (total % 60) + ' min', true) + H.stat('En horas decimales', H.fmt(total / 60, 2)) +
        (isFinite(rate) ? H.stat('Importe', H.money(total / 60 * rate)) : ''));
    });
  },
  content: `
    <h2>Cómo pasar minutos a horas decimales</h2>
    <p>Divide los minutos entre 60: 7 h 30 min = 7,5 horas, y 7 h 45 min = 7,75 horas. Para calcular nóminas o facturas por horas, el formato decimal es el que debes multiplicar por la tarifa.</p>
    <p>Si un turno termina después de medianoche (por ejemplo, de 22:00 a 06:00), la calculadora lo detecta y suma las 8 horas correctamente.</p>`,
  faq: [['¿Cuántas horas son una jornada completa?', 'Depende del país y del convenio. En España el máximo legal es de 40 horas semanales de trabajo efectivo de promedio anual, y en México la jornada diurna máxima es de 8 horas.']],
};

export const reglaTres = {
  slug: 'regla-de-tres',
  category: 'Matemáticas',
  title: 'Calculadora de regla de tres simple directa e inversa',
  h1: 'Calculadora de regla de tres',
  short: 'Regla de tres directa e inversa con explicación',
  description: 'Resuelve reglas de tres simples directas e inversas al instante, con el planteamiento y la operación explicados paso a paso.',
  publish: '2026-10-14',
  intro: 'Si A corresponde a B, ¿cuánto corresponde a C?',
  form: `
    <div class="row">
      <label>A<input id="a" inputmode="decimal" value="3"></label>
      <label>corresponde a B<input id="b" inputmode="decimal" value="12"></label>
      <label>C<input id="c" inputmode="decimal" value="5"></label>
    </div>
    <label>Tipo<select id="t"><option value="d">Directa (a más, más)</option><option value="i">Inversa (a más, menos)</option></select></label>`,
  logic: {
    direct(a, b, c) { return b * c / a; },
    inverse(a, b, c) { return a * b / c; },
  },
  ui(L, H) {
    H.bind(function () {
      const a = H.num('a'), b = H.num('b'), c = H.num('c'), inv = H.val('t') === 'i';
      const x = inv ? L.inverse(a, b, c) : L.direct(a, b, c);
      const op = inv ? H.fmt(a) + ' × ' + H.fmt(b) + ' ÷ ' + H.fmt(c) : H.fmt(b) + ' × ' + H.fmt(c) + ' ÷ ' + H.fmt(a);
      H.out(H.stat('X', H.fmt(x, 6), true) + H.hint('Operación: ' + op));
    });
  },
  content: `
    <h2>Regla de tres directa</h2>
    <p>Se usa cuando las magnitudes son directamente proporcionales: si una aumenta, la otra también. Si 3 kg de manzanas cuestan 12, 5 kg cuestan 12 × 5 ÷ 3 = 20.</p>
    <h2>Regla de tres inversa</h2>
    <p>Se usa cuando al aumentar una magnitud la otra disminuye. Si 3 obreros tardan 12 días, 5 obreros tardan 3 × 12 ÷ 5 = 7,2 días.</p>`,
  faq: [['¿Cómo sé si es directa o inversa?', 'Pregúntate: si duplico una cantidad, ¿la otra se duplica (directa) o se reduce a la mitad (inversa)?']],
};

export const promedio = {
  slug: 'calculadora-promedio-notas',
  category: 'Matemáticas',
  title: 'Calculadora de promedio de notas (media ponderada)',
  h1: 'Calculadora de promedio de notas',
  short: 'Media simple o ponderada de tus calificaciones',
  description: 'Calcula la media de tus notas, simple o ponderada por porcentajes o créditos. Para el colegio, el instituto y la universidad.',
  publish: '2026-10-14',
  intro: 'Introduce las notas y, si cuentan distinto, su peso (porcentaje o créditos). Si dejas los pesos vacíos se calcula la media simple.',
  form: Array.from({ length: 8 }, (_, i) => `<div class="row"><label>Nota ${i + 1}<input id="n${i}" inputmode="decimal"${i < 3 ? ` value="${[7, 8.5, 6][i]}"` : ''}></label><label>Peso<input id="w${i}" inputmode="decimal"${i < 3 ? ` value="${[30, 40, 30][i]}"` : ''}></label></div>`).join(''),
  logic: {
    average(rows) {
      const valid = rows.filter(r => isFinite(r[0]));
      if (!valid.length) return NaN;
      const weighted = valid.some(r => isFinite(r[1]));
      let s = 0, w = 0;
      valid.forEach(r => { const k = weighted ? (isFinite(r[1]) ? r[1] : 0) : 1; s += r[0] * k; w += k; });
      return w ? s / w : NaN;
    },
  },
  ui(L, H) {
    H.bind(function () {
      const rows = [];
      for (let i = 0; i < 8; i++) rows.push([H.num('n' + i), H.num('w' + i)]);
      H.out(H.stat('Promedio', H.fmt(L.average(rows), 2), true));
    });
  },
  content: `
    <h2>Media simple y media ponderada</h2>
    <p>La <strong>media simple</strong> suma todas las notas y las divide entre el número de notas. La <strong>ponderada</strong> multiplica cada nota por su peso, suma los resultados y los divide entre la suma de los pesos: (7×30 + 8,5×40 + 6×30) ÷ 100 = 7,3.</p>
    <p>Los pesos pueden ser porcentajes (que suman 100) o créditos. El resultado es el mismo porque se divide entre la suma de los pesos.</p>`,
  faq: [['¿Qué nota necesito en el examen final para aprobar?', 'Prueba distintos valores en la nota del final con su peso hasta que el promedio llegue al aprobado.']],
};

export const romanos = {
  slug: 'convertidor-numeros-romanos',
  category: 'Matemáticas',
  title: 'Convertidor de números romanos a arábigos y viceversa',
  h1: 'Convertidor de números romanos',
  short: 'Pasa números a romanos y al revés',
  description: 'Convierte números arábigos a números romanos y números romanos a arábigos (del 1 al 3999), con validación de la escritura.',
  publish: '2026-10-14',
  intro: 'Escribe un número (por ejemplo, 2026) o un número romano (por ejemplo, MMXXVI).',
  form: `<label>Número o número romano<input id="x" value="2026" autocapitalize="characters"></label>`,
  logic: {
    toRoman(n) {
      if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
      const t = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let s = '';
      for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
      return s;
    },
    fromRoman(s) {
      s = String(s).toUpperCase().trim();
      const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
      if (!/^[IVXLCDM]+$/.test(s)) return null;
      let n = 0;
      for (let i = 0; i < s.length; i++) n += v[s[i]] < (v[s[i + 1]] || 0) ? -v[s[i]] : v[s[i]];
      return this.toRoman(n) === s ? n : null; // rechaza escrituras no canónicas (IIII, VX…)
    },
  },
  ui(L, H) {
    H.bind(function () {
      const x = H.val('x').trim();
      if (/^\d+$/.test(x)) {
        const r = L.toRoman(parseInt(x, 10));
        return H.out(r ? H.stat('En números romanos', r, true) : H.hint('Los números romanos clásicos van del 1 al 3999.'));
      }
      const n = L.fromRoman(x);
      H.out(n ? H.stat('En números arábigos', String(n), true) : H.hint('No es un número romano válido.'));
    });
  },
  content: `
    <h2>Símbolos de los números romanos</h2>
    <p>I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000.</p>
    <h2>Reglas</h2>
    <ul><li>Los símbolos se suman de izquierda a derecha, de mayor a menor: XV = 15.</li>
    <li>Un símbolo menor delante de uno mayor se resta: IV = 4, XC = 90. Solo pueden restar I (ante V y X), X (ante L y C) y C (ante D y M).</li>
    <li>I, X, C y M se repiten como máximo tres veces seguidas. V, L y D no se repiten.</li></ul>`,
  faq: [['¿Cómo se escribe 2026 en números romanos?', 'MMXXVI: MM (2000) + XX (20) + VI (6).'], ['¿Existe el cero en números romanos?', 'No. Los romanos no tenían un símbolo para el cero.']],
};

export const contrasenas = {
  slug: 'generador-contrasenas-seguras',
  category: 'Utilidades',
  title: 'Generador de contraseñas seguras y aleatorias',
  h1: 'Generador de contraseñas seguras',
  short: 'Crea contraseñas fuertes en tu navegador',
  description: 'Genera contraseñas seguras y aleatorias con letras, números y símbolos. Se crean en tu navegador con criptografía segura y nunca se envían a ningún servidor.',
  publish: '2026-10-14',
  intro: 'Las contraseñas se generan en tu dispositivo con crypto.getRandomValues y no salen de él.',
  form: `
    <label>Longitud<input id="len" type="number" min="4" max="128" value="16"></label>
    <div class="row">
      <label class="inline"><input type="checkbox" id="lo" checked> minúsculas</label>
      <label class="inline"><input type="checkbox" id="up" checked> MAYÚSCULAS</label>
      <label class="inline"><input type="checkbox" id="di" checked> números</label>
      <label class="inline"><input type="checkbox" id="sy" checked> símbolos</label>
    </div>
    <label class="inline"><input type="checkbox" id="amb"> Evitar caracteres ambiguos (0 O l 1 I)</label>
    <button type="submit">Generar otra</button>`,
  logic: {
    pool(o) {
      let p = '';
      if (o.lower) p += 'abcdefghijklmnopqrstuvwxyz';
      if (o.upper) p += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (o.digits) p += '0123456789';
      if (o.symbols) p += '!@#$%&*()-_=+[]{};:,.?/';
      if (o.noAmbiguous) p = p.replace(/[0Ol1I]/g, '');
      return p;
    },
    // randInt(n) debe devolver un entero uniforme en [0, n).
    generate(len, o, randInt) {
      const p = this.pool(o);
      if (!p) return '';
      let s = '';
      for (let i = 0; i < len; i++) s += p[randInt(p.length)];
      return s;
    },
    entropy(len, poolSize) { return poolSize > 1 ? len * Math.log2(poolSize) : 0; },
  },
  ui(L, H) {
    function randInt(n) {
      const lim = Math.floor(4294967296 / n) * n, a = new Uint32Array(1);
      do { crypto.getRandomValues(a); } while (a[0] >= lim); // sin sesgo de módulo
      return a[0] % n;
    }
    H.bind(function () {
      const len = Math.min(128, Math.max(4, Math.round(H.num('len')) || 16));
      const o = { lower: H.checked('lo'), upper: H.checked('up'), digits: H.checked('di'), symbols: H.checked('sy'), noAmbiguous: H.checked('amb') };
      const pw = L.generate(len, o, randInt), bits = L.entropy(len, L.pool(o).length);
      if (!pw) return H.out(H.hint('Marca al menos un tipo de carácter.'));
      const level = bits < 50 ? 'Débil' : bits < 80 ? 'Aceptable' : bits < 110 ? 'Fuerte' : 'Muy fuerte';
      H.out(H.stat('Tu contraseña', '<span class="pw">' + H.esc(pw) + '</span>', true) + H.stat('Seguridad', level + ' (' + H.fmt(bits, 0) + ' bits)') +
        '<button type="button" id="cp">Copiar</button>');
      H.el('cp').onclick = function () { navigator.clipboard && navigator.clipboard.writeText(pw).then(function () { H.el('cp').textContent = 'Copiada ✓'; }); };
    });
  },
  content: `
    <h2>¿Qué hace segura una contraseña?</h2>
    <p>La seguridad depende sobre todo de la <strong>longitud</strong> y de la <strong>aleatoriedad</strong>. Una contraseña aleatoria de 16 caracteres con letras, números y símbolos tiene más de 100 bits de entropía, una cifra imposible de adivinar por fuerza bruta.</p>
    <h2>Buenas prácticas</h2>
    <ul><li>Usa una contraseña distinta para cada servicio.</li><li>Guárdalas en un gestor de contraseñas.</li><li>Activa la verificación en dos pasos siempre que puedas.</li><li>Nunca compartas tus contraseñas por correo o mensajería.</li></ul>`,
  faq: [['¿Es seguro usar este generador?', 'Sí. La contraseña se genera en tu navegador con el generador criptográfico del sistema. No se envía ni se guarda en ningún sitio.']],
};

export const palabras = {
  slug: 'contador-de-palabras',
  category: 'Utilidades',
  title: 'Contador de palabras y caracteres online',
  h1: 'Contador de palabras y caracteres',
  short: 'Palabras, caracteres, frases y tiempo de lectura',
  description: 'Cuenta palabras, caracteres con y sin espacios, frases y párrafos de cualquier texto, y estima el tiempo de lectura. Gratis y sin enviar tu texto a ningún sitio.',
  publish: '2026-10-14',
  intro: 'Pega o escribe tu texto. El recuento se actualiza al instante.',
  form: `<label>Texto<textarea id="t" placeholder="Escribe o pega aquí tu texto…"></textarea></label>`,
  logic: {
    count(text) {
      const t = text.trim();
      const words = t ? t.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length : 0;
      return {
        words,
        chars: [...text].length,
        charsNoSpaces: [...text.replace(/\s/g, '')].length,
        sentences: t ? (t.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || []).filter(s => s.trim()).length : 0,
        paragraphs: t ? t.split(/\n\s*\n/).filter(p => p.trim()).length : 0,
        readingMin: words / 200,
      };
    },
  },
  ui(L, H) {
    H.bind(function () {
      const x = L.count(H.val('t'));
      H.out(H.stat('Palabras', H.fmt(x.words, 0), true) + H.stat('Caracteres', H.fmt(x.chars, 0)) + H.stat('Sin espacios', H.fmt(x.charsNoSpaces, 0)) +
        H.stat('Frases', H.fmt(x.sentences, 0)) + H.stat('Párrafos', H.fmt(x.paragraphs, 0)) + H.stat('Lectura', Math.max(1, Math.ceil(x.readingMin)) + ' min'));
    });
  },
  content: `
    <h2>Para qué sirve un contador de palabras</h2>
    <p>Es útil para trabajos académicos con extensión mínima o máxima, artículos de blog, descripciones de producto, publicaciones en redes sociales con límite de caracteres y textos de traducción que se cobran por palabra.</p>
    <h2>Límites habituales de caracteres</h2>
    <ul><li>Título SEO: unos 60 caracteres.</li><li>Meta descripción: unos 155 caracteres.</li><li>Publicación en X (Twitter): 280 caracteres.</li><li>SMS: 160 caracteres (70 con emojis o tildes en algunos móviles).</li></ul>
    <p>El tiempo de lectura se estima a 200 palabras por minuto, una velocidad media en español.</p>`,
  faq: [['¿Se guarda mi texto?', 'No. El recuento se hace en tu navegador y el texto no se envía a ningún servidor.']],
};

export const combustible = {
  slug: 'calculadora-gasto-gasolina-viaje',
  category: 'Utilidades',
  title: 'Calculadora de gasto de gasolina de un viaje',
  h1: 'Calculadora de gasto de combustible',
  short: 'Cuánto cuesta un viaje en coche',
  description: 'Calcula cuánto te costará la gasolina o el diésel de un viaje según los kilómetros, el consumo de tu coche y el precio del litro. Divide el gasto entre los ocupantes.',
  publish: '2026-10-14',
  intro: 'Ideal para planificar un viaje o repartir gastos con tus acompañantes.',
  form: `
    <div class="row">
      <label>Distancia (km)<input id="km" inputmode="decimal" value="400"></label>
      <label>Consumo (L/100 km)<input id="c" inputmode="decimal" value="6,5"></label>
    </div><div class="row">
      <label>Precio por litro<input id="p" inputmode="decimal" value="1,65"></label>
      <label>Personas<input id="n" inputmode="numeric" value="1"></label>
    </div>
    <label class="inline"><input type="checkbox" id="rt"> Ida y vuelta</label>`,
  logic: {
    trip(km, per100, price, people, roundTrip) {
      const dist = km * (roundTrip ? 2 : 1), liters = dist * per100 / 100, cost = liters * price;
      return { dist, liters, cost, each: cost / Math.max(1, people), perKm: price * per100 / 100 };
    },
  },
  ui(L, H) {
    H.bind(function () {
      const x = L.trip(H.num('km'), H.num('c'), H.num('p'), Math.round(H.num('n')) || 1, H.checked('rt'));
      if (!isFinite(x.cost)) return H.out(H.hint('Completa distancia, consumo y precio.'));
      H.out(H.stat('Coste del combustible', H.money(x.cost), true) + H.stat('Por persona', H.money(x.each)) + H.stat('Litros necesarios', H.fmt(x.liters, 1) + ' L') + H.stat('Coste por km', H.money(x.perKm)));
    });
  },
  content: `
    <h2>Fórmula del gasto de combustible</h2>
    <p><strong>Coste = km × consumo ÷ 100 × precio por litro</strong>. 400 km con un consumo de 6,5 L/100 km y gasolina a 1,65 cuestan 400 × 6,5 ÷ 100 × 1,65 = 42,90.</p>
    <h2>Cómo conocer el consumo real de tu coche</h2>
    <p>Llena el depósito y pon a cero el cuentakilómetros parcial. En el siguiente repostaje, divide los litros que caben entre los kilómetros recorridos y multiplica por 100. Suele ser algo más alto que el consumo homologado.</p>
    <p>Si tu coche indica el consumo en km/L, divide 100 entre esa cifra: 15 km/L equivalen a 6,67 L/100 km.</p>`,
  faq: [['¿Incluye peajes?', 'No. Suma aparte los peajes y el aparcamiento.']],
};

export const temperatura = {
  slug: 'conversor-temperatura',
  category: 'Conversores',
  title: 'Conversor de temperatura: Celsius, Fahrenheit y Kelvin',
  h1: 'Conversor de temperatura',
  short: 'Celsius, Fahrenheit y Kelvin',
  description: 'Convierte temperaturas entre grados Celsius, Fahrenheit y Kelvin al instante, con las fórmulas explicadas.',
  publish: '2026-10-14',
  intro: 'Escribe una temperatura y elige su unidad.',
  form: `
    <div class="row">
      <label>Temperatura<input id="v" inputmode="decimal" value="25"></label>
      <label>Unidad<select id="u"><option value="C">Celsius (°C)</option><option value="F">Fahrenheit (°F)</option><option value="K">Kelvin (K)</option></select></label>
    </div>`,
  logic: {
    convert(v, from) {
      const c = from === 'C' ? v : from === 'F' ? (v - 32) * 5 / 9 : v - 273.15;
      return { C: c, F: c * 9 / 5 + 32, K: c + 273.15 };
    },
  },
  ui(L, H) {
    H.bind(function () {
      const x = L.convert(H.num('v'), H.val('u'));
      H.out(H.stat('Celsius', H.fmt(x.C, 2) + ' °C') + H.stat('Fahrenheit', H.fmt(x.F, 2) + ' °F') + H.stat('Kelvin', H.fmt(x.K, 2) + ' K'));
    });
  },
  content: `
    <h2>Fórmulas de conversión</h2>
    <ul><li>°F = °C × 9/5 + 32</li><li>°C = (°F − 32) × 5/9</li><li>K = °C + 273,15</li></ul>
    <p>Truco rápido: para pasar de °C a °F de forma aproximada, multiplica por 2 y suma 30. Para 25 °C: 25 × 2 + 30 = 80 °F (el valor exacto es 77 °F).</p>`,
  faq: [['¿A qué temperatura coinciden Celsius y Fahrenheit?', 'A −40 grados: −40 °C equivalen exactamente a −40 °F.']],
};

export default [edad, diasEntre, sumarDias, horas, reglaTres, promedio, romanos, contrasenas, palabras, combustible, temperatura];
