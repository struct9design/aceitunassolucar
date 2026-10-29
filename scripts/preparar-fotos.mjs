// Prepara las fotos de trabajo a partir de los originales de ../fotos (que NO van al repo).
// Recorta, encuadra y reduce cada original a una "maestra" JPEG en src/assets/fotos/.
// Astro (astro:assets) genera después las versiones AVIF/WebP en varios tamaños.
//
// Uso: npm run fotos            (lee ./fotos)
//      FOTOS_DIR=/ruta npm run fotos

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ORIGEN = process.env.FOTOS_DIR ?? 'fotos';
const DESTINO = 'src/assets/fotos';
const LADO_MAX = 2000;

// tarro: recorta el fondo blanco y centra el tarro en un lienzo 3:4 (o la proporción indicada).
// encuadre: { cx, cy, h, ar } — centro (fracciones), alto del recorte (fracción del alto) y proporción ancho/alto.
const FOTOS = {
  // Tarros con la etiqueta nueva (Catálogo 2023 y fotos de Grupo MAS, 2023)
  'tarro-manzanilla-alinada': { src: 'fotos GRUPO MAS/031256 MANZANILLA ALIÑADA 350GM IMG_0023.JPG', tarro: true },
  'tarro-gordal-partida': { src: 'fotos GRUPO MAS/031254 GORDAL PARTIDA 750GM IMG_0052.JPG', tarro: true },
  'tarro-gordal-rayada': { src: 'fotos GRUPO MAS/031250 GORDAL RAYADA 350GM IMG_0018.JPG', tarro: true },
  'tarro-verdial-partida': { src: 'Catalogo 2023/IMG_0064.JPG', tarro: true },
  'tarro-manzanilla-morada': { src: 'Catalogo 2023/IMG_0067.JPG', tarro: true },
  'tarro-chupadeo': { src: 'Catalogo 2023/IMG_0092.JPG', tarro: true },
  'tarro-super-chupadeo': { src: 'Catalogo 2023/IMG_0083.JPG', tarro: true },
  'tarro-mojo-picon': { src: 'Catalogo 2023/IMG_0062.JPG', tarro: true },
  'tarro-manzanilla-anchoa': { src: 'Catalogo 2023/IMG_0070.JPG', tarro: true },
  'tarro-gordal-rellena': { src: 'Catalogo 2023/IMG_0089.JPG', tarro: true },
  'tarro-manzanilla-deshuesada': { src: 'Catalogo 2023/IMG_0086.JPG', tarro: true },
  'tarro-manzanilla-fina': { src: 'Catalogo 2023/IMG_0004.JPG', tarro: true },
  'tarro-cocktel': { src: 'Catalogo 2023/IMG_0080.JPG', tarro: true },
  'tarro-pepinillos': { src: 'Catalogo 2023/IMG_0020.JPG', tarro: true },
  'tarro-alcaparron': { src: 'Catalogo 2023/IMG_0024.JPG', encuadre: { cx: 0.5, cy: 0.5, h: 1, ar: 0.75 } },
  'tarro-de-la-abuela': { src: 'Web/Aceitunas Solucar - De la Abuela.jpg', encuadre: { cx: 0.5, cy: 0.56, h: 0.86, ar: 0.75 } },
  'formatos-gama': { src: 'Catalogo 2023/IMG_0108.JPG', tarro: true, ar: 1.25 },

  // Emplatados (recortados para dejar fuera los tarros con etiqueta antigua del fondo)
  'portada-manzanilla-barro': { src: 'Web/Foto18.JPG', encuadre: { cx: 0.48, cy: 0.57, h: 0.86, ar: 0.87 } },
  'plato-manzanilla-barro': { src: 'Web/Foto17.JPG', encuadre: { cx: 0.45, cy: 0.6, h: 0.8, ar: 1 } },
  'plato-alinadas-oregano': { src: 'Web/Foto12.JPG', encuadre: { cx: 0.45, cy: 0.55, h: 0.8, ar: 1 } },
  'plato-morada': { src: 'Web/Foto22.JPG', encuadre: { cx: 0.6, cy: 0.58, h: 0.82, ar: 1 } },
  'plato-variantes': { src: 'Web/Foto33.JPG', encuadre: { cx: 0.52, cy: 0.6, h: 0.8, ar: 1 } },
  'plato-banderillas': { src: 'Web/Foto39.JPG', encuadre: { cx: 0.5, cy: 0.56, h: 0.72, ar: 0.75 } },
  'plato-banderillas-2': { src: 'Web/Foto40.JPG', encuadre: { cx: 0.5, cy: 0.6, h: 0.72, ar: 1 } },
  'plato-gordal-rellena': { src: 'Web/Foto7.JPG', encuadre: { cx: 0.5, cy: 0.64, h: 0.7, ar: 1 } },
  'plato-manzanilla-natural': { src: 'Web/Foto29.JPG', encuadre: { cx: 0.5, cy: 0.7, h: 0.6, ar: 1 } },
  'plato-pepinillos': { src: 'Bodegon 2/Foto2.JPG', encuadre: { cx: 0.45, cy: 0.55, h: 0.8, ar: 1 } },
  'plato-pepinillos-2': { src: 'Bodegon 2/Foto4.JPG', encuadre: { cx: 0.58, cy: 0.6, h: 0.8, ar: 1 } },
  'plato-alcaparrones': { src: 'Bodegon 2/Foto12.JPG', encuadre: { cx: 0.55, cy: 0.58, h: 0.76, ar: 1 } },

  // Ambiente para Historia y Proceso
  'mesa-aperitivo': { src: 'Bodegon 2/Foto19.JPG', encuadre: { cx: 0.5, cy: 0.75, h: 0.5, ar: 21 / 9 } },
  'verdeo-aceitunas': { src: 'Web/Foto28.JPG', encuadre: { cx: 0.55, cy: 0.72, h: 0.56, ar: 1.25 } },
  'salmuera-tarro': { src: 'fotos GRUPO MAS/031258 SABOR ANCHOA 350GM IMG_0033.JPG', encuadre: { cx: 0.5, cy: 0.76, h: 0.26, ar: 1.25 } },
  'alino-especias': { src: 'Bodegon 2/Foto33.JPG', encuadre: { cx: 0.5, cy: 0.55, h: 0.9, ar: 1.25 } },
};

