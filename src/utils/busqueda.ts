import { normalizarTexto } from './validaciones';

// Para buscar, la ñ también se trata como n: "canar" encuentra "Cañar" (útil sin teclado en español).
// Para detectar duplicados NO se hace: Cañar y Canar siguen siendo nombres distintos.
function claveDeBusqueda(texto: string): string {
  return normalizarTexto(texto).replace(/ñ/g, 'n');
}

// Filtra por palabras sueltas, sin importar tildes ni mayúsculas:
// "perez juan" encuentra "Juan Pérez". `textoDe` indica en qué campos buscar.
export function filtrarPorBusqueda<T>(
  items: T[],
  busqueda: string,
  textoDe: (item: T) => string
): T[] {
  const palabras = claveDeBusqueda(busqueda).split(' ').filter(Boolean);
  if (palabras.length === 0) return items;
  return items.filter((item) => {
    const clave = claveDeBusqueda(textoDe(item));
    return palabras.every((palabra) => clave.includes(palabra));
  });
}

// Orden alfabético en español, sin depender de Intl: ignora tildes y mayúsculas,
// y la ñ va después de la n (Cañar antes que Carchi).
function claveDeOrden(texto: string): string {
  return normalizarTexto(texto).replace(/ñ/g, 'n\uffff');
}

export function ordenarPorTexto<T>(items: T[], textoDe: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const x = claveDeOrden(textoDe(a));
    const y = claveDeOrden(textoDe(b));
    return x < y ? -1 : x > y ? 1 : 0;
  });
}