// Calculadoras de finanzas personales y comercio.
// `logic`: funciones puras (se testean y se incrustan en la página).
// `ui(L, H, D)`: se ejecuta en el navegador; L = logic, H = helpers, D = valores por defecto.

export const IVA_RATES = [
  ['España', 21], ['México', 16], ['Argentina', 21], ['Colombia', 19], ['Chile', 19],
  ['Perú (IGV)', 18], ['Ecuador', 15], ['Uruguay', 22], ['Paraguay', 10], ['Bolivia', 13],
  ['Venezuela', 16], ['Guatemala', 12], ['Costa Rica', 13], ['Rep. Dominicana (ITBIS)', 18],
  ['Panamá (ITBMS)', 7], ['El Salvador', 13], ['Honduras (ISV)', 15], ['Nicaragua', 15],
];

const ivaOptions = IVA_RATES.map(([n, r]) => `<option value="${r}">${n} — ${r}%</option>`).join('');

export const iva = {
  slug: 'calculadora-iva',
  category: 'Finanzas',
  title: 'Calculadora de IVA: añadir o quitar IVA a un precio',
  h1: 'Calculadora de IVA',
  short: 'Añade o quita el IVA de cualquier importe',
  description: 'Calcula el IVA de un precio al instante: suma el IVA a una base imponible o desglosa el IVA incluido en un total. Tipos de España y Latinoamérica.',
  publish: '2026-10-14',
  defaults: { rate: 21 },
  intro: 'Escribe un importe, elige el tipo de IVA y obtén la base, la cuota de IVA y el total al momento.',
  form: `
    <div class="row">
      <label>Importe<input id="amount" inputmode="decimal" placeholder="100" value="100"></label>
      <label>Tipo de IVA (%)<input id="rate" inputmode="decimal" value="21"></label>
    </div>
    <label>Tipos habituales<select id="preset"><option value="">Elegir país…</option>${ivaOptions}</select></label>
    <div class="row">
      <label class="inline"><input type="radio" name="mode" id="add" checked> El importe es sin IVA (añadir)</label>
      <label class="inline"><input type="radio" name="mode" id="remove"> El importe ya incluye IVA (quitar)</label>
    </div>`,
  logic: {
    add(base, rate) {
      const iva = base * rate / 100;
      return { base, iva, total: base + iva };
    },
    remove(total, rate) {
      const base = total / (1 + rate / 100);
      return { base, iva: total - base, total };
    },
  },
  ui(L, H, D) {
    if (D.rate != null) H.el('rate').value = String(D.rate).replace('.', ',');
    if (D.mode === 'remove') H.el('remove').checked = true;
    H.el('preset').addEventListener('change', function () {
      if (this.value) H.el('rate').value = this.value;
    });
    H.bind(function () {
      const a = H.num('amount'), r = H.num('rate');
      if (!isFinite(a) || !isFinite(r)) return H.out(H.hint('Introduce un importe y un tipo de IVA.'));
      const x = H.checked('remove') ? L.remove(a, r) : L.add(a, r);
      H.out(H.stat('Total con IVA', H.money(x.total), true) +
        H.stat('Base imponible (sin IVA)', H.money(x.base)) +
        H.stat('Cuota de IVA (' + H.fmt(r) + '%)', H.money(x.iva)));
    });
  },
  content: `
    <h2>Cómo calcular el IVA</h2>
    <p>El IVA (Impuesto al Valor Agregado o Añadido) se calcula como un porcentaje sobre la base imponible, que es el precio del producto o servicio antes de impuestos.</p>
    <h3>Añadir IVA a un precio</h3>
    <p><strong>Total = Base × (1 + tipo / 100)</strong>. Por ejemplo, con una base de 100 y un IVA del 21%: 100 × 1,21 = 121. La cuota de IVA es 21.</p>
    <h3>Quitar el IVA de un precio (desglosar)</h3>
    <p><strong>Base = Total ÷ (1 + tipo / 100)</strong>. Un error frecuente es restar el 21% al total: si un producto cuesta 121 con IVA, la base no es 121 − 21% (95,59), sino 121 ÷ 1,21 = 100.</p>
    <h2>Tipos de IVA por país</h2>
    <p>Los tipos generales de la lista son orientativos. Muchos países aplican además tipos reducidos para alimentos, medicinas o libros. Antes de facturar, confirma siempre el tipo vigente con la autoridad tributaria de tu país.</p>`,
  faq: [
    ['¿Cómo saco el IVA de un precio que ya lo incluye?', 'Divide el precio entre 1 más el tipo expresado en decimal. Con un IVA del 16%: precio ÷ 1,16. El resultado es la base, y la diferencia con el total es el IVA.'],
    ['¿Por qué no puedo restar directamente el porcentaje?', 'Porque el IVA se calcula sobre la base y no sobre el total. Si restas el porcentaje al total, le estás aplicando el porcentaje a una cantidad mayor y la base sale más baja de lo que es.'],
    ['¿Esta calculadora guarda mis datos?', 'No. Todos los cálculos se hacen en tu navegador y no se envía nada a ningún servidor.'],
  ],
};

