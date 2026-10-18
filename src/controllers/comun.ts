import type { Errores } from '../utils/validaciones';

// Lo que devuelven todos los controladores a las vistas.
export type ResultadoGuardar<K extends string> =
  | { ok: true }
  | { ok: false; errores: Errores<K>; mensaje?: string }; // errores = campo por campo

export type ResultadoEliminar = { ok: true } | { ok: false; mensaje: string };

/* ---------- Traducción de errores de SQLite (la "red de seguridad") ---------- */

export function textoDeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// "UNIQUE constraint failed: t_provincia.prov_codigo" -> "t_provincia.prov_codigo"
export function columnaUnicaViolada(error: unknown): string | null {
  const coincidencia = /UNIQUE constraint failed:\s*([^\n]+)/i.exec(textoDeError(error));
  return coincidencia ? coincidencia[1].trim() : null;
}

export function esErrorClaveForanea(error: unknown): boolean {
  return /FOREIGN KEY constraint failed/i.test(textoDeError(error));
}

// Se rompió una regla CHECK de la tabla (por ejemplo, un porcentaje fuera de 0 a 100).
export function esErrorCheck(error: unknown): boolean {
  return /CHECK constraint failed/i.test(textoDeError(error));
}

/* ---------- Mensaje al intentar eliminar algo que tiene registros relacionados ---------- */

export type Relacionado = {
  cantidad: number;
  singular: string; // "ciudad"
  plural: string; // "ciudades"
  femenino?: boolean; // para concordar: "asociada" / "asociado"
};

// [3 ciudades] -> "No se puede eliminar: tiene 3 ciudades asociadas."
// [3 ciudades, 1 cliente] -> "No se puede eliminar: tiene 3 ciudades y 1 cliente asociados."
// Sin registros relacionados devuelve null (se puede eliminar).
export function mensajeNoSePuedeEliminar(relacionados: Relacionado[]): string | null {
  const conRegistros = relacionados.filter((r) => r.cantidad > 0);
  if (conRegistros.length === 0) return null;

  const partes = conRegistros.map(
    (r) => `${r.cantidad} ${r.cantidad === 1 ? r.singular : r.plural}`
  );
  const lista =
    partes.length === 1
      ? partes[0]
      : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;

  let asociados = 'asociados';
  if (conRegistros.length === 1) {
    const { cantidad, femenino } = conRegistros[0];
    asociados = `asociad${femenino ? 'a' : 'o'}${cantidad === 1 ? '' : 's'}`;
  }
  return `No se puede eliminar: tiene ${lista} ${asociados}.`;
}