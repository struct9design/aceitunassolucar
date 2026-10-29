import type { ImageMetadata } from 'astro';
import datos from '../data/productos.json';

export interface Formato {
  nombre: string;
  peso: string;
  detalle: string;
}

export interface Producto {
  slug: string;
  nombre: string;
  categoria: string;
  resumen: string;
  descripcion: string;
  variedad: string;
  origen: string;
  ingredientes: string;
  alergenos: string;
  conservacion: string;
  formatos: Formato[];
  foto: string;
  galeria: string[];
  comoTomarla?: { titular: string; ideas: string[] };
  destacado?: boolean;
  /** Número de catálogo, según el orden del JSON: "01", "02"… */
  num: string;
}

export const productos: Producto[] = (datos as Omit<Producto, 'num'>[]).map((p, i) => ({
  ...p,
  num: String(i + 1).padStart(2, '0'),
}));

/** Categorías en el orden en que aparecen en el catálogo. */
export const categorias = [...new Set(productos.map((p) => p.categoria))];

export const slugCategoria = (c: string) =>
  c
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

export const formatosResumen = (p: Producto) => p.formatos.map((f) => `${f.nombre} ${f.peso}`).join(' · ');

const fotos = import.meta.glob<{ default: ImageMetadata }>('../assets/fotos/*.jpg', { eager: true });

/** Devuelve la foto preparada por su nombre (sin extensión), o undefined si no existe. */
export function foto(nombre: string | undefined): ImageMetadata | undefined {
  if (!nombre) return undefined;
  return fotos[`../assets/fotos/${nombre}.jpg`]?.default;
}

export const urlProducto = (p: Producto) => `/aceitunas/${p.slug}/`;