export const porcentaje = {
  slug: 'calculadora-porcentajes',
  category: 'Matemáticas',
  title: 'Calculadora de porcentajes online: % de un número, aumento y descuento',
  h1: 'Calculadora de porcentajes',
  short: 'Cuánto es el X% de Y, qué porcentaje es y variación',
  description: 'Calcula porcentajes fácilmente: cuánto es el X% de un número, qué porcentaje representa una cantidad de otra y el porcentaje de aumento o disminución.',
  publish: '2026-10-14',
  intro: 'Tres calculadoras en una. Rellena la que necesites y el resultado aparece al momento.',
  form: `
    <fieldset><legend>¿Cuánto es el X% de Y?</legend><div class="row">
      <label>Porcentaje (%)<input id="p1" inputmode="decimal" value="15"></label>
      <label>de la cantidad<input id="v1" inputmode="decimal" value="200"></label></div></fieldset>
    <fieldset><legend>¿Qué porcentaje es X de Y?</legend><div class="row">
      <label>Cantidad<input id="a2" inputmode="decimal" value="30"></label>
      <label>del total<input id="b2" inputmode="decimal" value="120"></label></div></fieldset>
    <fieldset><legend>Variación porcentual de X a Y</legend><div class="row">
      <label>Valor inicial<input id="a3" inputmode="decimal" value="80"></label>
      <label>Valor final<input id="b3" inputmode="decimal" value="100"></label></div></fieldset>`,
  logic: {
    percentOf(p, x) { return x * p / 100; },
    whatPercent(a, b) { return b === 0 ? NaN : a / b * 100; },
    change(a, b) { return a === 0 ? NaN : (b - a) / Math.abs(a) * 100; },
  },
  ui(L, H) {
    H.bind(function () {
      const r1 = L.percentOf(H.num('p1'), H.num('v1'));
      const r2 = L.whatPercent(H.num('a2'), H.num('b2'));
      const r3 = L.change(H.num('a3'), H.num('b3'));
      H.out(
        H.stat(H.fmt(H.num('p1')) + '% de ' + H.fmt(H.num('v1')), H.fmt(r1, 4)) +
        H.stat(H.fmt(H.num('a2')) + ' respecto de ' + H.fmt(H.num('b2')), H.fmt(r2, 4) + '%') +
        H.stat('Variación', (r3 > 0 ? '+' : '') + H.fmt(r3, 4) + '%'));
    });
  },
  content: `
    <h2>Fórmulas de porcentajes</h2>
    <ul>
      <li><strong>X% de Y:</strong> Y × X ÷ 100. El 15% de 200 es 200 × 15 ÷ 100 = 30.</li>
      <li><strong>Qué % es A de B:</strong> A ÷ B × 100. 30 de 120 es el 25%.</li>
      <li><strong>Variación porcentual:</strong> (final − inicial) ÷ inicial × 100. De 80 a 100 hay un aumento del 25%.</li>
    </ul>
    <h2>Trucos para calcular porcentajes de cabeza</h2>
    <p>El 10% de un número se obtiene moviendo la coma un lugar a la izquierda (10% de 350 = 35). El 5% es la mitad del 10%, el 20% es el doble y el 1% se obtiene moviendo la coma dos lugares. Combinándolos puedes calcular casi cualquier porcentaje: 15% = 10% + 5%.</p>
    <p>Recuerda que los porcentajes no son simétricos: subir un 25% y luego bajar un 25% no deja el valor igual. 80 → 100 es +25%, pero 100 → 80 es −20%.</p>`,
  faq: [
    ['¿Cómo calculo un aumento del X%?', 'Multiplica la cantidad por (1 + X/100). Para subir 200 un 15%: 200 × 1,15 = 230.'],
    ['¿Cómo calculo un descuento del X%?', 'Multiplica por (1 − X/100). Un 30% de descuento sobre 50 es 50 × 0,70 = 35.'],
    ['¿Qué diferencia hay entre puntos porcentuales y porcentaje?', 'Si un interés pasa del 4% al 5%, sube 1 punto porcentual, pero aumenta un 25% en términos relativos.'],
  ],
};

