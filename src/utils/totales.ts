import { redondear2 } from './formato';

// Cálculo de la factura. Un solo lugar para que pantalla, base de datos y PDF den el mismo total.
//
// Fórmula (el descuento se resta primero y el IVA se calcula sobre lo que queda):
//   base  = subtotal - descuento
//   iva   = base * porcentaje / 100
//   total = base + iva
// Ejemplo: subtotal 100, descuento 10, IVA 15%  ->  base 90, IVA 13.50, total 103.50

export type Totales = {
  subtotal: number;
  descuento: number;
  base: number; // subtotal - descuento: es lo que paga el cliente antes del IVA
  iva: number; // monto del IVA en dinero
  total: number;
};

// Total de una línea: precio unitario x cantidad, redondeado a 2 decimales.
export function totalLinea(precioUnitario: number, cantidad: number): number {
  return redondear2(precioUnitario * cantidad);
}

// Suma de los totales de las líneas (cada una ya redondeada).
export function sumarLineas(totales: number[]): number {
  return redondear2(totales.reduce((acumulado, total) => acumulado + total, 0));
}

export function calcularTotales(
  subtotal: number,
  descuento: number,
  ivaPorcentaje: number
): Totales {
  const sub = redondear2(subtotal);
  const desc = redondear2(descuento);
  const base = redondear2(sub - desc);
  const iva = redondear2((base * ivaPorcentaje) / 100);
  return { subtotal: sub, descuento: desc, base, iva, total: redondear2(base + iva) };
}