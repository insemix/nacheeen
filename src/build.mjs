// Generador estático: node src/build.mjs  →  dist/
// Sin dependencias. Publica solo las páginas cuya fecha `publish` ya ha llegado,
// así la reconstrucción semanal programada hace crecer el sitio sola.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import finanzas from './tools/finanzas.mjs';
import salud from './tools/salud.mjs';
import utiles from './tools/utiles.mjs';
import variantes from './tools/variantes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');
export const ALL_TOOLS = [...finanzas, ...salud, ...utiles, ...variantes];
const CATEGORY_ORDER = ['Finanzas', 'IVA por país', 'Matemáticas', 'Salud', 'Fechas', 'Conversores', 'Utilidades'];

export function loadConfig() {
  const cfg = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));
  // Los secretos/variables del repositorio tienen prioridad: así se configura sin tocar código.
  const env = process.env;
  if (env.ADSENSE_CLIENT) cfg.adsenseClient = env.ADSENSE_CLIENT;
  if (env.CUSTOM_DOMAIN) cfg.customDomain = env.CUSTOM_DOMAIN;
  if (env.DONATION_URL) cfg.donationUrl = env.DONATION_URL;
  cfg.customDomain = (cfg.customDomain || '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  cfg.adsenseClient = (cfg.adsenseClient || '').trim();
  if (cfg.adsenseClient && !/^ca-pub-\d{10,20}$/.test(cfg.adsenseClient)) {
    throw new Error(`adsenseClient inválido: "${cfg.adsenseClient}" (formato esperado: ca-pub-1234567890123456)`);
  }
  // En GitHub Actions, la URL se deduce del repositorio: un repo llamado `<usuario>.github.io`
  // se sirve en la raíz del dominio (necesario para verificar AdSense y para ads.txt).
  if (env.GITHUB_REPOSITORY) {
    const [owner, name] = env.GITHUB_REPOSITORY.split('/');
    cfg.siteUrl = name.toLowerCase() === `${owner}.github.io`.toLowerCase()
      ? `https://${name.toLowerCase()}` : `https://${owner.toLowerCase()}.github.io/${name}`;
  }
  const origin = cfg.customDomain ? `https://${cfg.customDomain}` : cfg.siteUrl.replace(/\/+$/, '');
  const url = new URL(origin);
  cfg.origin = url.origin;
  cfg.base = url.pathname.replace(/\/+$/, ''); // '' o '/nacheeen'
  return cfg;
}

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function today() {
  return process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
}

export function publishedTools(date = today()) {
  const seen = new Set();
  for (const t of ALL_TOOLS) {
    if (seen.has(t.slug)) throw new Error(`slug duplicado: ${t.slug}`);
    seen.add(t.slug);
    for (const k of ['slug', 'title', 'h1', 'description', 'category', 'publish', 'form', 'logic', 'ui', 'content']) {
      if (!t[k]) throw new Error(`${t.slug || '?'}: falta el campo ${k}`);
    }
    if (!CATEGORY_ORDER.includes(t.category)) throw new Error(`${t.slug}: categoría desconocida ${t.category}`);
    // `f` y `resultado` los usa la plantilla; un input con ese id rompería la salida.
    if (/id="(f|resultado)"/.test(t.form)) throw new Error(`${t.slug}: el formulario usa un id reservado`);
  }
  return ALL_TOOLS.filter(t => t.publish <= date);
}

