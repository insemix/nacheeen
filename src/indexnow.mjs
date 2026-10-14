// Notifica a los buscadores compatibles con IndexNow (Bing, Yandex, Seznam, Naver…)
// las páginas publicadas en los últimos 7 días. Se ejecuta tras cada despliegue.
import { readFileSync } from 'node:fs';
import { loadConfig } from './build.mjs';

const cfg = loadConfig();
const info = JSON.parse(readFileSync(new URL('../dist/build-info.json', import.meta.url), 'utf8'));
const since = new Date(Date.parse(info.date) - 7 * 86400000).toISOString().slice(0, 10);
const urlList = info.urls.filter(u => u.lastmod >= since).map(u => u.loc);

if (!cfg.indexNowKey || !urlList.length) {
  console.log('IndexNow: nada que notificar.');
  process.exit(0);
}

const body = {
  host: new URL(cfg.origin).host,
  key: cfg.indexNowKey,
  keyLocation: `${cfg.origin}${cfg.base}/${cfg.indexNowKey}.txt`,
  urlList,
};
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
// 200/202 = aceptado. Un fallo aquí no debe romper el despliegue.
console.log(`IndexNow: ${urlList.length} URLs → HTTP ${res.status}`);
