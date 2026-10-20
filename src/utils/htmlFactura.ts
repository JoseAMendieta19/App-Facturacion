import type { DetalleCompleto } from '../controllers/FacturaController';
import { formatearDinero, formatearFecha } from './formato';

// Evita que un nombre como "Pérez & Hijos <S.A.>" rompa el HTML del PDF.
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ESTILOS = `
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; color: #1f2933; font-size: 12px; margin: 0; padding: 36px; }
  .encabezado { display: flex; justify-content: space-between; align-items: flex-start;
                border-bottom: 3px solid #1d4ed8; padding-bottom: 12px; margin-bottom: 18px; }
  .titulo { font-size: 26px; font-weight: bold; color: #1d4ed8; margin: 0; }
  .numero { font-size: 16px; font-weight: bold; text-align: right; }
  .fecha { color: #52606d; margin-top: 4px; text-align: right; }
  .datos { display: flex; gap: 16px; margin-bottom: 18px; }
  .caja { flex: 1; border: 1px solid #cbd2d9; border-radius: 6px; padding: 10px 12px; }
  .caja h3 { margin: 0 0 6px 0; font-size: 11px; color: #52606d; letter-spacing: 1px; }
  .caja p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  th { background: #1d4ed8; color: #ffffff; text-align: left; padding: 8px; font-size: 11px; }
  td { padding: 8px; border-bottom: 1px solid #e4e7eb; }
  .der { text-align: right; }
  .centro { text-align: center; }
  .totales { width: 45%; margin-left: auto; }
  .totales td { border: none; padding: 5px 8px; }
  .totales .total td { border-top: 2px solid #1f2933; font-size: 15px; font-weight: bold; padding-top: 8px; }
  .pie { margin-top: 36px; text-align: center; color: #7b8794; font-size: 10px; }
`;

// HTML de la factura para convertirlo en PDF. Todo sale de lo guardado al emitir.
export function generarHtmlFactura(detalle: DetalleCompleto): string {
  const { factura: f, lineas, resumen } = detalle;

  const filas = lineas
    .map(
      (l) => `
        <tr>
          <td>${escaparHtml(l.produc_nombre)}<br /><small>Serie: ${escaparHtml(l.produc_serie)}</small></td>
          <td class="centro">${l.det_fac_cant}</td>
          <td class="der">${formatearDinero(l.det_fac_precio_unitario)}</td>
          <td class="der">${formatearDinero(l.det_fac_total)}</td>
        </tr>`
    )
    .join('');

  const descuento = resumen.descuento > 0 ? `-${formatearDinero(resumen.descuento)}` : formatearDinero(0);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${ESTILOS}</style>
</head>
<body>
  <div class="encabezado">
    <h1 class="titulo">FACTURA</h1>
    <div>
      <div class="numero">${escaparHtml(f.fac_numero)}</div>
      <div class="fecha">Fecha: ${formatearFecha(f.fac_fecha)}</div>
    </div>
  </div>

  <div class="datos">
    <div class="caja">
      <h3>CLIENTE</h3>
      <p><strong>${escaparHtml(f.cli_nombres)}</strong></p>
      <p>Cédula: ${escaparHtml(f.cli_cedula)}</p>
      <p>Teléfono: ${escaparHtml(f.cli_telefono)}</p>
      <p>Correo: ${escaparHtml(f.cli_correo)}</p>
      <p>Dirección: ${escaparHtml(f.cli_direccion)}</p>
    </div>
    <div class="caja">
      <h3>VENDEDOR</h3>
      <p><strong>${escaparHtml(f.vend_nombre)}</strong></p>
      <p>Código: ${escaparHtml(f.vend_codigo)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th class="centro">Cant.</th>
        <th class="der">P. unitario</th>
        <th class="der">Total</th>
      </tr>
    </thead>
    <tbody>${filas}
    </tbody>
  </table>

  <table class="totales">
    <tr><td>Subtotal</td><td class="der">${formatearDinero(resumen.subtotal)}</td></tr>
    <tr><td>Descuento</td><td class="der">${descuento}</td></tr>
    <tr><td>IVA (${f.iva_valor}%)</td><td class="der">${formatearDinero(resumen.iva)}</td></tr>
    <tr class="total"><td>TOTAL</td><td class="der">${formatearDinero(resumen.total)}</td></tr>
  </table>

  <div class="pie">Gracias por su compra</div>
</body>
</html>`;
}