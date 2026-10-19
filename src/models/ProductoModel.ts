import { db } from '../database/conexion';

// Columnas tal cual el diagrama.
export type Producto = {
  produc_id: number;
  produc_serie: string;
  produc_nombre: string;
  produc_cantidad: number;
  provee_id: number;
  produc_fecha_venci: string; // AAAA-MM-DD
  produc_precio: number;
};

// Para mostrar en la lista: incluye el nombre del proveedor.
export type ProductoConProveedor = Producto & { provee_nombre: string };

export type RelacionadosProducto = {
  facturas: number;
};

export type DatosProductoDB = {
  serie: string;
  nombre: string;
  cantidad: number;
  proveedorId: number;
  fechaVenci: string;
  precio: number;
};

const SELECT_CON_PROVEEDOR = `
  SELECT p.produc_id, p.produc_serie, p.produc_nombre, p.produc_cantidad, p.provee_id,
         p.produc_fecha_venci, p.produc_precio, pr.provee_nombre
  FROM t_productos p
  INNER JOIN t_proveedor pr ON pr.provee_id = p.provee_id`;

export function listar(): ProductoConProveedor[] {
  return db.getAllSync<ProductoConProveedor>(SELECT_CON_PROVEEDOR);
}

export function buscarPorId(id: number): ProductoConProveedor | null {
  return db.getFirstSync<ProductoConProveedor>(`${SELECT_CON_PROVEEDOR} WHERE p.produc_id = ?`, [
    id,
  ]);
}

// `excluirId` es el producto que se está editando (no cuenta como duplicado de sí mismo).
export function existeSerie(serie: string, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    'SELECT 1 AS existe FROM t_productos WHERE produc_serie = ? AND produc_id <> ? LIMIT 1',
    [serie, excluirId ?? -1]
  );
  return fila !== null;
}

export function insertar(d: DatosProductoDB): number {
  const resultado = db.runSync(
    `INSERT INTO t_productos
       (produc_serie, produc_nombre, produc_cantidad, provee_id, produc_fecha_venci, produc_precio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [d.serie, d.nombre, d.cantidad, d.proveedorId, d.fechaVenci, d.precio]
  );
  return resultado.lastInsertRowId;
}

// Devuelve cuántos registros cambió (0 = el producto ya no existe).
export function actualizar(id: number, d: DatosProductoDB): number {
  const resultado = db.runSync(
    `UPDATE t_productos
        SET produc_serie = ?, produc_nombre = ?, produc_cantidad = ?, provee_id = ?,
            produc_fecha_venci = ?, produc_precio = ?
      WHERE produc_id = ?`,
    [d.serie, d.nombre, d.cantidad, d.proveedorId, d.fechaVenci, d.precio, id]
  );
  return resultado.changes;
}

export function eliminar(id: number): number {
  return db.runSync('DELETE FROM t_productos WHERE produc_id = ?', [id]).changes;
}

// En cuántas facturas distintas se vendió este producto (impiden eliminarlo).
export function contarRelacionados(id: number): RelacionadosProducto {
  const fila = db.getFirstSync<RelacionadosProducto>(
    'SELECT COUNT(DISTINCT fac_id) AS facturas FROM t_detalle_factura WHERE produc_id = ?',
    [id]
  );
  return fila ?? { facturas: 0 };
}