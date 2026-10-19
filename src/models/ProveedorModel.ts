import { db } from '../database/conexion';

// Columnas tal cual el diagrama.
export type Proveedor = {
  provee_id: number;
  provee_codigo: string;
  provee_nombre: string;
  provee_telefono: string;
  prov_id: number;
  ciud_id: number;
  provee_direccion: string;
};

// Para mostrar en la lista: incluye los nombres de la ciudad y la provincia.
export type ProveedorConUbicacion = Proveedor & { ciud_nombre: string; prov_nombres: string };

export type RelacionadosProveedor = {
  productos: number;
};

export type DatosProveedorDB = {
  codigo: string;
  nombre: string;
  telefono: string;
  provinciaId: number;
  ciudadId: number;
  direccion: string;
};

const SELECT_CON_UBICACION = `
  SELECT pr.provee_id, pr.provee_codigo, pr.provee_nombre, pr.provee_telefono,
         pr.prov_id, pr.ciud_id, pr.provee_direccion, ci.ciud_nombre, p.prov_nombres
  FROM t_proveedor pr
  INNER JOIN t_ciudad ci ON ci.ciud_id = pr.ciud_id
  INNER JOIN t_provincia p ON p.prov_id = pr.prov_id`;

export function listar(): ProveedorConUbicacion[] {
  return db.getAllSync<ProveedorConUbicacion>(SELECT_CON_UBICACION);
}

export function buscarPorId(id: number): ProveedorConUbicacion | null {
  return db.getFirstSync<ProveedorConUbicacion>(`${SELECT_CON_UBICACION} WHERE pr.provee_id = ?`, [
    id,
  ]);
}

// `excluirId` es el proveedor que se está editando (no cuenta como duplicado de sí mismo).
export function existeCodigo(codigo: string, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    'SELECT 1 AS existe FROM t_proveedor WHERE provee_codigo = ? AND provee_id <> ? LIMIT 1',
    [codigo, excluirId ?? -1]
  );
  return fila !== null;
}

export function insertar(d: DatosProveedorDB): number {
  const resultado = db.runSync(
    `INSERT INTO t_proveedor
       (provee_codigo, provee_nombre, provee_telefono, prov_id, ciud_id, provee_direccion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [d.codigo, d.nombre, d.telefono, d.provinciaId, d.ciudadId, d.direccion]
  );
  return resultado.lastInsertRowId;
}

// Devuelve cuántos registros cambió (0 = el proveedor ya no existe).
export function actualizar(id: number, d: DatosProveedorDB): number {
  const resultado = db.runSync(
    `UPDATE t_proveedor
        SET provee_codigo = ?, provee_nombre = ?, provee_telefono = ?,
            prov_id = ?, ciud_id = ?, provee_direccion = ?
      WHERE provee_id = ?`,
    [d.codigo, d.nombre, d.telefono, d.provinciaId, d.ciudadId, d.direccion, id]
  );
  return resultado.changes;
}

export function eliminar(id: number): number {
  return db.runSync('DELETE FROM t_proveedor WHERE provee_id = ?', [id]).changes;
}

// Cuántos productos tiene este proveedor (impiden eliminarlo).
export function contarRelacionados(id: number): RelacionadosProveedor {
  const fila = db.getFirstSync<RelacionadosProveedor>(
    'SELECT COUNT(*) AS productos FROM t_productos WHERE provee_id = ?',
    [id]
  );
  return fila ?? { productos: 0 };
}