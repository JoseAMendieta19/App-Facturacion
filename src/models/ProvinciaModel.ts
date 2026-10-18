import { db } from '../database/conexion';

// Columnas tal cual el diagrama.
export type Provincia = {
  prov_id: number;
  prov_codigo: string;
  prov_nombres: string;
};

export type RelacionadosProvincia = {
  ciudades: number;
  clientes: number;
  vendedores: number;
  proveedores: number;
};

export function listar(): Provincia[] {
  return db.getAllSync<Provincia>(
    'SELECT prov_id, prov_codigo, prov_nombres FROM t_provincia'
  );
}

export function buscarPorId(id: number): Provincia | null {
  return db.getFirstSync<Provincia>(
    'SELECT prov_id, prov_codigo, prov_nombres FROM t_provincia WHERE prov_id = ?',
    [id]
  );
}

// ¿Ya hay otra provincia con ese código? `excluirId` es el registro que se está editando.
export function existeCodigo(codigo: string, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    `SELECT 1 AS existe FROM t_provincia
     WHERE prov_codigo = ? COLLATE NOCASE AND prov_id <> ? LIMIT 1`,
    [codigo, excluirId ?? -1]
  );
  return fila !== null;
}

export function insertar(codigo: string, nombres: string): number {
  const resultado = db.runSync(
    'INSERT INTO t_provincia (prov_codigo, prov_nombres) VALUES (?, ?)',
    [codigo, nombres]
  );
  return resultado.lastInsertRowId;
}

// Devuelve cuántos registros cambió (0 = el registro ya no existe).
export function actualizar(id: number, codigo: string, nombres: string): number {
  const resultado = db.runSync(
    'UPDATE t_provincia SET prov_codigo = ?, prov_nombres = ? WHERE prov_id = ?',
    [codigo, nombres, id]
  );
  return resultado.changes;
}

export function eliminar(id: number): number {
  return db.runSync('DELETE FROM t_provincia WHERE prov_id = ?', [id]).changes;
}

// Cuántos registros de otras tablas usan esta provincia (impiden eliminarla).
export function contarRelacionados(id: number): RelacionadosProvincia {
  const fila = db.getFirstSync<RelacionadosProvincia>(
    `SELECT
       (SELECT COUNT(*) FROM t_ciudad    WHERE prov_id = ?) AS ciudades,
       (SELECT COUNT(*) FROM t_cliente   WHERE prov_id = ?) AS clientes,
       (SELECT COUNT(*) FROM t_vendedor  WHERE prov_id = ?) AS vendedores,
       (SELECT COUNT(*) FROM t_proveedor WHERE prov_id = ?) AS proveedores`,
    [id, id, id, id]
  );
  return fila ?? { ciudades: 0, clientes: 0, vendedores: 0, proveedores: 0 };
}