import { db } from '../database/conexion';

// Columnas tal cual el diagrama.
export type Cliente = {
  cli_id: number;
  cli_cedula: string;
  cli_nombres: string;
  cli_correo: string;
  cli_telefono: string;
  cli_direccion: string;
  ciud_id: number;
  prov_id: number;
};

// Para mostrar en la lista: incluye los nombres de la ciudad y la provincia.
export type ClienteConUbicacion = Cliente & { ciud_nombre: string; prov_nombres: string };

export type RelacionadosCliente = {
  facturas: number;
};

export type DatosClienteDB = {
  cedula: string;
  nombres: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudadId: number;
  provinciaId: number;
};

const SELECT_CON_UBICACION = `
  SELECT c.cli_id, c.cli_cedula, c.cli_nombres, c.cli_correo, c.cli_telefono, c.cli_direccion,
         c.ciud_id, c.prov_id, ci.ciud_nombre, p.prov_nombres
  FROM t_cliente c
  INNER JOIN t_ciudad ci ON ci.ciud_id = c.ciud_id
  INNER JOIN t_provincia p ON p.prov_id = c.prov_id`;

export function listar(): ClienteConUbicacion[] {
  return db.getAllSync<ClienteConUbicacion>(SELECT_CON_UBICACION);
}

export function buscarPorId(id: number): ClienteConUbicacion | null {
  return db.getFirstSync<ClienteConUbicacion>(`${SELECT_CON_UBICACION} WHERE c.cli_id = ?`, [id]);
}

// `excluirId` es el cliente que se está editando (no cuenta como duplicado de sí mismo).
export function existeCedula(cedula: string, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    'SELECT 1 AS existe FROM t_cliente WHERE cli_cedula = ? AND cli_id <> ? LIMIT 1',
    [cedula, excluirId ?? -1]
  );
  return fila !== null;
}

export function existeCorreo(correo: string, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    'SELECT 1 AS existe FROM t_cliente WHERE LOWER(cli_correo) = ? AND cli_id <> ? LIMIT 1',
    [correo, excluirId ?? -1]
  );
  return fila !== null;
}

export function insertar(d: DatosClienteDB): number {
  const resultado = db.runSync(
    `INSERT INTO t_cliente
       (cli_cedula, cli_nombres, cli_correo, cli_telefono, cli_direccion, ciud_id, prov_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [d.cedula, d.nombres, d.correo, d.telefono, d.direccion, d.ciudadId, d.provinciaId]
  );
  return resultado.lastInsertRowId;
}

// Devuelve cuántos registros cambió (0 = el cliente ya no existe).
export function actualizar(id: number, d: DatosClienteDB): number {
  const resultado = db.runSync(
    `UPDATE t_cliente
        SET cli_cedula = ?, cli_nombres = ?, cli_correo = ?, cli_telefono = ?,
            cli_direccion = ?, ciud_id = ?, prov_id = ?
      WHERE cli_id = ?`,
    [d.cedula, d.nombres, d.correo, d.telefono, d.direccion, d.ciudadId, d.provinciaId, id]
  );
  return resultado.changes;
}

export function eliminar(id: number): number {
  return db.runSync('DELETE FROM t_cliente WHERE cli_id = ?', [id]).changes;
}

// Cuántas facturas tiene este cliente (impiden eliminarlo).
export function contarRelacionados(id: number): RelacionadosCliente {
  const fila = db.getFirstSync<RelacionadosCliente>(
    'SELECT COUNT(*) AS facturas FROM t_factura WHERE cli_id = ?',
    [id]
  );
  return fila ?? { facturas: 0 };
}