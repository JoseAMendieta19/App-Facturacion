// Formato de dinero y fechas. Sin Intl ni toISOString(): resultado idéntico en Android e iOS.

// ÚNICO criterio de redondeo de la app: 2 decimales, mitades hacia arriba.
// Number.EPSILON evita errores de coma flotante (1.005 -> 1.01).
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// 1234.5 -> "$1,234.50"
export function formatearDinero(valor: number): string {
  const [enteros, decimales] = redondear2(valor).toFixed(2).split('.');
  return `$${enteros.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimales}`;
}

function dosDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

// Fecha LOCAL como AAAA-MM-DD (no usa UTC: en Ecuador, después de las 19:00,
// toISOString() devolvería el día siguiente).
export function fechaLocalISO(fecha: Date = new Date()): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

// Valida formato AAAA-MM-DD y que el día exista (rechaza 2026-02-30).
export function esFechaValida(texto: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!m) return false;
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (anio < 1900 || anio > 2100) return false;
  const f = new Date(anio, mes - 1, dia);
  return f.getFullYear() === anio && f.getMonth() === mes - 1 && f.getDate() === dia;
}

// Las fechas AAAA-MM-DD se comparan bien como texto.
export function esFechaPasada(texto: string): boolean {
  return texto < fechaLocalISO();
}

// "2026-10-17" -> "17/10/2026" (solo para mostrar)
export function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

// 7 -> "FAC-000007"
export function formatearNumeroFactura(consecutivo: number): string {
  return `FAC-${String(consecutivo).padStart(6, '0')}`;
}