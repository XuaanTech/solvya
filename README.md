# Solvya

Herramientas online gratuitas construida con **Astro 7** + Cloudflare Pages.

## 🧰 Herramientas

- **Salud:** Calculadora de IMC, Calorías (TDEE/BMR), Ovulación, Embarazo
- **Conversores:** Unidades, Divisas, Color (HEX/RGB/HSL)
- **Generadores:** Contraseñas seguras, Códigos QR, Hash (SHA-256/MD5)

## 🚀 Desarrollo

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/ estático
npm run preview    # sirve dist/ localmente
```

## 💰 Monetización (AdSense)

Todo listo para Google AdSense:

1. Sustituye `ca-pub-XXXX` en `src/data/site.js` por tu ID real.
2. Rellena los slots en `SITE.adSlots` con los ID de tus unidades de anuncio.
3. Completa `public/ads.txt` cuando tengas el cliente aprobado.
4. Cambia el dominio en `src/data/site.js` y `astro.config.mjs`.

La web incluye política de privacidad compatible con AdSense (cookies, opt-out,
consentimiento EEE), avisos YMYL en salud y `robots.txt` que permite a
`Mediapartners-Google`.

## 📁 Estructura

- `src/content/<categoria>/` — artículos en MDX (SEO pillar)
- `src/data/tools.json` — catálogo de herramientas (rutas, JSON-LD, búsqueda)
- `src/components/tools/` — widgets interactivos (JS vanilla, sin framework)
- `src/lib/` — lógica pura (cálculos, formato, JSON-LD)

## 🌍 Deploy

Conecta el repositorio a Cloudflare Pages: `npm run build`, output `dist/`.