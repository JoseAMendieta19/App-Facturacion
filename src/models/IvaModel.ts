import { db } from '../database/conexion';

// Columnas tal cual el diagrama.
export type Iva = {
  iva_id: number;
  iva_nombre: string;
  iva_valor: number; // porcentaje: 15 significa 15%
};

export type RelacionadosIva = {
  facturas: number;
};

export function listar(): Iva[] {
  return db.getAllSync<Iva>('SELECT iva_id, iva_nombre, iva_valor FROM t_iva');
}

export function buscarPorId(id: number): Iva | null {
  return db.getFirstSync<Iva>(
    'SELECT iva_id, iva_nombre, iva_valor FROM t_iva WHERE iva_id = ?',
    [id]
  );
}

// ¿Ya hay otro IVA con ese porcentaje? `excluirId` es el registro que se está editando.
export function existeValor(valor: number, excluirId: number | null): boolean {
  const fila = db.getFirstSync<{ existe: number }>(
    'SELECT 1 AS existe FROM t_iva WHERE iva_valor = ? AND iva_id <> ? LIMIT 1',
    [valor, excluirId ?? -1]
  );
  return fila !== null;
}

export function insertar(nombre: string, valor: number): number {
  const resultado = db.runSync('INSERT INTO t_iva (iva_nombre, iva_valor) VALUES (?, ?)', [
    nombre,
    valor,
  ]);
  return resultado.lastInsertRowId;
}

// Devuelve cuántos registros cambió (0 = el registro ya no existe).
export function actualizar(id: number, nombre: string, valor: number): number {
  const resultado = db.runSync(
    'UPDATE t_iva SET iva_nombre = ?, iva_valor = ? WHERE iva_id = ?',
    [nombre, valor, id]
  );
  return resultado.changes;
}

export function eliminar(id: number): number {
  return db.runSync('DELETE FROM t_iva WHERE iva_id = ?', [id]).changes;
}

// Cuántas facturas usan este IVA (impiden eliminarlo).
export function contarRelacionados(id: number): RelacionadosIva {
  const fila = db.getFirstSync<RelacionadosIva>(
    'SELECT COUNT(*) AS facturas FROM t_factura WHERE iva_id = ?',
    [id]
  );
  return fila ?? { facturas: 0 };
}