export const interesCompuesto = {
  slug: 'calculadora-interes-compuesto',
  category: 'Finanzas',
  title: 'Calculadora de interés compuesto con aportaciones mensuales',
  h1: 'Calculadora de interés compuesto',
  short: 'Cuánto crecerán tus ahorros con el tiempo',
  description: 'Calcula cuánto crecerá tu dinero con interés compuesto y aportaciones mensuales. Tabla año a año con capital aportado e intereses generados.',
  publish: '2026-10-14',
  intro: 'Introduce tu capital inicial, cuánto aportarás cada mes, la rentabilidad anual esperada y el plazo.',
  form: `
    <div class="row">
      <label>Capital inicial<input id="p" inputmode="decimal" value="1000"></label>
      <label>Aportación mensual<input id="m" inputmode="decimal" value="100"></label>
    </div>
    <div class="row">
      <label>Interés anual (%)<input id="r" inputmode="decimal" value="7"></label>
      <label>Años<input id="y" inputmode="numeric" value="20"></label>
    </div>`,
  logic: {
    // Capitalización mensual con interés nominal anual; aportación al final de cada mes.
    compound(principal, monthly, annualRate, years) {
      const r = annualRate / 100 / 12;
      const rows = [];
      let bal = principal, contributed = principal;
      for (let y = 1; y <= years; y++) {
        for (let m = 0; m < 12; m++) { bal = bal * (1 + r) + monthly; contributed += monthly; }
        rows.push({ year: y, balance: bal, contributed, interest: bal - contributed });
      }
      return rows;
    },
  },
  ui(L, H) {
    H.bind(function () {
      const p = H.num('p') || 0, m = H.num('m') || 0, r = H.num('r'), y = Math.round(H.num('y'));
      if (!isFinite(r) || !(y > 0) || y > 100) return H.out(H.hint('Introduce un interés y un número de años entre 1 y 100.'));
      const rows = L.compound(p, m, r, y), last = rows[rows.length - 1];
      let t = '<div class="table-wrap"><table><thead><tr><th>Año</th><th>Aportado</th><th>Intereses</th><th>Saldo</th></tr></thead><tbody>';
      rows.forEach(function (x) { t += '<tr><td>' + x.year + '</td><td>' + H.money(x.contributed) + '</td><td>' + H.money(x.interest) + '</td><td>' + H.money(x.balance) + '</td></tr>'; });
      H.out(H.stat('Saldo final tras ' + y + ' años', H.money(last.balance), true) +
        H.stat('Total aportado', H.money(last.contributed)) +
        H.stat('Intereses generados', H.money(last.interest)) + t + '</tbody></table></div>');
    });
  },
  content: `
    <h2>Qué es el interés compuesto</h2>
    <p>Con el interés compuesto, los intereses que generas se suman al capital y empiezan a generar intereses a su vez. Por eso el crecimiento se acelera con el tiempo: en los primeros años la mayor parte del saldo son tus aportaciones, y con plazos largos los intereses acaban superándolas.</p>
    <h2>Fórmula</h2>
    <p>Sin aportaciones: <strong>C<sub>f</sub> = C<sub>0</sub> × (1 + r/n)<sup>n·t</sup></strong>, donde r es el interés anual, n el número de capitalizaciones al año y t los años. La calculadora capitaliza mensualmente y suma tu aportación al final de cada mes.</p>
    <h2>La regla del 72</h2>
    <p>Para saber de memoria en cuántos años se duplica tu dinero, divide 72 entre el interés anual. Al 7%, el capital se duplica en unos 10 años; al 4%, en unos 18.</p>
    <p><em>Esta herramienta es una simulación y no constituye asesoramiento financiero. Las rentabilidades pasadas no garantizan rentabilidades futuras, y la inflación y los impuestos reducen el resultado real.</em></p>`,
  faq: [
    ['¿Qué diferencia hay entre interés simple y compuesto?', 'El simple solo se calcula sobre el capital inicial. El compuesto se calcula también sobre los intereses acumulados, así que con plazos largos crece mucho más rápido.'],
    ['¿Qué rentabilidad anual es realista?', 'Depende del producto. Los depósitos suelen ofrecer poco, y los índices bursátiles amplios han rendido históricamente más, pero con años negativos. Prueba varios escenarios.'],
  ],
};

