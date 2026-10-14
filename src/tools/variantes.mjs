// Páginas programáticas: IVA por país y conversiones de unidades.
// Se publican de forma escalonada (campo `publish`) y la reconstrucción semanal
// automática las va añadiendo al sitio sin intervención.
import { iva } from './finanzas.mjs';

const fmt = (n, d = 2) => n.toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: d });
const money = n => n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Primera tanda el día de lanzamiento; después, dos páginas nuevas cada semana.
const LAUNCH = Date.UTC(2026, 9, 14);
const FIRST_MONDAY = Date.UTC(2026, 9, 19);
function schedule(i) {
  if (i < 6) return new Date(LAUNCH).toISOString().slice(0, 10);
  return new Date(FIRST_MONDAY + Math.floor((i - 6) / 2) * 7 * 86400000).toISOString().slice(0, 10);
}

// [slug, país, nombre del impuesto, tipo general, otros tipos, autoridad, nota]
const COUNTRIES = [
  ['mexico', 'México', 'IVA', 16, 'una tasa del 8% en la región fronteriza norte y sur, y tasa 0% para alimentos básicos y medicinas', 'el SAT'],
  ['espana', 'España', 'IVA', 21, 'un tipo reducido del 10% (hostelería, transporte, vivienda nueva) y un superreducido del 4% (pan, leche, libros, medicamentos)', 'la Agencia Tributaria (AEAT)'],
  ['argentina', 'Argentina', 'IVA', 21, 'una alícuota reducida del 10,5% y una incrementada del 27% para ciertos servicios públicos a empresas', 'ARCA (ex AFIP)'],
  ['colombia', 'Colombia', 'IVA', 19, 'una tarifa reducida del 5% y bienes exentos o excluidos', 'la DIAN'],
  ['chile', 'Chile', 'IVA', 19, 'algunas exenciones específicas, pero sin tasas reducidas generales', 'el SII'],
  ['peru', 'Perú', 'IGV', 18, 'el 18% se compone del 16% de IGV más el 2% del Impuesto de Promoción Municipal (IPM)', 'la SUNAT'],
  ['ecuador', 'Ecuador', 'IVA', 15, 'tarifa 0% para bienes y servicios básicos (la tarifa general subió del 12% al 15% en 2024)', 'el SRI'],
  ['uruguay', 'Uruguay', 'IVA', 22, 'una tasa mínima del 10% para alimentos básicos, medicamentos y algunos servicios', 'la DGI'],
  ['paraguay', 'Paraguay', 'IVA', 10, 'una tasa reducida del 5% para canasta básica, medicamentos e inmuebles', 'la DNIT'],
  ['bolivia', 'Bolivia', 'IVA', 13, 'que el 13% se aplica «por dentro», es decir, ya está incluido en el precio de venta', 'el SIN'],
  ['venezuela', 'Venezuela', 'IVA', 16, 'una alícuota reducida del 8% y una adicional para bienes y servicios suntuarios', 'el SENIAT'],
  ['guatemala', 'Guatemala', 'IVA', 12, 'regímenes especiales como el de pequeño contribuyente', 'la SAT'],
  ['costa-rica', 'Costa Rica', 'IVA', 13, 'tarifas reducidas del 4%, 2% y 1% para determinados bienes y servicios', 'el Ministerio de Hacienda'],
  ['republica-dominicana', 'República Dominicana', 'ITBIS', 18, 'una tasa reducida del 16% para ciertos productos como lácteos, café y azúcares', 'la DGII'],
  ['panama', 'Panamá', 'ITBMS', 7, 'tasas del 10% (bebidas alcohólicas, hospedaje) y del 15% (tabaco)', 'la DGI'],
  ['el-salvador', 'El Salvador', 'IVA', 13, 'exenciones para algunos servicios como salud y educación', 'el Ministerio de Hacienda'],
  ['honduras', 'Honduras', 'ISV', 15, 'una tasa del 18% para bebidas alcohólicas, tabaco y boletos aéreos en primera clase', 'el SAR'],
  ['nicaragua', 'Nicaragua', 'IVA', 15, 'exenciones para productos de la canasta básica', 'la DGI'],
];

