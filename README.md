# CalcuFácil: sitio de calculadoras que se mantiene solo

Un sitio web estático con **64 calculadoras y conversores en español** (IVA por país, préstamos, interés compuesto, IMC, edad, días entre fechas, conversiones de unidades…) que se monetiza con **Google AdSense** y funciona sin intervención una vez configurado:

| Qué | Cómo se automatiza | Coste |
|---|---|---|
| Hosting | GitHub Pages | 0 € |
| Publicación | GitHub Actions despliega en cada cambio y **cada lunes** | 0 € |
| Crecimiento de contenido | 31 páginas en cola que se publican solas, **2 por semana** hasta febrero de 2027 | 0 € |
| Indexación | Sitemap con fechas e IndexNow (Bing, Yandex…) tras cada despliegue | 0 € |
| Supervivencia | El workflow se reactiva solo para que GitHub no lo apague tras 60 días | 0 € |
| Ingresos | AdSense Auto Ads: Google elige dónde y cuántos anuncios mostrar | — |
| Cobro | AdSense paga por transferencia al superar 100 $ de saldo | — |

## Puesta en marcha (una sola vez, unos 20 minutos)

Hay pasos que solo puedes hacer tú porque exigen tu identidad y tus datos bancarios.

1. **Activa GitHub Pages.** En *Settings → Pages → Build and deployment → Source*, elige **GitHub Actions**.
2. **Fusiona esta rama en `master`.** El primer despliegue se lanza solo. El sitio queda en `https://insemix.github.io/nacheeen/`.
3. **Compra un dominio propio** (unos 10 $/año, por ejemplo en Cloudflare o Porkbun). AdSense casi nunca aprueba subdominios de `github.io`. Después:
   - En tu proveedor de dominio, crea un registro `CNAME` de `www` a `insemix.github.io`.
   - En *Settings → Secrets and variables → Actions → Variables*, crea `CUSTOM_DOMAIN` = `www.tudominio.com`.
   - En *Settings → Pages*, escribe el mismo dominio y marca **Enforce HTTPS**.
4. **Date de alta en [Google AdSense](https://adsense.google.com)** con tu dominio. Copia tu ID de editor (`ca-pub-…`) y crea la variable `ADSENSE_CLIENT` con ese valor. El siguiente despliegue añade el código de anuncios y el archivo `ads.txt`. En AdSense:
   - Activa **Auto ads**.
   - En *Privacidad y mensajes*, activa el mensaje de consentimiento del RGPD (necesario para el tráfico de Europa).
   - Añade tus datos fiscales y de pago.
5. **Registra el sitio en [Google Search Console](https://search.google.com/search-console)** y envía `https://tudominio/sitemap.xml`. Es el paso que más acelera la llegada de visitas desde Google.
6. *(Opcional)* Crea la variable `DONATION_URL` con un enlace de Ko-fi, Buy Me a Coffee o PayPal.me para mostrar un botón de donación.

Tras cambiar una variable, ejecuta el workflow a mano (*Actions → Publicar sitio → Run workflow*) o espera al lunes.

## Ingresos que puedes esperar

**No hay garantía de ingresos.** Dependen de que Google posicione las páginas, y en un dominio nuevo eso suele tardar entre 3 y 12 meses.

- AdSense paga en español, como referencia, entre **1 y 4 $ por cada 1.000 páginas vistas**. El tráfico de España y Estados Unidos paga más que el de Latinoamérica.
- **Para ganar 100 $/mes hacen falta unas 30.000–80.000 páginas vistas al mes**, es decir, unas 1.000–2.500 al día.
- Las calculadoras funcionan bien para esto: se buscan todos los días, la gente vuelve a usarlas y el contenido no caduca. La competencia también es alta, así que tómalo como una apuesta a medio plazo.

Lo que más mejora las probabilidades, por orden:

1. Dominio propio y Search Console (pasos 3 y 5).
2. Dejar que la cola semanal siga publicando páginas.
3. Añadir más calculadoras (ver abajo). Cada página es una nueva puerta de entrada desde Google.

## Desarrollo

```bash
npm test          # tests de la lógica de cada calculadora y del build
npm run build     # genera dist/ con las páginas publicadas a fecha de hoy
npm run serve     # http://localhost:8080/nacheeen/
BUILD_DATE=2099-01-01 npm run build   # previsualiza también las páginas en cola
```

Estructura:

- `src/tools/*.mjs`: cada calculadora es un objeto con estos campos:
  - `logic`: funciones puras, con tests.
  - `ui`: código que se ejecuta en el navegador.
  - `form`: el formulario.
  - `content` y `faq`: el texto SEO.
  - `publish`: la fecha a partir de la cual se publica.
- `src/tools/variantes.mjs`: páginas programáticas (IVA por país y conversiones) con calendario de publicación.
- `src/build.mjs`: el generador del sitio (HTML, sitemap, robots, ads.txt, JSON-LD). No tiene dependencias.
- `.github/workflows/deploy.yml`: el despliegue en cada push a `master` y cada lunes.

Para añadir una calculadora, crea el objeto en `src/tools/` (con `publish` en una fecha futura si quieres programarla), añade sus tests en `test/logic.test.mjs` y haz push. El resto es automático.
