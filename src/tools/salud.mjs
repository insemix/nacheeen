// Calculadoras de salud y deporte. Resultados orientativos, no sustituyen el consejo médico.

const DISCLAIMER = '<p><em>Resultado orientativo. No sustituye la valoración de un profesional sanitario.</em></p>';

export const imc = {
  slug: 'calculadora-imc',
  category: 'Salud',
  title: 'Calculadora de IMC (índice de masa corporal) online',
  h1: 'Calculadora de IMC',
  short: 'Índice de masa corporal y peso saludable',
  description: 'Calcula tu índice de masa corporal (IMC) con tu peso y altura, consulta la clasificación de la OMS y el rango de peso saludable para tu estatura.',
  publish: '2026-10-14',
  intro: 'Introduce tu peso en kilos y tu altura en centímetros.',
  form: `
    <div class="row">
      <label>Peso (kg)<input id="w" inputmode="decimal" value="70"></label>
      <label>Altura (cm)<input id="h" inputmode="decimal" value="170"></label>
    </div>`,
  logic: {
    bmi(kg, cm) { const m = cm / 100; return kg / (m * m); },
    category(b) {
      if (b < 18.5) return 'Bajo peso';
      if (b < 25) return 'Peso normal';
      if (b < 30) return 'Sobrepeso';
      if (b < 35) return 'Obesidad grado I';
      if (b < 40) return 'Obesidad grado II';
      return 'Obesidad grado III';
    },
    healthyRange(cm) { const m = cm / 100; return [18.5 * m * m, 24.9 * m * m]; },
  },
  ui(L, H) {
    H.bind(function () {
      const w = H.num('w'), h = H.num('h');
      if (!(w > 0) || !(h > 50)) return H.out(H.hint('Introduce el peso en kg y la altura en cm (por ejemplo, 170).'));
      const b = L.bmi(w, h), rg = L.healthyRange(h);
      H.out(H.stat('Tu IMC', H.fmt(b, 1), true) + H.stat('Clasificación OMS', L.category(b)) +
        H.stat('Peso saludable para tu altura', H.fmt(rg[0], 1) + ' – ' + H.fmt(rg[1], 1) + ' kg'));
    });
  },
  content: `
    <h2>Fórmula del IMC</h2>
    <p><strong>IMC = peso (kg) ÷ altura² (m)</strong>. Una persona de 70 kg y 1,70 m tiene un IMC de 70 ÷ 2,89 = 24,2.</p>
    <h2>Tabla de clasificación de la OMS</h2>
    <div class="table-wrap"><table><thead><tr><th>IMC</th><th>Clasificación</th></tr></thead><tbody>
    <tr><td>Menos de 18,5</td><td>Bajo peso</td></tr><tr><td>18,5 – 24,9</td><td>Normal</td></tr>
    <tr><td>25 – 29,9</td><td>Sobrepeso</td></tr><tr><td>30 – 34,9</td><td>Obesidad I</td></tr>
    <tr><td>35 – 39,9</td><td>Obesidad II</td></tr><tr><td>40 o más</td><td>Obesidad III</td></tr></tbody></table></div>
    <h2>Limitaciones del IMC</h2>
    <p>El IMC no distingue entre músculo y grasa, así que puede sobrestimar la grasa en deportistas y subestimarla en personas mayores. No es aplicable a niños, adolescentes ni embarazadas. El perímetro de cintura es un buen complemento.</p>` + DISCLAIMER,
  faq: [['¿Cuál es el IMC ideal?', 'Para adultos, la OMS considera normal un IMC entre 18,5 y 24,9.'], ['¿Sirve para niños?', 'No. En menores se usan percentiles de IMC según la edad y el sexo.']],
};