export const prestamo = {
  slug: 'calculadora-prestamos',
  category: 'Finanzas',
  title: 'Calculadora de préstamos: cuota mensual y tabla de amortización',
  h1: 'Calculadora de préstamos y cuota mensual',
  short: 'Cuota mensual, intereses totales y amortización',
  description: 'Calcula la cuota mensual de un préstamo o hipoteca (sistema francés), el total de intereses y la tabla de amortización año a año.',
  publish: '2026-10-14',
  intro: 'Sirve para préstamos personales, de coche e hipotecas con cuota fija (sistema francés).',
  form: `
    <div class="row">
      <label>Importe del préstamo<input id="p" inputmode="decimal" value="20000"></label>
      <label>Interés anual (TIN %)<input id="r" inputmode="decimal" value="6,5"></label>
      <label>Plazo (meses)<input id="n" inputmode="numeric" value="60"></label>
    </div>`,
  logic: {
    payment(principal, annualRate, months) {
      const r = annualRate / 100 / 12;
      if (r === 0) return principal / months;
      return principal * r / (1 - Math.pow(1 + r, -months));
    },
    schedule(principal, annualRate, months) {
      const r = annualRate / 100 / 12, pay = this.payment(principal, annualRate, months);
      const years = [];
      let bal = principal, yi = 0, yp = 0;
      for (let k = 1; k <= months; k++) {
        const i = bal * r, amort = pay - i;
        bal -= amort; yi += i; yp += amort;
        if (k % 12 === 0 || k === months) {
          years.push({ year: Math.ceil(k / 12), interest: yi, principal: yp, balance: Math.max(0, bal) });
          yi = 0; yp = 0;
        }
      }
      return { payment: pay, total: pay * months, interest: pay * months - principal, years };
    },
  },
  ui(L, H) {
    H.bind(function () {
      const p = H.num('p'), r = H.num('r'), n = Math.round(H.num('n'));
      if (!(p > 0) || !(r >= 0) || !(n > 0) || n > 600) return H.out(H.hint('Introduce importe, interés y un plazo de 1 a 600 meses.'));
      const s = L.schedule(p, r, n);
      let t = '<div class="table-wrap"><table><thead><tr><th>Año</th><th>Intereses</th><th>Capital amortizado</th><th>Pendiente</th></tr></thead><tbody>';
      s.years.forEach(function (x) { t += '<tr><td>' + x.year + '</td><td>' + H.money(x.interest) + '</td><td>' + H.money(x.principal) + '</td><td>' + H.money(x.balance) + '</td></tr>'; });
      H.out(H.stat('Cuota mensual', H.money(s.payment), true) +
        H.stat('Total a pagar', H.money(s.total)) + H.stat('Intereses totales', H.money(s.interest)) +
        t + '</tbody></table></div>');
    });
  },
  content: `
    <h2>Cómo se calcula la cuota de un préstamo</h2>
    <p>En el sistema francés, el más usado por los bancos, la cuota es constante: <strong>Cuota = P × i ÷ (1 − (1 + i)<sup>−n</sup>)</strong>, donde P es el capital, i el interés mensual (TIN ÷ 12) y n el número de cuotas.</p>
    <p>Al principio la mayor parte de la cuota son intereses. A medida que se reduce la deuda pendiente, cada cuota amortiza más capital.</p>
    <h2>TIN y TAE</h2>
    <p>El TIN es el interés nominal que se usa para calcular la cuota. La TAE incluye además comisiones y gastos obligatorios, y es la cifra útil para comparar ofertas entre bancos.</p>
    <h2>Cómo pagar menos intereses</h2>
    <ul><li>Acorta el plazo si puedes asumir una cuota algo mayor.</li><li>Haz amortizaciones anticipadas: reducen el capital sobre el que se calculan los intereses.</li><li>Compara la TAE, no solo el TIN.</li></ul>`,
  faq: [
    ['¿Sirve para calcular una hipoteca?', 'Sí, para hipotecas de tipo fijo. En una hipoteca variable la cuota cambia en cada revisión, así que el resultado es una estimación con el tipo actual.'],
    ['¿Incluye seguros y comisiones?', 'No. Calcula solo capital e intereses. Suma aparte los seguros vinculados y las comisiones.'],
  ],
};