const ivaPages = COUNTRIES.map(([slug, country, tax, rate, others, authority]) => {
  const rows = [100, 500, 1000, 5000].map(b => `<tr><td>${fmt(b)}</td><td>${money(b * rate / 100)}</td><td>${money(b * (1 + rate / 100))}</td></tr>`).join('');
  const back = [100, 1000].map(t => `<tr><td>${fmt(t)}</td><td>${money(t / (1 + rate / 100))}</td><td>${money(t - t / (1 + rate / 100))}</td></tr>`).join('');
  return {
    ...iva,
    slug: `calculadora-iva-${slug}`,
    title: `Calculadora de ${tax} en ${country} (${rate}%): sumar y quitar ${tax}`,
    h1: `Calculadora de ${tax} en ${country}`,
    short: `${tax} del ${rate}%: añadir o desglosar`,
    description: `Calcula el ${tax} de ${country} (${rate}%) al instante: añade el ${tax} a un precio o desglósalo de un total. Con ejemplos y fórmula.`,
    category: 'IVA por país',
    defaults: { rate },
    intro: `El tipo general del ${tax} en ${country} es del ${rate}%. Introduce un importe para calcular la base, el impuesto y el total.`,
    content: `
      <h2>${tax} en ${country}</h2>
      <p>En ${country} el tipo general del ${tax} es del <strong>${rate}%</strong>. Además, existe ${others}. Confirma siempre el tipo aplicable a tu producto o servicio con ${authority}.</p>
      <h2>Cómo sumar el ${tax} del ${rate}%</h2>
      <p>Multiplica la base por <strong>${fmt(1 + rate / 100, 4)}</strong>. Para calcular solo el impuesto, multiplica la base por ${fmt(rate / 100, 4)}.</p>
      <div class="table-wrap"><table><thead><tr><th>Base</th><th>${tax} (${rate}%)</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></div>
      <h2>Cómo quitar el ${tax} de un precio</h2>
      <p>Divide el precio final entre <strong>${fmt(1 + rate / 100, 4)}</strong> para obtener la base. No restes el ${rate}% al total, porque el resultado sería incorrecto.</p>
      <div class="table-wrap"><table><thead><tr><th>Precio con ${tax}</th><th>Base</th><th>${tax} incluido</th></tr></thead><tbody>${back}</tbody></table></div>
      <p><em>Información orientativa. Los tipos pueden cambiar: consulta la normativa vigente.</em></p>`,
    faq: [
      [`¿Cuál es el ${tax} en ${country}?`, `El tipo general es del ${rate}%. También hay ${others}.`],
      [`¿Cómo calculo el ${tax} incluido en un precio?`, `Divide el precio entre ${fmt(1 + rate / 100, 4)} para obtener la base. La diferencia entre el precio y la base es el ${tax}.`],
    ],
  };
});

// [slug, de, a, factor, offset, unidad origen, unidad destino, valores de tabla, decimales, slug inverso]
const CONVERSIONS = [
  ['libras-a-kilos', 'libras', 'kilos', 0.45359237, 0, 'lb', 'kg', [1, 2, 5, 10, 20, 50, 100, 150, 200], 3, 'kilos-a-libras'],
  ['pulgadas-a-centimetros', 'pulgadas', 'centímetros', 2.54, 0, 'in', 'cm', [1, 2, 5, 10, 12, 24, 32, 43, 55, 65], 2, 'centimetros-a-pulgadas'],
  ['fahrenheit-a-celsius', 'grados Fahrenheit', 'grados Celsius', 5 / 9, -32 * 5 / 9, '°F', '°C', [0, 32, 50, 68, 77, 86, 98.6, 100, 212, 350], 1, 'celsius-a-fahrenheit'],
  ['kilos-a-libras', 'kilos', 'libras', 1 / 0.45359237, 0, 'kg', 'lb', [1, 2, 5, 10, 20, 50, 60, 70, 80, 100], 3, 'libras-a-kilos'],
  ['pies-a-metros', 'pies', 'metros', 0.3048, 0, 'ft', 'm', [1, 3, 5, 6, 10, 20, 100, 1000], 3, 'metros-a-pies'],
  ['millas-a-kilometros', 'millas', 'kilómetros', 1.609344, 0, 'mi', 'km', [1, 5, 10, 26.2, 50, 100, 500], 3, 'kilometros-a-millas'],
  ['centimetros-a-pulgadas', 'centímetros', 'pulgadas', 1 / 2.54, 0, 'cm', 'in', [1, 5, 10, 20, 30, 50, 100], 3, 'pulgadas-a-centimetros'],
  ['celsius-a-fahrenheit', 'grados Celsius', 'grados Fahrenheit', 9 / 5, 32, '°C', '°F', [-10, 0, 10, 20, 25, 30, 37, 40, 100, 180], 1, 'fahrenheit-a-celsius'],
  ['onzas-a-gramos', 'onzas', 'gramos', 28.349523125, 0, 'oz', 'g', [1, 2, 4, 8, 12, 16, 32], 2, 'gramos-a-onzas'],
  ['metros-a-pies', 'metros', 'pies', 1 / 0.3048, 0, 'm', 'ft', [1, 1.5, 1.7, 1.8, 2, 10, 100], 3, 'pies-a-metros'],
  ['kilometros-a-millas', 'kilómetros', 'millas', 1 / 1.609344, 0, 'km', 'mi', [1, 5, 10, 21.1, 42.2, 100], 3, 'millas-a-kilometros'],
  ['galones-a-litros', 'galones (EE. UU.)', 'litros', 3.785411784, 0, 'gal', 'L', [1, 2, 5, 10, 15, 20, 50], 3, 'litros-a-galones'],
  ['mph-a-kmh', 'millas por hora', 'kilómetros por hora', 1.609344, 0, 'mph', 'km/h', [10, 20, 30, 40, 55, 60, 70, 100], 2, 'kmh-a-mph'],
  ['gramos-a-onzas', 'gramos', 'onzas', 1 / 28.349523125, 0, 'g', 'oz', [10, 50, 100, 250, 500, 1000], 3, 'onzas-a-gramos'],
  ['litros-a-galones', 'litros', 'galones (EE. UU.)', 1 / 3.785411784, 0, 'L', 'gal', [1, 5, 10, 20, 40, 50, 100], 3, 'galones-a-litros'],
  ['kmh-a-mph', 'kilómetros por hora', 'millas por hora', 1 / 1.609344, 0, 'km/h', 'mph', [30, 50, 80, 100, 120, 130], 2, 'mph-a-kmh'],
  ['yardas-a-metros', 'yardas', 'metros', 0.9144, 0, 'yd', 'm', [1, 5, 10, 50, 100], 3, 'metros-a-yardas'],
  ['metros-a-yardas', 'metros', 'yardas', 1 / 0.9144, 0, 'm', 'yd', [1, 5, 10, 50, 100], 3, 'yardas-a-metros'],
  ['onzas-liquidas-a-mililitros', 'onzas líquidas (EE. UU.)', 'mililitros', 29.5735295625, 0, 'fl oz', 'ml', [1, 2, 4, 8, 12, 16, 33.8], 2, null],
];