// Convierte el objeto `logic` y la función `ui` en el script que se incrusta en la página.
export function toolScript(t) {
  const methods = Object.values(t.logic).map(f => {
    const src = f.toString();
    if (!/^[A-Za-z_$][\w$]*\s*\(/.test(src)) throw new Error(`${t.slug}: logic debe usar sintaxis de método`);
    return src;
  });
  const ui = t.ui.toString().replace(/^ui\s*\(/, 'function (');
  return `(function(){'use strict';var L={${methods.join(',\n')}};(${ui})(L,window.H,${JSON.stringify(t.defaults || {})});})();`;
}

function layout(cfg, v, { title, description, path, body, head = '', scripts = '', noindex = false }) {
  const canonical = cfg.origin + cfg.base + path;
  const ads = cfg.adsenseClient
    ? `<meta name="google-adsense-account" content="${esc(cfg.adsenseClient)}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(cfg.adsenseClient)}" crossorigin="anonymous"></script>`
    : '';
  const support = cfg.donationUrl
    ? `<p class="support">¿Te ha resultado útil? <a href="${esc(cfg.donationUrl)}" rel="noopener" target="_blank">Invítanos a un café ☕</a> y ayúdanos a mantener las calculadoras gratis.</p>`
    : '';
  const b = cfg.base;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="${esc(cfg.siteName)}">
<meta property="og:locale" content="es_ES">
<meta name="theme-color" content="#0b6e4f">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230b6e4f'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3E%3D%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${b}/assets/style.css?v=${v}">
${ads}
${head}
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="${b}/">Calcu<span>Fácil</span></a></div></header>
<main class="wrap">
${body}
${support}
</main>
<footer><div class="wrap">
<a href="${b}/">Todas las calculadoras</a><a href="${b}/acerca/">Acerca de</a><a href="${b}/privacidad/">Privacidad y cookies</a><a href="${esc(cfg.contactUrl)}" rel="noopener">Contacto</a>
<p>© ${today().slice(0, 4)} ${esc(cfg.siteName)}. Herramientas gratuitas con fines informativos.</p>
</div></footer>
<script src="${b}/assets/site.js?v=${v}"></script>
${scripts}
</body>
</html>
`;
}

const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const stripTags = s => s.replace(/<[^>]+>/g, '');

function toolPage(cfg, v, t, published) {
  const path = `/${t.slug}/`;
  const url = cfg.origin + cfg.base + path;
  const publishedSlugs = new Set(published.map(p => p.slug));
  const related = published.filter(p => p.category === t.category && p.slug !== t.slug).slice(0, 6);
  const others = published.filter(p => p.category !== t.category && !p.slug.startsWith('calculadora-iva-')).slice(0, 4);
  const link = p => `<a href="${cfg.base}/${p.slug}/" data-search="${esc(p.h1)}">${esc(p.h1)}<small>${esc(p.short || '')}</small></a>`;
  const inverse = t.inverse && publishedSlugs.has(t.inverse.slug)
    ? `<p>¿Necesitas la conversión contraria? Usa el conversor de <a href="${cfg.base}/${t.inverse.slug}/">${esc(t.inverse.label)}</a>.</p>` : '';
  const faq = (t.faq || []).map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  const body = `
<nav class="crumbs"><a href="${cfg.base}/">Inicio</a> › ${esc(t.category)}</nav>
<article>
<h1>${esc(t.h1)}</h1>
<p class="lead">${esc(t.intro || t.description)}</p>
<form id="f" class="card" autocomplete="off" novalidate>${t.form}</form>
<div id="resultado" class="result" aria-live="polite"></div>
<section class="content">${t.content}${inverse}</section>
${faq ? `<section class="faq"><h2>Preguntas frecuentes</h2>${faq}</section>` : ''}
${related.length ? `<section><h2>Calculadoras relacionadas</h2><div class="grid">${related.map(link).join('')}</div></section>` : ''}
${others.length ? `<section><h2>Otras herramientas</h2><div class="grid">${others.map(link).join('')}</div></section>` : ''}
</article>`;
  const graph = [
    { '@type': 'WebApplication', name: t.h1, url, description: t.description, applicationCategory: t.category === 'Salud' ? 'HealthApplication' : t.category === 'Finanzas' || t.category === 'IVA por país' ? 'FinanceApplication' : 'UtilitiesApplication', operatingSystem: 'Any', inLanguage: 'es', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: cfg.origin + cfg.base + '/' }, { '@type': 'ListItem', position: 2, name: t.h1, item: url }] },
  ];
  if (t.faq && t.faq.length) graph.push({ '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: stripTags(a) } })) });
  return layout(cfg, v, {
    title: t.title, description: t.description, path, body,
    head: ld({ '@context': 'https://schema.org', '@graph': graph }),
    scripts: `<script>${toolScript(t)}</script>`,
  });
}

function homePage(cfg, v, published) {
  const byCat = CATEGORY_ORDER.map(c => [c, published.filter(t => t.category === c)]).filter(([, l]) => l.length);
  const body = `
<h1>${esc(cfg.tagline)}</h1>
<p class="lead">${published.length} calculadoras y conversores gratuitos. Funcionan en tu navegador, sin registro y sin enviar tus datos a ningún servidor.</p>
<div class="search"><input id="q" type="search" placeholder="Buscar calculadora… (p. ej. IVA, préstamo, edad)" aria-label="Buscar calculadora"></div>
${byCat.map(([c, list]) => `<section class="cat"><h2>${esc(c)}</h2><div class="grid">${list.map(t => `<a href="${cfg.base}/${t.slug}/" data-search="${esc(t.h1 + ' ' + (t.short || '') + ' ' + c)}">${esc(t.h1)}<small>${esc(t.short || '')}</small></a>`).join('')}</div></section>`).join('\n')}`;
  return layout(cfg, v, {
    title: `${cfg.siteName}: ${cfg.tagline}`,
    description: 'Calculadoras online gratis en español: IVA, porcentajes, préstamos, interés compuesto, IMC, calorías, edad, días entre fechas, conversores de unidades y más.',
    path: '/', body,
    head: ld({ '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.siteName, url: cfg.origin + cfg.base + '/', inLanguage: 'es' }),
  });
}

function staticPages(cfg) {
  return {
    acerca: {
      title: `Acerca de ${cfg.siteName}`,
      description: `Qué es ${cfg.siteName} y cómo funcionan sus calculadoras.`,
      body: `<h1>Acerca de ${esc(cfg.siteName)}</h1>
<p>${esc(cfg.siteName)} es una colección de calculadoras y conversores gratuitos en español para resolver cálculos cotidianos de finanzas, salud, fechas y matemáticas de forma rápida y clara.</p>
<p>Todas las herramientas funcionan en tu navegador: los datos que introduces no se envían ni se almacenan en ningún servidor. Cada calculadora explica la fórmula que usa para que puedas entender y comprobar el resultado.</p>
<p>Los resultados son orientativos y no sustituyen el asesoramiento de un profesional (fiscal, financiero o sanitario). Si encuentras un error o quieres proponer una calculadora, <a href="${esc(cfg.contactUrl)}" rel="noopener">escríbenos</a>.</p>`,
    },
    privacidad: {
      title: 'Política de privacidad y cookies',
      description: `Política de privacidad y cookies de ${cfg.siteName}.`,
      body: `<h1>Política de privacidad y cookies</h1>
<p>Última actualización: ${today()}.</p>
<h2>Datos que introduces en las calculadoras</h2>
<p>Los cálculos se hacen íntegramente en tu navegador. No recogemos, enviamos ni almacenamos los valores que introduces.</p>
<h2>Publicidad</h2>
<p>Este sitio se financia con publicidad de Google AdSense. Google y sus socios pueden usar cookies para mostrar anuncios basados en tus visitas anteriores a este y otros sitios web. Google usa las cookies de publicidad para que tanto él como sus socios puedan mostrar anuncios basados en las visitas que haces a este y otros sitios de Internet.</p>
<p>Puedes inhabilitar la publicidad personalizada en <a href="https://adssettings.google.com" rel="noopener">la configuración de anuncios de Google</a> o en <a href="https://www.aboutads.info" rel="noopener">www.aboutads.info</a>. Más información sobre cómo usa Google los datos: <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</p>
<p>A los visitantes del Espacio Económico Europeo, del Reino Unido y de Suiza se les solicita el consentimiento mediante una plataforma de gestión del consentimiento certificada por Google antes de usar cookies publicitarias.</p>
<h2>Alojamiento</h2>
<p>El sitio se aloja en GitHub Pages, que puede registrar datos técnicos de acceso (como la dirección IP) por motivos de seguridad. Consulta la <a href="https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">declaración de privacidad de GitHub</a>.</p>
<h2>Contacto</h2>
<p>Para cualquier consulta sobre privacidad, <a href="${esc(cfg.contactUrl)}" rel="noopener">contacta con nosotros</a>.</p>`,
    },
  };
}

export function build({ date = today(), out = OUT } = {}) {
  const cfg = loadConfig();
  const published = publishedTools(date);
  const css = readFileSync(join(ROOT, 'src/assets/style.css'), 'utf8');
  const js = readFileSync(join(ROOT, 'src/assets/site.js'), 'utf8');
  const v = createHash('sha256').update(css + js).digest('hex').slice(0, 8);

  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'assets'), { recursive: true });
  cpSync(join(ROOT, 'src/assets'), join(out, 'assets'), { recursive: true });

  const write = (rel, content) => { const f = join(out, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, content); };
  const urls = [];
  const addUrl = (path, lastmod) => urls.push({ loc: cfg.origin + cfg.base + path, lastmod });

  write('index.html', homePage(cfg, v, published));
  addUrl('/', date);
  for (const t of published) {
    write(`${t.slug}/index.html`, toolPage(cfg, v, t, published));
    addUrl(`/${t.slug}/`, t.publish);
  }
  for (const [slug, p] of Object.entries(staticPages(cfg))) {
    write(`${slug}/index.html`, layout(cfg, v, { title: p.title, description: p.description, path: `/${slug}/`, body: p.body }));
    addUrl(`/${slug}/`, '2026-10-14');
  }
  write('404.html', layout(cfg, v, {
    title: 'Página no encontrada', description: 'La página que buscas no existe.', path: '/404.html', noindex: true,
    body: `<h1>Página no encontrada</h1><p>La página que buscas no existe o se ha movido. <a href="${cfg.base}/">Ver todas las calculadoras</a>.</p>`,
  }));

  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${cfg.origin + cfg.base}/sitemap.xml\n`);
  write('.nojekyll', '');
  if (cfg.adsenseClient) write('ads.txt', `google.com, ${cfg.adsenseClient.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
  if (cfg.customDomain) write('CNAME', cfg.customDomain + '\n');
  if (cfg.indexNowKey) write(`${cfg.indexNowKey}.txt`, cfg.indexNowKey);
  write('build-info.json', JSON.stringify({ date, pages: published.length, upcoming: ALL_TOOLS.length - published.length, urls }, null, 2));

  return { cfg, published, urls };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { published, urls, cfg } = build();
  const next = ALL_TOOLS.filter(t => t.publish > today()).sort((a, b) => a.publish.localeCompare(b.publish))[0];
  console.log(`✓ ${published.length} calculadoras publicadas, ${urls.length} URLs → dist/ (${cfg.origin}${cfg.base}/)`);
  console.log(`  ${ALL_TOOLS.length - published.length} páginas en cola${next ? `; la próxima (${next.slug}) se publica el ${next.publish}` : ''}.`);
  if (!cfg.adsenseClient) console.log('  ⚠ Sin adsenseClient: el sitio se publica sin anuncios.');
}