export const calorias = {
  slug: 'calculadora-calorias-diarias',
  category: 'Salud',
  title: 'Calculadora de calorías diarias (TMB y gasto total)',
  h1: 'Calculadora de calorías diarias',
  short: 'Calorías para mantener, perder o ganar peso',
  description: 'Calcula tu metabolismo basal (fórmula Mifflin-St Jeor) y las calorías que necesitas al día para mantener, perder o ganar peso según tu actividad.',
  publish: '2026-10-14',
  intro: 'Usa la fórmula de Mifflin-St Jeor, una de las más precisas para adultos.',
  form: `
    <div class="row">
      <label>Sexo<select id="s"><option value="m">Hombre</option><option value="f">Mujer</option></select></label>
      <label>Edad<input id="a" inputmode="numeric" value="30"></label>
    </div><div class="row">
      <label>Peso (kg)<input id="w" inputmode="decimal" value="70"></label>
      <label>Altura (cm)<input id="h" inputmode="decimal" value="170"></label>
    </div>
    <label>Actividad física<select id="act">
      <option value="1.2">Sedentaria (poco o ningún ejercicio)</option>
      <option value="1.375">Ligera (1–3 días por semana)</option>
      <option value="1.55" selected>Moderada (3–5 días por semana)</option>
      <option value="1.725">Alta (6–7 días por semana)</option>
      <option value="1.9">Muy alta (trabajo físico o doble sesión)</option></select></label>`,
  logic: {
    bmr(sex, kg, cm, age) { return 10 * kg + 6.25 * cm - 5 * age + (sex === 'f' ? -161 : 5); },
  },
  ui(L, H) {
    H.bind(function () {
      const b = L.bmr(H.val('s'), H.num('w'), H.num('h'), H.num('a'));
      if (!isFinite(b)) return H.out(H.hint('Completa todos los campos.'));
      const t = b * parseFloat(H.val('act'));
      H.out(H.stat('Calorías para mantener tu peso', H.fmt(t, 0) + ' kcal/día', true) + H.stat('Metabolismo basal (TMB)', H.fmt(b, 0) + ' kcal') +
        H.stat('Para perder ~0,5 kg/semana', H.fmt(t - 500, 0) + ' kcal') + H.stat('Para ganar masa muscular', H.fmt(t + 300, 0) + ' kcal'));
    });
  },
  content: `
    <h2>Metabolismo basal y gasto calórico total</h2>
    <p>El <strong>metabolismo basal</strong> (TMB) es la energía que tu cuerpo gasta en reposo para mantener sus funciones vitales. Al multiplicarlo por un factor de actividad se obtiene el gasto energético total diario.</p>
    <h2>Fórmula de Mifflin-St Jeor</h2>
    <ul><li>Hombres: 10 × peso + 6,25 × altura − 5 × edad + 5</li><li>Mujeres: 10 × peso + 6,25 × altura − 5 × edad − 161</li></ul>
    <p>Un déficit de unas 500 kcal diarias suele traducirse en una pérdida de alrededor de 0,5 kg por semana. No es recomendable bajar de forma prolongada del metabolismo basal sin supervisión profesional.</p>` + DISCLAIMER,
  faq: [['¿Cuántas calorías debo comer para adelgazar?', 'Como orientación, unas 300–500 kcal menos que tu gasto total. Un déficit muy agresivo dificulta mantener la masa muscular y la adherencia.']],
};

export const agua = {
  slug: 'cuanta-agua-beber-al-dia',
  category: 'Salud',
  title: 'Cuánta agua beber al día: calculadora según tu peso',
  h1: '¿Cuánta agua debo beber al día?',
  short: 'Litros de agua recomendados según tu peso',
  description: 'Calcula cuánta agua deberías beber al día según tu peso y tu actividad física. Resultado en litros y en vasos.',
  publish: '2026-10-14',
  intro: 'Una estimación sencilla basada en tu peso corporal y en los minutos de ejercicio.',
  form: `
    <div class="row">
      <label>Peso (kg)<input id="w" inputmode="decimal" value="70"></label>
      <label>Ejercicio al día (min)<input id="e" inputmode="numeric" value="30"></label>
    </div>`,
  logic: {
    // 35 ml/kg más unos 12 ml por minuto de ejercicio (~350 ml cada 30 min).
    liters(kg, exerciseMin) { return (kg * 35 + (exerciseMin || 0) * 12) / 1000; },
  },
  ui(L, H) {
    H.bind(function () {
      const l = L.liters(H.num('w'), H.num('e') || 0);
      if (!(l > 0)) return H.out(H.hint('Introduce tu peso.'));
      H.out(H.stat('Agua recomendada', H.fmt(l, 1) + ' litros/día', true) + H.stat('Vasos de 250 ml', H.fmt(Math.ceil(l / 0.25), 0)));
    });
  },
  content: `
    <h2>¿De dónde sale esta cifra?</h2>
    <p>Una regla práctica muy usada es beber unos 35 ml de agua por kilo de peso, más un extra cuando haces ejercicio o hace calor. Alrededor del 20% del agua diaria procede de los alimentos, como la fruta, la verdura o las sopas.</p>
    <p>La mejor guía es la sed y el color de la orina: un amarillo pálido indica buena hidratación. Si tienes enfermedad renal o cardíaca, sigue la indicación de tu médico.</p>` + DISCLAIMER,
  faq: [['¿Cuentan el café y las infusiones?', 'Sí, contribuyen a la hidratación, aunque es preferible que el agua sea la bebida principal.']],
};

