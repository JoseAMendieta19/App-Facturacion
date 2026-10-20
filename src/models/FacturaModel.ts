import { db } from '../database/conexion';
import { formatearNumeroFactura } from '../utils/formato';

// Columnas tal cual el diagrama.
export type Factura = {
  fac_id: number;
  fac_numero: string;
  fac_fecha: string; // AAAA-MM-DD
  cli_id: number;
  vend_id: number;
  fac_subtotal: number;
  iva_id: number;
  fac_descuento: number;
  fac_total: number;
};

export type DetalleFactura = {
  det_fac_id: number;
  fac_id: number;
  produc_id: number;
  det_fac_cant: number;
  det_fac_precio_unitario: number;
  det_fac_total: number;
};
// Factura lista para mostrar en la lista: incluye nombres del cliente, vendedor e IVA.
export type FacturaListada = Factura & {
  cli_nombres: string;
  cli_cedula: string;
  vend_nombre: string;
  iva_nombre: string;
  iva_valor: number;
};

// Factura para el detalle: además, los datos de contacto del cliente y el código del vendedor.
export type FacturaCompleta = FacturaListada & {
  cli_correo: string;
  cli_telefono: string;
  cli_direccion: string;
  vend_codigo: string;
};

// Línea de la factura con el nombre y la serie del producto.
export type LineaGuardada = DetalleFactura & { produc_nombre: string; produc_serie: string };


export type CabeceraNueva = {
  fecha: string;
  clienteId: number;
  vendedorId: number;
  ivaId: number;
  subtotal: number;
  descuento: number;
  total: number;
};

export type DetalleNuevo = {
  producId: number;
  cantidad: number;
  precioUnitario: number;
  total: number;
};

export type ResultadoEmision =
  | { ok: true; id: number; numero: string }
  | { ok: false; sinStockProducId: number };

// Número que tendría la próxima factura: FAC-000001, FAC-000002...
export function siguienteNumero(): string {
  const fila = db.getFirstSync<{ siguiente: number }>(
    'SELECT COALESCE(MAX(CAST(SUBSTR(fac_numero, 5) AS INTEGER)), 0) + 1 AS siguiente FROM t_factura'
  );
  return formatearNumeroFactura(fila?.siguiente ?? 1);
}

// Todo o nada: si algo falla a mitad, se deshace TODO (factura, líneas y stock).
// Se usan BEGIN / COMMIT / ROLLBACK explícitos para no depender de cómo reaccione la librería a un error.
function enTransaccion(tarea: () => void): void {
  db.execSync('BEGIN IMMEDIATE');
  try {
    tarea();
    db.execSync('COMMIT');
  } catch (error) {
    try {
      db.execSync('ROLLBACK');
    } catch {
      // si ya no hay transacción abierta, no hay nada que deshacer
    }
    throw error;
  }
}

// Crea la factura con sus líneas y descuenta el stock, en una sola transacción.
// El descuento de stock solo se aplica si alcanza (produc_cantidad >= cantidad): si no, se cancela todo.
export function emitir(cabecera: CabeceraNueva, detalles: DetalleNuevo[]): ResultadoEmision {
  const estado: { sinStockProducId: number | null; id: number; numero: string } = {
    sinStockProducId: null,
    id: 0,
    numero: '',
  };

  try {
    enTransaccion(() => {
      estado.numero = siguienteNumero();
      estado.id = db.runSync(
        `INSERT INTO t_factura
           (fac_numero, fac_fecha, cli_id, vend_id, fac_subtotal, iva_id, fac_descuento, fac_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          estado.numero,
          cabecera.fecha,
          cabecera.clienteId,
          cabecera.vendedorId,
          cabecera.subtotal,
          cabecera.ivaId,
          cabecera.descuento,
          cabecera.total,
        ]
      ).lastInsertRowId;

      for (const d of detalles) {
        const cambios = db.runSync(
          `UPDATE t_productos
              SET produc_cantidad = produc_cantidad - ?
            WHERE produc_id = ? AND produc_cantidad >= ?`,
          [d.cantidad, d.producId, d.cantidad]
        ).changes;
        if (cambios === 0) {
          estado.sinStockProducId = d.producId;
          throw new Error('SIN_STOCK');
        }
        db.runSync(
          `INSERT INTO t_detalle_factura
             (fac_id, produc_id, det_fac_cant, det_fac_precio_unitario, det_fac_total)
           VALUES (?, ?, ?, ?, ?)`,
          [estado.id, d.producId, d.cantidad, d.precioUnitario, d.total]
        );
      }
    });
  } catch (error) {
    if (estado.sinStockProducId !== null) {
      return { ok: false, sinStockProducId: estado.sinStockProducId };
    }
    throw error; // cualquier otro fallo lo traduce el controlador
  }
  return { ok: true, id: estado.id, numero: estado.numero };
}

/* ---------- Consultas (lista y detalle) ---------- */

const COLUMNAS_LISTA = `
  f.fac_id, f.fac_numero, f.fac_fecha, f.cli_id, f.vend_id, f.fac_subtotal,
  f.iva_id, f.fac_descuento, f.fac_total,
  c.cli_nombres, c.cli_cedula, v.vend_nombre, i.iva_nombre, i.iva_valor`;

const UNIONES = `
  FROM t_factura f
  JOIN t_cliente  c ON c.cli_id  = f.cli_id
  JOIN t_vendedor v ON v.vend_id = f.vend_id
  JOIN t_iva      i ON i.iva_id  = f.iva_id`;

// Las más recientes primero.
export function listar(): FacturaListada[] {
  return db.getAllSync<FacturaListada>(
    `SELECT ${COLUMNAS_LISTA} ${UNIONES} ORDER BY f.fac_id DESC`
  );
}

export function buscarPorId(id: number): FacturaCompleta | null {
  return db.getFirstSync<FacturaCompleta>(
    `SELECT ${COLUMNAS_LISTA},
            c.cli_correo, c.cli_telefono, c.cli_direccion, v.vend_codigo
     ${UNIONES} WHERE f.fac_id = ?`,
    [id]
  );
}

// Líneas en el orden en que se agregaron.
export function listarDetalles(facturaId: number): LineaGuardada[] {
  return db.getAllSync<LineaGuardada>(
    `SELECT d.det_fac_id, d.fac_id, d.produc_id, d.det_fac_cant,
            d.det_fac_precio_unitario, d.det_fac_total, p.produc_nombre, p.produc_serie
       FROM t_detalle_factura d
       JOIN t_productos p ON p.produc_id = d.produc_id
      WHERE d.fac_id = ?
      ORDER BY d.det_fac_id`,
    [facturaId]
  );
}