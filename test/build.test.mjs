import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { build, loadConfig, ALL_TOOLS, publishedTools, toolScript } from '../src/build.mjs';

test('todas las páginas tienen campos válidos y slugs únicos', () => {
  publishedTools('2099-01-01');
  for (const t of ALL_TOOLS) {
    assert.match(t.slug, /^[a-z0-9-]+$/, t.slug);
    assert.ok(t.title.length <= 90, `${t.slug}: título demasiado largo (${t.title.length})`);
    assert.ok(t.description.length >= 70 && t.description.length <= 170, `${t.slug}: descripción ${t.description.length}`);
  }
});

test('el script incrustado de cada calculadora es JavaScript válido', () => {
  for (const t of ALL_TOOLS) new vm.Script(toolScript(t), { filename: t.slug });
});

test('la publicación escalonada añade páginas con el tiempo', () => {
  const launch = publishedTools('2026-10-14').length;
  const later = publishedTools('2026-11-30').length;
  const all = publishedTools('2099-01-01').length;
  assert.ok(launch >= 30, `lanzamiento: ${launch}`);
  assert.ok(later > launch && all > later, `${launch} < ${later} < ${all}`);
  assert.equal(all, ALL_TOOLS.length);
});

test('build genera sitemap, robots y páginas sin enlaces internos rotos', () => {
  const out = mkdtempSync(join(tmpdir(), 'calc-'));
  const { cfg, published, urls } = build({ date: '2026-10-14', out });
  for (const f of ['index.html', 'sitemap.xml', 'robots.txt', '404.html', 'acerca/index.html', 'privacidad/index.html', '.nojekyll']) {
    assert.ok(existsSync(join(out, f)), f);
  }
  assert.equal(urls.length, published.length + 3);
  const sitemap = readFileSync(join(out, 'sitemap.xml'), 'utf8');
  for (const t of published) assert.ok(sitemap.includes(`/${t.slug}/`), t.slug);
  assert.ok(!sitemap.includes('kilos-a-libras'), 'página futura no publicada');

  const slugs = new Set(published.map(t => t.slug).concat(['acerca', 'privacidad']));
  const files = ['index.html', ...published.map(t => `${t.slug}/index.html`)];
  for (const f of files) {
    const html = readFileSync(join(out, f), 'utf8');
    assert.match(html, /<link rel="canonical" href="https:\/\//);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.startsWith(cfg.base + '/') || href.startsWith(cfg.base + '/assets/')) continue;
      const slug = href.slice(cfg.base.length + 1).replace(/\/$/, '');
      assert.ok(slug === '' || slugs.has(slug), `${f}: enlace roto ${href}`);
    }
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) JSON.parse(json);
  }
});

test('un repo <usuario>.github.io se publica en la raíz del dominio', () => {
  const out = mkdtempSync(join(tmpdir(), 'calc-'));
  const prev = process.env.GITHUB_REPOSITORY;
  try {
    process.env.GITHUB_REPOSITORY = 'insemix/insemix.github.io';
    const { cfg } = build({ date: '2026-10-14', out });
    assert.equal(cfg.origin + cfg.base, 'https://insemix.github.io');
    assert.ok(readFileSync(join(out, 'index.html'), 'utf8').includes('href="/assets/style.css'));
    assert.ok(readFileSync(join(out, 'robots.txt'), 'utf8').includes('Sitemap: https://insemix.github.io/sitemap.xml'));
    process.env.GITHUB_REPOSITORY = 'insemix/nacheeen';
    assert.equal(loadConfig().base, '/nacheeen');
  } finally {
    if (prev === undefined) delete process.env.GITHUB_REPOSITORY; else process.env.GITHUB_REPOSITORY = prev;
  }
});

test('AdSense y dominio propio se activan por variables de entorno', () => {
  const out = mkdtempSync(join(tmpdir(), 'calc-'));
  process.env.ADSENSE_CLIENT = 'ca-pub-1234567890123456';
  process.env.CUSTOM_DOMAIN = 'https://www.ejemplo.com/';
  try {
    build({ date: '2026-10-14', out });
    assert.equal(readFileSync(join(out, 'ads.txt'), 'utf8'), 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
    assert.equal(readFileSync(join(out, 'CNAME'), 'utf8'), 'www.ejemplo.com\n');
    const html = readFileSync(join(out, 'calculadora-iva/index.html'), 'utf8');
    assert.ok(html.includes('adsbygoogle.js?client=ca-pub-1234567890123456'));
    assert.ok(html.includes('href="https://www.ejemplo.com/calculadora-iva/"'));
    assert.ok(html.includes('href="/assets/style.css'));
    process.env.ADSENSE_CLIENT = 'pub-mal';
    assert.throws(() => build({ date: '2026-10-14', out }), /adsenseClient inválido/);
  } finally {
    delete process.env.ADSENSE_CLIENT;
    delete process.env.CUSTOM_DOMAIN;
  }
});