export const converterLogic = {
  convert(v, k, b) { return v * k + b; },
};

function converterUi(L, H, D) {
  H.bind(function () {
    const v = H.num('v');
    if (!isFinite(v)) return H.out(H.hint('Introduce un valor.'));
    H.out(H.stat(H.fmt(v, 4) + ' ' + D.fromU + ' =', H.fmt(L.convert(v, D.k, D.b), D.dec) + ' ' + D.toU, true));
  });
}

const cap = s => s[0].toUpperCase() + s.slice(1);

const conversionPages = CONVERSIONS.map(([slug, from, to, k, b, fromU, toU, values, dec, inverse]) => {
  const linear = b === 0;
  const table = values.map(v => `<tr><td>${fmt(v, 2)} ${fromU}</td><td>${fmt(v * k + b, dec)} ${toU}</td></tr>`).join('');
  const formula = linear
    ? (k >= 1 ? `multiplica por ${fmt(k, 6)}` : `divide entre ${fmt(1 / k, 6)}`)
    : (fromU === '°F' ? 'resta 32 y multiplica por 5/9' : 'multiplica por 9/5 y suma 32');
  const ex = values[Math.min(3, values.length - 1)];
  return {
    slug,
    category: 'Conversores',
    title: `Convertir ${from} a ${to} (${fromU} a ${toU}): calculadora y tabla`,
    h1: `Convertir ${from} a ${to}`,
    short: `${fromU} → ${toU} con tabla de equivalencias`,
    description: `Convierte ${from} a ${to} al instante. Fórmula, ejemplos y tabla de equivalencias de ${fromU} a ${toU}.`,
    defaults: { k, b, fromU, toU, dec },
    intro: `Escribe la cantidad en ${from} y obtén el resultado en ${to}.`,
    form: `<label>${cap(from)} (${fromU})<input id="v" inputmode="decimal" value="${fmt(ex, 2)}"></label>`,
    logic: converterLogic,
    ui: converterUi,
    content: `
      <h2>Cómo convertir ${from} a ${to}</h2>
      <p>Para pasar de ${from} a ${to}, <strong>${formula}</strong>. Por ejemplo: ${fmt(ex, 2)} ${fromU} = ${fmt(ex * k + b, dec)} ${toU}.</p>
      <h2>Tabla de equivalencias de ${fromU} a ${toU}</h2>
      <div class="table-wrap"><table><thead><tr><th>${cap(from)}</th><th>${cap(to)}</th></tr></thead><tbody>${table}</tbody></table></div>`,
    faq: [[`¿Cuántos ${to} son 1 ${fromU}?`, `1 ${fromU} equivale a ${fmt(k + b, 6)} ${toU}.`]],
    // El build añade el enlace solo si la página inversa ya está publicada.
    inverse: inverse && { slug: inverse, label: `${to} a ${from}` },
  };
});

// Intercala IVA y conversores para variar lo que se publica cada semana.
const queue = [];
for (let i = 0; i < Math.max(ivaPages.length, conversionPages.length); i++) {
  if (conversionPages[i]) queue.push(conversionPages[i]);
  if (ivaPages[i]) queue.push(ivaPages[i]);
}
queue.forEach((p, i) => { p.publish = schedule(i); });

export default queue;