function caja({ cx, cy, h, ar }, W, H) {
  const alto = Math.round(Math.min(h * H, H));
  const ancho = Math.round(Math.min(alto * ar, W));
  const left = Math.round(Math.min(Math.max(cx * W - ancho / 2, 0), W - ancho));
  const top = Math.round(Math.min(Math.max(cy * H - alto / 2, 0), H - alto));
  return { left, top, width: ancho, height: alto };
}

async function tarro(src, ar = 0.75) {
  // Recorta el fondo claro y deja un margen proporcional alrededor del tarro.
  const { data, info } = await sharp(src).rotate().trim({ background: '#ffffff', threshold: 40 }).toBuffer({ resolveWithObject: true });
  const margen = 0.1;
  let ancho = info.width * (1 + margen * 2);
  let alto = info.height * (1 + margen * 2);
  if (ancho / alto < ar) ancho = alto * ar;
  else alto = ancho / ar;
  const x = Math.round((ancho - info.width) / 2);
  const y = Math.round((alto - info.height) / 2);
  return sharp(data).extend({
    left: x,
    right: Math.round(ancho) - info.width - x,
    top: y,
    bottom: Math.round(alto) - info.height - y,
    background: '#ffffff',
  });
}

await mkdir(DESTINO, { recursive: true });

for (const [nombre, def] of Object.entries(FOTOS)) {
  const src = path.join(ORIGEN, def.src);
  let img;
  if (def.tarro) {
    img = sharp(await (await tarro(src, def.ar)).toBuffer());
  } else {
    const base = sharp(src).rotate();
    const { width, height } = await base.metadata();
    img = base.extract(caja(def.encuadre, width, height));
  }
  const salida = path.join(DESTINO, `${nombre}.jpg`);
  await img
    .resize({ width: LADO_MAX, height: LADO_MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(salida);
  console.log('✓', salida);
}
