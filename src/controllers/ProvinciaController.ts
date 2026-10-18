import * as ProvinciaModel from '../models/ProvinciaModel';
import { filtrarPorBusqueda, ordenarPorTexto } from '../utils/busqueda';
import {
  type Errores,
  hayErrores,
  juntarErrores,
  limpiarEspacios,
  normalizarTexto,
  validarSoloLetras,
  validarTexto,
} from '../utils/validaciones';
import {
  columnaUnicaViolada,
  esErrorClaveForanea,
  mensajeNoSePuedeEliminar,
  type ResultadoEliminar,
  type ResultadoGuardar,
} from './comun';

export type { Provincia } from '../models/ProvinciaModel';
type Provincia = ProvinciaModel.Provincia;

export type CampoProvincia = 'codigo' | 'nombres';
export type DatosProvincia = { codigo: string; nombres: string }; // lo que escribe el usuario

/* ---------- Lectura ---------- */

export function listar(): Provincia[] {
  return ordenarPorTexto(ProvinciaModel.listar(), (p) => p.prov_nombres);
}

export function obtener(id: number): Provincia | null {
  return ProvinciaModel.buscarPorId(id);
}

export function filtrar(provincias: Provincia[], busqueda: string): Provincia[] {
  return filtrarPorBusqueda(provincias, busqueda, (p) => `${p.prov_nombres} ${p.prov_codigo}`);
}

/* ---------- Guardar (crear o editar) ---------- */

// id = null: crear. id = número: editar (la comprobación de duplicados excluye a ese registro).
function validar(datos: DatosProvincia, id: number | null): Errores<CampoProvincia> {
  const codigo = limpiarEspacios(datos.codigo);
  const nombres = limpiarEspacios(datos.nombres);

  const errores = juntarErrores<CampoProvincia>({
    codigo: validarTexto(codigo, 'El código'),
    nombres: validarSoloLetras(nombres, 'El nombre'),
  });

  if (!errores.codigo && ProvinciaModel.existeCodigo(codigo, id)) {
    errores.codigo = 'Ya existe una provincia con ese código';
  }

  if (!errores.nombres) {
    // "Manabí", "manabi" y " MANABÍ " cuentan como el mismo nombre.
    const clave = normalizarTexto(nombres);
    const repetido = ProvinciaModel.listar().some(
      (p) => p.prov_id !== id && normalizarTexto(p.prov_nombres) === clave
    );
    if (repetido) errores.nombres = 'Ya existe una provincia con ese nombre';
  }
  return errores;
}

export function guardar(
  datos: DatosProvincia,
  id: number | null = null
): ResultadoGuardar<CampoProvincia> {
  const errores = validar(datos, id);
  if (hayErrores(errores)) return { ok: false, errores };

  const codigo = limpiarEspacios(datos.codigo);
  const nombres = limpiarEspacios(datos.nombres);

  try {
    if (id === null) {
      ProvinciaModel.insertar(codigo, nombres);
    } else if (ProvinciaModel.actualizar(id, codigo, nombres) === 0) {
      return { ok: false, errores: {}, mensaje: 'La provincia ya no existe.' };
    }
    return { ok: true };
  } catch (error) {
    // Segunda protección: si algo se coló, SQLite lo rechaza con UNIQUE.
    const columna = columnaUnicaViolada(error);
    if (columna?.includes('prov_codigo')) {
      return { ok: false, errores: { codigo: 'Ya existe una provincia con ese código' } };
    }
    if (columna?.includes('prov_nombres')) {
      return { ok: false, errores: { nombres: 'Ya existe una provincia con ese nombre' } };
    }
    return { ok: false, errores: {}, mensaje: 'No se pudo guardar la provincia. Intente de nuevo.' };
  }
}

/* ---------- Eliminar ---------- */

export function eliminar(id: number): ResultadoEliminar {
  if (ProvinciaModel.buscarPorId(id) === null) {
    return { ok: false, mensaje: 'La provincia ya no existe.' };
  }

  const r = ProvinciaModel.contarRelacionados(id);
  const bloqueo = mensajeNoSePuedeEliminar([
    { cantidad: r.ciudades, singular: 'ciudad', plural: 'ciudades', femenino: true },
    { cantidad: r.clientes, singular: 'cliente', plural: 'clientes' },
    { cantidad: r.vendedores, singular: 'vendedor', plural: 'vendedores' },
    { cantidad: r.proveedores, singular: 'proveedor', plural: 'proveedores' },
  ]);
  if (bloqueo) return { ok: false, mensaje: bloqueo };

  try {
    ProvinciaModel.eliminar(id);
    return { ok: true };
  } catch (error) {
    if (esErrorClaveForanea(error)) {
      return { ok: false, mensaje: 'No se puede eliminar: tiene registros asociados.' };
    }
    return { ok: false, mensaje: 'No se pudo eliminar la provincia. Intente de nuevo.' };
  }
}