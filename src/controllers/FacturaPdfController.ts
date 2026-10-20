import * as PdfFactura from '../services/PdfFactura';
import { generarHtmlFactura } from '../utils/htmlFactura';
import { obtenerDetalle } from './FacturaController';

export type ResultadoPdf = { ok: true } | { ok: false; mensaje: string };

// Cerrar la vista previa o el menú sin elegir nada no es un error.
function fueCancelado(error: unknown): boolean {
  return /cancel|did not complete/i.test(error instanceof Error ? error.message : String(error));
}

function fallo(error: unknown): ResultadoPdf {
  if (fueCancelado(error)) return { ok: true };
  const detalle = error instanceof Error ? error.message : String(error);
  return { ok: false, mensaje: `No se pudo generar el PDF. Intente de nuevo.\n\n(${detalle})` };
}

// Abre la vista previa del PDF de una factura guardada.
export async function ver(facturaId: number): Promise<ResultadoPdf> {
  const detalle = obtenerDetalle(facturaId);
  if (detalle === null) return { ok: false, mensaje: 'La factura ya no existe.' };
  try {
    await PdfFactura.abrirVistaPrevia(generarHtmlFactura(detalle));
    return { ok: true };
  } catch (error) {
    return fallo(error);
  }
}

// Genera el archivo PDF de una factura guardada y abre el menú de compartir.
// Está separado de FacturaController porque usa funciones del teléfono (expo-print, expo-sharing).
export async function compartir(facturaId: number): Promise<ResultadoPdf> {
  const detalle = obtenerDetalle(facturaId);
  if (detalle === null) return { ok: false, mensaje: 'La factura ya no existe.' };
  try {
    if (!(await PdfFactura.compartirDisponible())) {
      return { ok: false, mensaje: 'Este dispositivo no permite compartir archivos.' };
    }
    const numero = detalle.factura.fac_numero;
    const uri = await PdfFactura.crearPdf(generarHtmlFactura(detalle), numero);
    await PdfFactura.compartirPdf(uri, `Factura ${numero}`);
    return { ok: true };
  } catch (error) {
    return fallo(error);
  }
}