export const descuento = {
  slug: 'calculadora-descuentos',
  category: 'Finanzas',
  title: 'Calculadora de descuentos: precio final y ahorro',
  h1: 'Calculadora de descuentos',
  short: 'Precio final tras uno o dos descuentos',
  description: 'Calcula el precio final con descuento y cuánto ahorras. Admite descuentos encadenados (por ejemplo, 20% + 10% adicional).',
  publish: '2026-10-14',
  intro: 'Útil para rebajas, Black Friday y cupones acumulables.',
  form: `
    <div class="row">
      <label>Precio original<input id="p" inputmode="decimal" value="80"></label>
      <label>Descuento (%)<input id="d1" inputmode="decimal" value="20"></label>
      <label>Descuento adicional (%)<input id="d2" inputmode="decimal" placeholder="opcional"></label>
    </div>`,
  logic: {
    apply(price, d1, d2) {
      const final = price * (1 - d1 / 100) * (1 - (d2 || 0) / 100);
      return { final, saved: price - final, effective: price ? (1 - final / price) * 100 : 0 };
    },
  },
  ui(L, H) {
    H.bind(function () {
      const p = H.num('p'), d1 = H.num('d1') || 0, d2 = H.num('d2') || 0;
      if (!isFinite(p)) return H.out(H.hint('Introduce el precio original.'));
      const x = L.apply(p, d1, d2);
      H.out(H.stat('Precio final', H.money(x.final), true) + H.stat('Ahorras', H.money(x.saved)) +
        H.stat('Descuento total real', H.fmt(x.effective) + '%'));
    });
  },
  content: `
    <h2>Cómo calcular un descuento</h2>
    <p><strong>Precio final = Precio × (1 − descuento/100)</strong>. Un 20% sobre 80 deja 80 × 0,8 = 64.</p>
    <h2>Los descuentos encadenados no se suman</h2>
    <p>Un 20% más un 10% adicional no equivale a un 30%: el segundo descuento se aplica sobre el precio ya rebajado. 80 → 64 → 57,60, es decir, un descuento real del 28%.</p>`,
  faq: [
    ['¿Cómo calculo el precio original si solo sé el precio rebajado?', 'Divide el precio rebajado entre (1 − descuento/100). Si pagaste 64 con un 20% de descuento, el original era 64 ÷ 0,8 = 80.'],
  ],
};

export const propina = {
  slug: 'calculadora-propinas-dividir-cuenta',
  category: 'Finanzas',
  title: 'Calculadora de propinas y para dividir la cuenta',
  h1: 'Calculadora de propinas y dividir la cuenta',
  short: 'Propina y cuánto paga cada persona',
  description: 'Calcula la propina de un restaurante y divide la cuenta entre varias personas en segundos.',
  publish: '2026-10-14',
  intro: 'Introduce el total de la cuenta, el porcentaje de propina y cuántas personas sois.',
  form: `
    <div class="row">
      <label>Total de la cuenta<input id="t" inputmode="decimal" value="60"></label>
      <label>Propina (%)<input id="p" inputmode="decimal" value="10"></label>
      <label>Personas<input id="n" inputmode="numeric" value="3"></label>
    </div>`,
  logic: {
    split(total, pct, people) {
      const tip = total * pct / 100, all = total + tip;
      return { tip, all, each: all / people };
    },
  },
  ui(L, H) {
    H.bind(function () {
      const t = H.num('t'), p = H.num('p') || 0, n = Math.max(1, Math.round(H.num('n') || 1));
      if (!isFinite(t)) return H.out(H.hint('Introduce el total de la cuenta.'));
      const x = L.split(t, p, n);
      H.out(H.stat('Paga cada persona', H.money(x.each), true) + H.stat('Propina', H.money(x.tip)) + H.stat('Total con propina', H.money(x.all)));
    });
  },
  content: `
    <h2>¿Cuánta propina se deja?</h2>
    <p>Varía mucho según el país. En España la propina es voluntaria y suele rondar el 5–10%. En México lo habitual es un 10–15%, en Argentina en torno al 10%, y en Estados Unidos un 15–20%. En algunos países el servicio ya viene incluido en la cuenta, así que revísala antes de añadir nada.</p>`,
  faq: [['¿La propina se calcula antes o después de impuestos?', 'Lo más habitual es calcularla sobre el total de la cuenta, con impuestos incluidos, aunque hay quien la calcula sobre la base. La diferencia es pequeña.']],
};

