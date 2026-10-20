import { esFechaValida, fechaLocalISO } from './formato';

// Las fechas de la app son texto AAAA-MM-DD. El selector de fecha trabaja con objetos Date.
// Estas dos funciones convierten entre ambos sin usar UTC (para no correrse un día).

// "2026-10-19" -> Date de ese día (a las 12:00 locales, lejos de cualquier cambio de hora).
export function fechaDesdeISO(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia, 12, 0, 0);
}

// Fecha con la que se abre el selector: la ya elegida, o hoy si está vacío o es inválida.
// Se ajusta al rango permitido para que el selector no abra en una fecha que no se puede elegir.
export function fechaInicial(valor: string, minima?: string, maxima?: string): Date {
  let iso = esFechaValida(valor) ? valor : fechaLocalISO();
  if (minima && iso < minima) iso = minima;
  if (maxima && iso > maxima) iso = maxima;
  return fechaDesdeISO(iso);
}