export const parto = {
  slug: 'calculadora-fecha-probable-parto',
  category: 'Salud',
  title: 'Calculadora de embarazo: fecha probable de parto y semanas',
  h1: 'Calculadora de fecha probable de parto',
  short: 'Fecha de parto y semanas de embarazo',
  description: 'Calcula la fecha probable de parto a partir de la fecha de última regla (FUM) y conoce de cuántas semanas estás y en qué trimestre.',
  publish: '2026-10-14',
  intro: 'Introduce el primer día de tu última menstruación y la duración habitual de tu ciclo.',
  form: `
    <div class="row">
      <label>Fecha de última regla<input id="d" type="date"></label>
      <label>Duración del ciclo (días)<input id="c" inputmode="numeric" value="28"></label>
    </div>`,
  logic: {
    // Regla de Naegele: FUM + 280 días, ajustada por la duración del ciclo.
    dueDate(lmpMs, cycle) { return lmpMs + (280 + (cycle - 28)) * 86400000; },
    gestation(lmpMs, todayMs, cycle) {
      const days = Math.floor((todayMs - lmpMs) / 86400000) - (cycle - 28);
      return { weeks: Math.floor(days / 7), days: days % 7, total: days };
    },
  },
  ui(L, H) {
    const d = H.el('d');
    if (!d.value) { const t = new Date(Date.now() - 70 * 86400000); d.value = t.toISOString().slice(0, 10); }
    H.bind(function () {
      const lmp = Date.parse(H.val('d')), c = Math.round(H.num('c')) || 28;
      if (!isFinite(lmp)) return H.out(H.hint('Elige la fecha de tu última regla.'));
      const now = new Date(), today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const due = new Date(L.dueDate(lmp, c)), g = L.gestation(lmp, today, c);
      const tri = g.weeks < 14 ? 'Primer trimestre' : g.weeks < 28 ? 'Segundo trimestre' : 'Tercer trimestre';
      H.out(H.stat('Fecha probable de parto', due.toLocaleDateString('es', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), true) +
        (g.total >= 0 && g.weeks <= 42 ? H.stat('Semanas de embarazo hoy', g.weeks + ' semanas y ' + g.days + ' días') + H.stat('Trimestre', tri) : ''));
    });
  },
  content: `
    <h2>Cómo se calcula la fecha probable de parto</h2>
    <p>Se usa la <strong>regla de Naegele</strong>: se suman 280 días (40 semanas) al primer día de la última menstruación. Si tus ciclos son más largos o más cortos de 28 días, la fecha se ajusta en la misma proporción.</p>
    <p>Solo un 4–5% de los bebés nacen exactamente en la fecha probable. Se considera a término cualquier parto entre las semanas 37 y 42. La ecografía del primer trimestre es la forma más precisa de datar el embarazo.</p>` + DISCLAIMER,
  faq: [['¿Las semanas se cuentan desde la concepción?', 'No. Por convención se cuentan desde la última regla, unas dos semanas antes de la concepción.']],
};

export const ritmo = {
  slug: 'calculadora-ritmo-carrera',
  category: 'Salud',
  title: 'Calculadora de ritmo de carrera (min/km) y tiempos estimados',
  h1: 'Calculadora de ritmo de carrera',
  short: 'Ritmo por km, velocidad y tiempos para 5K a maratón',
  description: 'Calcula tu ritmo en minutos por kilómetro y tu velocidad, y estima tus tiempos en 5K, 10K, media maratón y maratón.',
  publish: '2026-10-14',
  intro: 'Introduce la distancia y el tiempo de una carrera o entrenamiento reciente.',
  form: `
    <label>Distancia (km)<input id="km" inputmode="decimal" value="10"></label>
    <div class="row">
      <label>Horas<input id="hh" inputmode="numeric" value="0"></label>
      <label>Minutos<input id="mm" inputmode="numeric" value="55"></label>
      <label>Segundos<input id="ss" inputmode="numeric" value="0"></label>
    </div>`,
  logic: {
    pace(km, sec) { return { secPerKm: sec / km, kmh: km / (sec / 3600) }; },
    // Fórmula de Riegel: T2 = T1 × (D2/D1)^1.06
    predict(km, sec, targetKm) { return sec * Math.pow(targetKm / km, 1.06); },
    hms(sec) {
      sec = Math.round(sec);
      const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
      return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
    },
  },
  ui(L, H) {
    H.bind(function () {
      const km = H.num('km'), sec = (H.num('hh') || 0) * 3600 + (H.num('mm') || 0) * 60 + (H.num('ss') || 0);
      if (!(km > 0) || !(sec > 0)) return H.out(H.hint('Introduce distancia y tiempo.'));
      const p = L.pace(km, sec);
      let s = H.stat('Ritmo', L.hms(p.secPerKm) + ' min/km', true) + H.stat('Velocidad', H.fmt(p.kmh, 2) + ' km/h');
      [[5, '5K'], [10, '10K'], [21.0975, 'Media maratón'], [42.195, 'Maratón']].forEach(function (t) {
        s += H.stat(t[1] + ' estimado', L.hms(L.predict(km, sec, t[0])));
      });
      H.out(s);
    });
  },
  content: `
    <h2>Cómo calcular el ritmo de carrera</h2>
    <p>El ritmo es el tiempo que tardas en recorrer un kilómetro: <strong>ritmo = tiempo total ÷ distancia</strong>. 10 km en 55 minutos equivalen a 5:30 min/km.</p>
    <h2>Predicción de tiempos</h2>
    <p>La estimación usa la fórmula de Peter Riegel, que tiene en cuenta que el ritmo baja al aumentar la distancia. Es más fiable cuando la distancia de referencia se parece a la que quieres predecir y has entrenado específicamente para ella.</p>`,
  faq: [['¿Cómo paso de km/h a min/km?', 'Divide 60 entre la velocidad en km/h. A 12 km/h el ritmo es 60 ÷ 12 = 5 min/km.']],
};

export default [imc, calorias, agua, parto, ritmo];