export const margen = {
  slug: 'calculadora-margen-ganancia',
  category: 'Finanzas',
  title: 'Calculadora de margen de ganancia y precio de venta',
  h1: 'Calculadora de margen de ganancia',
  short: 'Margen, markup y precio de venta',
  description: 'Calcula el margen de beneficio y el markup a partir del coste y el precio de venta, o el precio de venta necesario para lograr un margen.',
  publish: '2026-10-14',
  intro: 'Imprescindible para fijar precios en un negocio o tienda online.',
  form: `
    <fieldset><legend>Margen a partir del coste y el precio</legend><div class="row">
      <label>Coste<input id="c" inputmode="decimal" value="40"></label>
      <label>Precio de venta<input id="p" inputmode="decimal" value="60"></label></div></fieldset>
    <fieldset><legend>Precio para conseguir un margen</legend><div class="row">
      <label>Coste<input id="c2" inputmode="decimal" value="40"></label>
      <label>Margen deseado (%)<input id="m" inputmode="decimal" value="35"></label></div></fieldset>`,
  logic: {
    margins(cost, price) {
      const profit = price - cost;
      return { profit, margin: price ? profit / price * 100 : NaN, markup: cost ? profit / cost * 100 : NaN };
    },
    priceForMargin(cost, marginPct) { return marginPct >= 100 ? NaN : cost / (1 - marginPct / 100); },
  },
  ui(L, H) {
    H.bind(function () {
      const x = L.margins(H.num('c'), H.num('p'));
      const pv = L.priceForMargin(H.num('c2'), H.num('m'));
      H.out(H.stat('Beneficio', H.money(x.profit)) + H.stat('Margen sobre venta', H.fmt(x.margin) + '%') +
        H.stat('Markup sobre coste', H.fmt(x.markup) + '%') + H.stat('Precio de venta necesario', H.money(pv), true));
    });
  },
  content: `
    <h2>Margen y markup no son lo mismo</h2>
    <p><strong>Margen</strong> = beneficio ÷ precio de venta. <strong>Markup</strong> = beneficio ÷ coste. Si compras a 40 y vendes a 60, el beneficio es 20: el margen es del 33,3% y el markup del 50%.</p>
    <h2>Cómo fijar el precio para un margen concreto</h2>
    <p><strong>Precio = Coste ÷ (1 − margen)</strong>. Para un margen del 35% sobre un coste de 40: 40 ÷ 0,65 = 61,54. Un error común es multiplicar el coste por 1,35, lo que da un margen menor del que buscas.</p>`,
  faq: [['¿Qué margen es bueno?', 'Depende del sector. El comercio de alimentación trabaja con márgenes bajos, y el software o los productos digitales con márgenes altos. Asegúrate de que el margen cubre tus gastos fijos.']],
};

export const ahorro = {
  slug: 'calculadora-ahorro-meta',
  category: 'Finanzas',
  title: 'Calculadora de ahorro: cuánto ahorrar al mes para tu meta',
  h1: 'Calculadora de ahorro por objetivo',
  short: 'Cuánto ahorrar cada mes para llegar a tu meta',
  description: 'Calcula cuánto necesitas ahorrar cada mes para alcanzar una meta (viaje, coche, entrada de una vivienda) en un plazo concreto, con o sin rentabilidad.',
  publish: '2026-10-14',
  intro: 'Fija una meta y un plazo, y descubre la cantidad que debes apartar cada mes.',
  form: `
    <div class="row">
      <label>Meta<input id="g" inputmode="decimal" value="10000"></label>
      <label>Ya tengo ahorrado<input id="c" inputmode="decimal" value="1000"></label>
    </div><div class="row">
      <label>Plazo (meses)<input id="n" inputmode="numeric" value="24"></label>
      <label>Rentabilidad anual (%)<input id="r" inputmode="decimal" value="0"></label>
    </div>`,
  logic: {
    monthlyNeeded(goal, current, months, annualRate) {
      const r = annualRate / 100 / 12;
      const fvCurrent = current * Math.pow(1 + r, months);
      const rest = goal - fvCurrent;
      if (rest <= 0) return 0;
      return r === 0 ? rest / months : rest * r / (Math.pow(1 + r, months) - 1);
    },
  },
  ui(L, H) {
    H.bind(function () {
      const g = H.num('g'), c = H.num('c') || 0, n = Math.round(H.num('n')), r = H.num('r') || 0;
      if (!isFinite(g) || !(n > 0)) return H.out(H.hint('Introduce una meta y un plazo en meses.'));
      const m = L.monthlyNeeded(g, c, n, r);
      H.out(H.stat('Ahorro mensual necesario', H.money(m), true) + H.stat('Ahorro semanal aproximado', H.money(m * 12 / 52)) + H.stat('Total que aportarás', H.money(m * n)));
    });
  },
  content: `
    <h2>Consejos para cumplir tu meta de ahorro</h2>
    <ul><li><strong>Págate primero:</strong> programa una transferencia automática el día que cobras.</li>
    <li><strong>Separa el dinero:</strong> usa una cuenta distinta para la meta y no lo verás como disponible.</li>
    <li><strong>Revisa los gastos hormiga:</strong> pequeñas compras diarias suman cientos al año.</li></ul>
    <p>Si inviertes el ahorro con algo de rentabilidad, la aportación mensual necesaria baja. Puedes simularlo en el campo «Rentabilidad anual».</p>`,
  faq: [['¿Qué es un fondo de emergencia?', 'Un colchón de 3 a 6 meses de gastos básicos para imprevistos. Suele recomendarse tenerlo antes de invertir.']],
};

