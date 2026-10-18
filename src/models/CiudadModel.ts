import { db } from '../database/conexion';

// Columnas tal cual el diagrama.
export type Ciudad = {
  ciud_id: number;
  ciu_codigo: string;
  ciud_nombre: string;
  prov_id: number;
};

// Para las listas: la ciudad junto al nombre de su provincia.
export type CiudadConProvincia = Ciudad & { prov_nombres: string };

export type RelacionadosCiudad = {
  clientes: number;
  vendedores: number;
  proveedores: number;
};

const COLUMNAS = 'c.ciud_id, c.ciu_codigo, c.ciud_nombre, c.prov_id, p.prov_nombres';

export function listar(): CiudadConProvincia[] {
  return db.getAllSync<CiudadConProvincia>(
    `SELECT ${COLUMNAS}
     FROM t_ciudad c INNER JOIN t_provincia p ON p.prov_id = c.prov_id`
  );
}

export function listarPorProvincia(provinciaId: number): Ciudad[] {
  return db.getAllSync<Ciudad>(
    'SELECT ciud_id, ciu_codigo, ciud_nombre, prov_id FROM t_ciudad WHERE prov_id = ?',
    [provinciaId]
  );
}

export function buscarPorId(id: number): CiudadConProvincia | null {
  return db.getFirstSync<CiudadConProvincia>(
    `SELECT ${COLUMNAS}
     FROM t_ciudad c INNER JOIN t_provincia p ON p.prov_id = c.prov_id
     WHERE c.ciud_id = ?`,
    [id]
  );
}

// ¿Ya hay otra ciudad con ese código? `excluirId` es el registro que se está editando.
export function existeCodigo(codigo: string, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    `SELECT 1 AS existe FROM t_ciudad
     WHERE ciu_codigo = ? COLLATE NOCASE AND ciud_id <> ? LIMIT 1`,
    [codigo, excluirId ?? -1]
  );
  return fila !== null;
}

export function insertar(codigo: string, nombre: string, provinciaId: number): number {
  const resultado = db.runSync(
    'INSERT INTO t_ciudad (ciu_codigo, ciud_nombre, prov_id) VALUES (?, ?, ?)',
    [codigo, nombre, provinciaId]
  );
  return resultado.lastInsertRowId;
}

// Devuelve cuántos registros cambió (0 = el registro ya no existe).
export function actualizar(id: number, codigo: string, nombre: string, provinciaId: number): number {
  const resultado = db.runSync(
    'UPDATE t_ciudad SET ciu_codigo = ?, ciud_nombre = ?, prov_id = ? WHERE ciud_id = ?',
    [codigo, nombre, provinciaId, id]
  );
  return resultado.changes;
}

export function eliminar(id: number): number {
  return db.runSync('DELETE FROM t_ciudad WHERE ciud_id = ?', [id]).changes;
}

// Cuántos registros de otras tablas usan esta ciudad (impiden eliminarla).
export function contarRelacionados(id: number): RelacionadosCiudad {
  const fila = db.getFirstSync<RelacionadosCiudad>(
    `SELECT
       (SELECT COUNT(*) FROM t_cliente   WHERE ciud_id = ?) AS clientes,
       (SELECT COUNT(*) FROM t_vendedor  WHERE ciud_id = ?) AS vendedores,
       (SELECT COUNT(*) FROM t_proveedor WHERE ciud_id = ?) AS proveedores`,
    [id, id, id]
  );
  return fila ?? { clientes: 0, vendedores: 0, proveedores: 0 };
}