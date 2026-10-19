import { db } from '../database/conexion';

// Columnas tal cual el diagrama.
export type Vendedor = {
  vend_id: number;
  vend_codigo: string;
  vend_nombre: string;
  vend_correo: string;
  vend_telefono: string;
  prov_id: number;
  ciud_id: number;
};

// Para mostrar en la lista: incluye los nombres de la ciudad y la provincia.
export type VendedorConUbicacion = Vendedor & { ciud_nombre: string; prov_nombres: string };

export type RelacionadosVendedor = {
  facturas: number;
};

export type DatosVendedorDB = {
  codigo: string;
  nombre: string;
  correo: string;
  telefono: string;
  provinciaId: number;
  ciudadId: number;
};

const SELECT_CON_UBICACION = `
  SELECT v.vend_id, v.vend_codigo, v.vend_nombre, v.vend_correo, v.vend_telefono,
         v.prov_id, v.ciud_id, ci.ciud_nombre, p.prov_nombres
  FROM t_vendedor v
  INNER JOIN t_ciudad ci ON ci.ciud_id = v.ciud_id
  INNER JOIN t_provincia p ON p.prov_id = v.prov_id`;

export function listar(): VendedorConUbicacion[] {
  return db.getAllSync<VendedorConUbicacion>(SELECT_CON_UBICACION);
}

export function buscarPorId(id: number): VendedorConUbicacion | null {
  return db.getFirstSync<VendedorConUbicacion>(`${SELECT_CON_UBICACION} WHERE v.vend_id = ?`, [id]);
}

// `excluirId` es el vendedor que se está editando (no cuenta como duplicado de sí mismo).
export function existeCodigo(codigo: string, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    'SELECT 1 AS existe FROM t_vendedor WHERE vend_codigo = ? AND vend_id <> ? LIMIT 1',
    [codigo, excluirId ?? -1]
  );
  return fila !== null;
}

export function existeCorreo(correo: string, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    'SELECT 1 AS existe FROM t_vendedor WHERE LOWER(vend_correo) = ? AND vend_id <> ? LIMIT 1',
    [correo, excluirId ?? -1]
  );
  return fila !== null;
}

export function insertar(d: DatosVendedorDB): number {
  const resultado = db.runSync(
    `INSERT INTO t_vendedor
       (vend_codigo, vend_nombre, vend_correo, vend_telefono, prov_id, ciud_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [d.codigo, d.nombre, d.correo, d.telefono, d.provinciaId, d.ciudadId]
  );
  return resultado.lastInsertRowId;
}

// Devuelve cuántos registros cambió (0 = el vendedor ya no existe).
export function actualizar(id: number, d: DatosVendedorDB): number {
  const resultado = db.runSync(
    `UPDATE t_vendedor
        SET vend_codigo = ?, vend_nombre = ?, vend_correo = ?, vend_telefono = ?,
            prov_id = ?, ciud_id = ?
      WHERE vend_id = ?`,
    [d.codigo, d.nombre, d.correo, d.telefono, d.provinciaId, d.ciudadId, id]
  );
  return resultado.changes;
}

export function eliminar(id: number): number {
  return db.runSync('DELETE FROM t_vendedor WHERE vend_id = ?', [id]).changes;
}

// Cuántas facturas emitió este vendedor (impiden eliminarlo).
export function contarRelacionados(id: number): RelacionadosVendedor {
  const fila = db.getFirstSync<RelacionadosVendedor>(
    'SELECT COUNT(*) AS facturas FROM t_factura WHERE vend_id = ?',
    [id]
  );
  return fila ?? { facturas: 0 };
}