export const regla503020 = {
  slug: 'regla-50-30-20-presupuesto',
  category: 'Finanzas',
  title: 'Regla 50/30/20: calculadora de presupuesto mensual',
  h1: 'Calculadora de presupuesto 50/30/20',
  short: 'Reparte tu sueldo en necesidades, deseos y ahorro',
  description: 'Reparte tus ingresos mensuales con la regla 50/30/20: 50% a necesidades, 30% a deseos y 20% a ahorro. Porcentajes ajustables.',
  publish: '2026-10-14',
  intro: 'Introduce tus ingresos netos mensuales. Puedes ajustar los porcentajes a tu situación.',
  form: `
    <label>Ingresos netos mensuales<input id="i" inputmode="decimal" value="1500"></label>
    <div class="row">
      <label>Necesidades (%)<input id="a" inputmode="decimal" value="50"></label>
      <label>Deseos (%)<input id="b" inputmode="decimal" value="30"></label>
      <label>Ahorro (%)<input id="c" inputmode="decimal" value="20"></label>
    </div>`,
  logic: {
    split(income, a, b, c) { return { needs: income * a / 100, wants: income * b / 100, save: income * c / 100, sum: a + b + c }; },
  },
  ui(L, H) {
    H.bind(function () {
      const x = L.split(H.num('i'), H.num('a'), H.num('b'), H.num('c'));
      H.out(H.stat('Necesidades', H.money(x.needs)) + H.stat('Deseos', H.money(x.wants)) + H.stat('Ahorro e inversión', H.money(x.save)) +
        (Math.abs(x.sum - 100) > 0.001 ? H.hint('Los porcentajes suman ' + H.fmt(x.sum) + '%, no 100%.') : ''));
    });
  },
  content: `
    <h2>Qué es la regla 50/30/20</h2>
    <p>Es un método sencillo de presupuesto que popularizó Elizabeth Warren. Consiste en repartir los ingresos netos en tres bloques:</p>
    <ul><li><strong>50% necesidades:</strong> vivienda, suministros, comida, transporte, seguros y pagos mínimos de deudas.</li>
    <li><strong>30% deseos:</strong> ocio, restaurantes, suscripciones, viajes y caprichos.</li>
    <li><strong>20% ahorro:</strong> fondo de emergencia, inversión y amortización extra de deudas.</li></ul>
    <p>Si vives en una ciudad cara, una variante realista es 60/20/20 o 70/20/10. Lo importante es que el ahorro sea automático y constante.</p>`,
  faq: [['¿Se calcula sobre el sueldo bruto o el neto?', 'Sobre el neto, es decir, lo que cobras después de impuestos y cotizaciones.']],
};

