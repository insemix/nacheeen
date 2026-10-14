import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as F from '../src/tools/finanzas.mjs';
import * as S from '../src/tools/salud.mjs';
import * as U from '../src/tools/utiles.mjs';
import { converterLogic } from '../src/tools/variantes.mjs';

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} ≈ ${b}`);

test('parseNum acepta formatos españoles e ingleses', () => {
  const ctx = {};
  vm.runInNewContext(readFileSync(new URL('../src/assets/site.js', import.meta.url), 'utf8'), ctx);
  const p = ctx.H.parseNum;
  assert.equal(p('1.234,56'), 1234.56);
  assert.equal(p('1,234.56'), 1234.56);
  assert.equal(p('1234,5'), 1234.5);
  assert.equal(p('6,5'), 6.5);
  assert.equal(p('1.5'), 1.5);
  assert.equal(p('1.000.000'), 1000000);
  assert.equal(p(' 21 % '), 21);
  assert.equal(p('-3'), -3);
  assert.ok(Number.isNaN(p('')));
  assert.ok(Number.isNaN(p('abc')));
});

test('IVA: añadir y quitar', () => {
  const x = F.iva.logic.add(100, 21);
  close(x.iva, 21); close(x.total, 121);
  const y = F.iva.logic.remove(121, 21);
  close(y.base, 100); close(y.iva, 21);
});

test('porcentajes', () => {
  const L = F.porcentaje.logic;
  close(L.percentOf(15, 200), 30);
  close(L.whatPercent(30, 120), 25);
  close(L.change(80, 100), 25);
  close(L.change(100, 80), -20);
  assert.ok(Number.isNaN(L.whatPercent(1, 0)));
});

test('interés compuesto sin interés suma las aportaciones', () => {
  const rows = F.interesCompuesto.logic.compound(1000, 100, 0, 2);
  close(rows[1].balance, 1000 + 2400);
  // 1000 al 12% nominal capitalizable mensual durante 1 año = 1000·1.01^12
  close(F.interesCompuesto.logic.compound(1000, 0, 12, 1)[0].balance, 1000 * Math.pow(1.01, 12));
});

test('préstamo: cuota del sistema francés y amortización completa', () => {
  const L = F.prestamo.logic;
  close(L.payment(20000, 6.5, 60), 391.32, 0.01);
  close(L.payment(1200, 0, 12), 100);
  const s = L.schedule(20000, 6.5, 60);
  assert.equal(s.years.length, 5);
  close(s.years[4].balance, 0, 1e-6);
  close(s.years.reduce((a, y) => a + y.principal, 0), 20000, 1e-6);
});

test('descuentos encadenados', () => {
  const x = F.descuento.logic.apply(80, 20, 10);
  close(x.final, 57.6); close(x.effective, 28);
});

test('margen y markup', () => {
  const x = F.margen.logic.margins(40, 60);
  close(x.margin, 100 / 3); close(x.markup, 50);
  close(F.margen.logic.priceForMargin(40, 35), 40 / 0.65);
});

test('ahorro mensual necesario', () => {
  const L = F.ahorro.logic;
  close(L.monthlyNeeded(10000, 1000, 24, 0), 375);
  assert.equal(L.monthlyNeeded(100, 200, 12, 0), 0);
  // Con rentabilidad, la aportación necesaria es menor.
  assert.ok(L.monthlyNeeded(10000, 1000, 24, 5) < 375);
});

test('sueldo: conversión ida y vuelta', () => {
  const x = F.sueldo.logic.convert(1800, 'month', 40, 5, 12);
  close(x.annual, 21600);
  const y = F.sueldo.logic.convert(x.hourly, 'hour', 40, 5, 12);
  close(y.annual, 21600);
});

test('inflación', () => {
  const x = F.inflacion.logic.project(1000, 4, 10);
  close(x.future, 1480.24, 0.01); close(x.power, 675.56, 0.01);
});

test('IMC y clasificación', () => {
  const L = S.imc.logic;
  close(L.bmi(70, 170), 24.22, 0.01);
  assert.equal(L.category(24.9), 'Peso normal');
  assert.equal(L.category(30), 'Obesidad grado I');
  assert.equal(L.category(17), 'Bajo peso');
});

test('calorías Mifflin-St Jeor', () => {
  close(S.calorias.logic.bmr('m', 70, 170, 30), 1617.5);
  close(S.calorias.logic.bmr('f', 60, 165, 30), 1320.25);
});

test('fecha probable de parto', () => {
  const lmp = Date.UTC(2026, 0, 1);
  assert.equal(new Date(S.parto.logic.dueDate(lmp, 28)).toISOString().slice(0, 10), '2026-10-08');
  const g = S.parto.logic.gestation(lmp, lmp + 70 * 86400000, 28);
  assert.deepEqual([g.weeks, g.days], [10, 0]);
});

test('ritmo de carrera', () => {
  const L = S.ritmo.logic;
  const p = L.pace(10, 55 * 60);
  assert.equal(L.hms(p.secPerKm), '5:30');
  close(p.kmh, 10.909, 0.001);
  assert.equal(L.hms(3725), '1:02:05');
});

test('edad exacta', () => {
  const L = U.edad.logic;
  assert.deepEqual(L.age('1990-05-15', '2026-10-14'), { years: 36, months: 4, days: 29, totalDays: 13301, toBirthday: 213 });
  assert.equal(L.age('2000-10-14', '2026-10-14').toBirthday, 0);
  const x = L.age('2000-01-31', '2000-03-01');
  assert.deepEqual([x.years, x.months, x.days], [0, 1, 1]);
  const z = L.age('2000-02-29', '2001-02-28');
  assert.deepEqual([z.years, z.months, z.days], [1, 0, 0]);
  const w = L.age('1990-05-20', '2026-05-19');
  assert.deepEqual([w.years, w.months, w.days], [35, 11, 29]);
});

test('días entre fechas y días hábiles', () => {
  const L = U.diasEntre.logic;
  // Lunes 12/10/2026 → lunes 19/10/2026: 7 días, 5 hábiles.
  assert.deepEqual(L.between('2026-10-12', '2026-10-19', false), { days: 7, weeks: 1, rem: 0, business: 5 });
  assert.equal(L.between('2026-10-12', '2026-10-19', true).business, 6);
  assert.equal(L.between('2026-10-19', '2026-10-12', false).days, -7);
  assert.equal(L.between('2026-10-17', '2026-10-19', false).business, 0); // sábado y domingo
  assert.equal(L.between('2026-01-01', '2027-01-01', false).days, 365);
});

test('sumar días, días hábiles y meses', () => {
  const L = U.sumarDias.logic;
  assert.equal(L.add('2026-10-14', 30, 'd'), '2026-11-13');
  assert.equal(L.add('2026-10-16', 1, 'b'), '2026-10-19'); // viernes + 1 hábil = lunes
  assert.equal(L.add('2026-10-19', -1, 'b'), '2026-10-16');
  assert.equal(L.add('2026-01-31', 1, 'm'), '2026-02-28');
  assert.equal(L.add('2024-01-31', 1, 'm'), '2024-02-29');
  assert.equal(L.add('2026-03-31', -1, 'm'), '2026-02-28');
  assert.equal(L.add('2026-10-14', 2, 'w'), '2026-10-28');
});

test('horas trabajadas', () => {
  const L = U.horas.logic;
  assert.equal(L.minutes('09:00', '17:30', 30), 480);
  assert.equal(L.minutes('22:00', '06:00', 0), 480);
  assert.equal(L.minutes('', '06:00', 0), 0);
});

test('regla de tres', () => {
  close(U.reglaTres.logic.direct(3, 12, 5), 20);
  close(U.reglaTres.logic.inverse(3, 12, 5), 7.2);
});

test('promedio simple y ponderado', () => {
  const L = U.promedio.logic;
  close(L.average([[7, 30], [8.5, 40], [6, 30]]), 7.3);
  close(L.average([[6, NaN], [8, NaN], [NaN, NaN]]), 7);
  assert.ok(Number.isNaN(L.average([[NaN, NaN]])));
});

test('números romanos', () => {
  const L = U.romanos.logic;
  assert.equal(L.toRoman(2026), 'MMXXVI');
  assert.equal(L.toRoman(3999), 'MMMCMXCIX');
  assert.equal(L.toRoman(4000), null);
  assert.equal(L.fromRoman('mcmxciv'), 1994);
  assert.equal(L.fromRoman('IIII'), null);
  assert.equal(L.fromRoman('VX'), null);
  for (let n = 1; n <= 3999; n++) assert.equal(L.fromRoman(L.toRoman(n)), n);
});

test('generador de contraseñas', () => {
  const L = U.contrasenas.logic;
  let i = 0;
  const seq = () => i++ % 3;
  assert.equal(L.generate(6, { lower: true }, seq), 'abcabc');
  assert.equal(L.pool({ digits: true, noAmbiguous: true }), '23456789');
  assert.equal(L.generate(10, {}, seq), '');
  close(L.entropy(16, 64), 96);
});

test('contador de palabras', () => {
  const x = U.palabras.logic.count('Hola mundo. ¿Qué tal estás?\n\nSegundo párrafo — aquí');
  assert.equal(x.words, 8);
  assert.equal(x.paragraphs, 2);
  assert.equal(x.sentences, 3);
  assert.equal(U.palabras.logic.count('   ').words, 0);
});

test('combustible', () => {
  const x = U.combustible.logic.trip(400, 6.5, 1.65, 2, false);
  close(x.cost, 42.9); close(x.each, 21.45); close(x.liters, 26);
  close(U.combustible.logic.trip(400, 6.5, 1.65, 1, true).cost, 85.8);
});

test('temperatura y conversores', () => {
  const t = U.temperatura.logic.convert(100, 'C');
  close(t.F, 212); close(t.K, 373.15);
  close(U.temperatura.logic.convert(-40, 'F').C, -40);
  close(converterLogic.convert(212, 5 / 9, -32 * 5 / 9), 100);
  close(converterLogic.convert(1, 0.45359237, 0), 0.45359237);
});
