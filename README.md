# Aceitunas Solúcar · web escaparate

Astro + Tailwind, sitio estático.

```sh
npm install
npm run dev       # desarrollo en http://localhost:4321
npm run build     # genera dist/ (AVIF/WebP en varios tamaños)
```

## Contenido

- **Catálogo:** `src/data/productos.json`. Cada producto genera su ficha en `/aceitunas/<slug>/`.
  El orden del archivo da el «Nº» del catálogo. `foto` y `galeria` son nombres de `src/assets/fotos/` (sin `.jpg`).
- **Datos de la empresa:** `src/data/sitio.json` (teléfono, horario, URL del portal, servicio del formulario).
- **Pendiente:** todo lo que va `[ENTRE CORCHETES]` sale resaltado en amarillo en la web hasta que se rellene.

## Fotos

Los originales están en `fotos/` y **no van al repo**. `npm run fotos` los recorta y reduce a
`src/assets/fotos/` (definición de cada encuadre en `scripts/preparar-fotos.mjs`).
Astro genera las versiones AVIF/WebP al compilar.

## Portal de pedidos

No forma parte de esta web: «Acceso clientes» enlaza a `portalUrl` de `sitio.json` (`https://pedidos.[dominio]`).