export const sueldo = {
  slug: 'convertir-sueldo-hora-mes-ano',
  category: 'Finanzas',
  title: 'Calculadora de sueldo: por hora, día, semana, mes y año',
  h1: 'Convertir sueldo por hora, mensual y anual',
  short: 'Pasa de sueldo por hora a mensual o anual',
  description: 'Convierte un salario entre por hora, por día, por semana, mensual y anual según tus horas y días de trabajo.',
  publish: '2026-10-14',
  intro: 'Útil para comparar ofertas de trabajo o calcular tu tarifa como freelance.',
  form: `
    <div class="row">
      <label>Importe<input id="a" inputmode="decimal" value="1800"></label>
      <label>Periodo<select id="per"><option value="hour">Por hora</option><option value="day">Por día</option><option value="week">Por semana</option><option value="month" selected>Al mes</option><option value="year">Al año</option></select></label>
    </div><div class="row">
      <label>Horas por semana<input id="h" inputmode="decimal" value="40"></label>
      <label>Días por semana<input id="d" inputmode="decimal" value="5"></label>
      <label>Pagas al año<input id="pp" inputmode="numeric" value="12"></label>
    </div>`,
  logic: {
    // Normaliza a importe anual y deriva el resto. `payments` es el número de pagas (12 o 14).
    convert(amount, period, hoursWeek, daysWeek, payments) {
      const perYear = { hour: hoursWeek * 52, day: daysWeek * 52, week: 52, month: payments, year: 1 }[period];
      const annual = amount * perYear;
      return { annual, monthly: annual / payments, weekly: annual / 52, daily: annual / 52 / daysWeek, hourly: annual / 52 / hoursWeek };
    },
  },
  ui(L, H) {
    H.bind(function () {
      const x = L.convert(H.num('a'), H.val('per'), H.num('h'), H.num('d'), Math.round(H.num('pp')) || 12);
      H.out(H.stat('Anual', H.money(x.annual)) + H.stat('Por paga', H.money(x.monthly)) + H.stat('Semanal', H.money(x.weekly)) + H.stat('Diario', H.money(x.daily)) + H.stat('Por hora', H.money(x.hourly)));
    });
  },
  content: `
    <h2>Cómo se calcula</h2>
    <p>La calculadora pasa el importe a su equivalente anual y luego lo divide. Considera 52 semanas al año y no descuenta vacaciones. Si cobras en 14 pagas (habitual en España), indica 14 en «Pagas al año».</p>
    <h2>Tarifa por hora para freelancers</h2>
    <p>Si trabajas por cuenta propia, sube la tarifa por hora para cubrir vacaciones, días sin clientes, impuestos, cotizaciones y equipo. Una regla habitual es multiplicar por 1,5 o 2 la tarifa equivalente de un empleado.</p>`,
  faq: [['¿Es el sueldo neto o bruto?', 'Es el mismo tipo de importe que introduzcas. Si pones el bruto, todos los resultados son brutos.']],
};

export const inflacion = {
  slug: 'calculadora-inflacion',
  category: 'Finanzas',
  title: 'Calculadora de inflación: poder adquisitivo y precios futuros',
  h1: 'Calculadora de inflación',
  short: 'Cómo afecta la inflación a tu dinero',
  description: 'Calcula cuánto costará algo en el futuro con una inflación anual dada y cuánto poder adquisitivo pierde tu dinero.',
  publish: '2026-10-14',
  intro: 'Introduce una cantidad, la inflación anual esperada y el número de años.',
  form: `
    <div class="row">
      <label>Cantidad<input id="a" inputmode="decimal" value="1000"></label>
      <label>Inflación anual (%)<input id="i" inputmode="decimal" value="4"></label>
      <label>Años<input id="y" inputmode="decimal" value="10"></label>
    </div>`,
  logic: {
    project(amount, rate, years) {
      const f = Math.pow(1 + rate / 100, years);
      return { future: amount * f, power: amount / f, loss: (1 - 1 / f) * 100 };
    },
  },
  ui(L, H) {
    H.bind(function () {
      const x = L.project(H.num('a'), H.num('i'), H.num('y'));
      H.out(H.stat('Lo que hoy cuesta ' + H.fmt(H.num('a')) + ' costará', H.money(x.future), true) +
        H.stat('Poder adquisitivo futuro de tu dinero', H.money(x.power)) + H.stat('Pérdida de poder adquisitivo', H.fmt(x.loss) + '%'));
    });
  },
  content: `
    <h2>Qué es la inflación</h2>
    <p>La inflación es la subida generalizada de los precios. Con una inflación del 4% anual, lo que hoy cuesta 1.000 costará unos 1.480 dentro de 10 años, y 1.000 guardados debajo del colchón solo comprarán lo que hoy compran 676.</p>
    <p>Para proteger los ahorros de la inflación, la rentabilidad neta de tus inversiones debería superar la tasa de inflación.</p>`,
  faq: [['¿Dónde consulto la inflación oficial?', 'En el instituto de estadística de tu país, como el INE en España, el INEGI en México o el INDEC en Argentina.']],
};

export default [iva, porcentaje, interesCompuesto, prestamo, descuento, propina, margen, ahorro, regla503020, sueldo, inflacion];
