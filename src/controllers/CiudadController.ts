import * as CiudadModel from '../models/CiudadModel';
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
import * as ProvinciaController from './ProvinciaController';

export type { CiudadConProvincia } from '../models/CiudadModel';
export type { Provincia } from './ProvinciaController';
type CiudadConProvincia = CiudadModel.CiudadConProvincia;

export type CampoCiudad = 'codigo' | 'nombre' | 'provincia';
export type DatosCiudad = {
  codigo: string;
  nombre: string;
  provinciaId: number | null; // null = todavía no eligió provincia
};

const MSG_CODIGO_REPETIDO = 'Ya existe una ciudad con ese código';
const MSG_NOMBRE_REPETIDO = 'Ya existe una ciudad con ese nombre en esa provincia';
const MSG_PROVINCIA_INEXISTENTE = 'La provincia seleccionada ya no existe';

/* ---------- Lectura ---------- */

export function listar(): CiudadConProvincia[] {
  return ordenarPorTexto(CiudadModel.listar(), (c) => c.ciud_nombre);
}

export function obtener(id: number): CiudadConProvincia | null {
  return CiudadModel.buscarPorId(id);
}

// Para el selector de provincia del formulario.
export function listarProvincias() {
  return ProvinciaController.listar();
}

export function filtrar(ciudades: CiudadConProvincia[], busqueda: string): CiudadConProvincia[] {
  return filtrarPorBusqueda(
    ciudades,
    busqueda,
    (c) => `${c.ciud_nombre} ${c.ciu_codigo} ${c.prov_nombres}`
  );
}

/* ---------- Guardar (crear o editar) ---------- */

// id = null: crear. id = número: editar (los duplicados excluyen a ese registro).
// El nombre solo puede repetirse en provincias distintas: "Chone" en Manabí y "Chone" en Guayas sí.
function validar(datos: DatosCiudad, id: number | null): Errores<CampoCiudad> {
  const codigo = limpiarEspacios(datos.codigo);
  const nombre = limpiarEspacios(datos.nombre);
  const provinciaId = datos.provinciaId;

  const errores = juntarErrores<CampoCiudad>({
    codigo: validarTexto(codigo, 'El código'),
    nombre: validarSoloLetras(nombre, 'El nombre'),
    provincia: provinciaId === null ? 'La provincia es obligatoria' : null,
  });

  if (provinciaId !== null && ProvinciaModel.buscarPorId(provinciaId) === null) {
    errores.provincia = MSG_PROVINCIA_INEXISTENTE;
  }

  if (!errores.codigo && CiudadModel.existeCodigo(codigo, id)) {
    errores.codigo = MSG_CODIGO_REPETIDO;
  }

  if (!errores.nombre && !errores.provincia && provinciaId !== null) {
    const clave = normalizarTexto(nombre);
    const repetido = CiudadModel.listarPorProvincia(provinciaId).some(
      (c) => c.ciud_id !== id && normalizarTexto(c.ciud_nombre) === clave
    );
    if (repetido) errores.nombre = MSG_NOMBRE_REPETIDO;
  }
  return errores;
}

export function guardar(
  datos: DatosCiudad,
  id: number | null = null
): ResultadoGuardar<CampoCiudad> {
  const errores = validar(datos, id);
  const provinciaId = datos.provinciaId;
  if (hayErrores(errores) || provinciaId === null) return { ok: false, errores };

  const codigo = limpiarEspacios(datos.codigo);
  const nombre = limpiarEspacios(datos.nombre);

  try {
    if (id === null) {
      CiudadModel.insertar(codigo, nombre, provinciaId);
    } else if (CiudadModel.actualizar(id, codigo, nombre, provinciaId) === 0) {
      return { ok: false, errores: {}, mensaje: 'La ciudad ya no existe.' };
    }
    return { ok: true };
  } catch (error) {
    // Segunda protección: lo que se haya colado lo rechaza SQLite (UNIQUE / FOREIGN KEY).
    const columna = columnaUnicaViolada(error);
    if (columna?.includes('ciu_codigo')) {
      return { ok: false, errores: { codigo: MSG_CODIGO_REPETIDO } };
    }
    if (columna?.includes('ciud_nombre')) {
      return { ok: false, errores: { nombre: MSG_NOMBRE_REPETIDO } };
    }
    if (esErrorClaveForanea(error)) {
      return { ok: false, errores: { provincia: MSG_PROVINCIA_INEXISTENTE } };
    }
    return { ok: false, errores: {}, mensaje: 'No se pudo guardar la ciudad. Intente de nuevo.' };
  }
}

/* ---------- Eliminar ---------- */

export function eliminar(id: number): ResultadoEliminar {
  if (CiudadModel.buscarPorId(id) === null) {
    return { ok: false, mensaje: 'La ciudad ya no existe.' };
  }

  const r = CiudadModel.contarRelacionados(id);
  const bloqueo = mensajeNoSePuedeEliminar([
    { cantidad: r.clientes, singular: 'cliente', plural: 'clientes' },
    { cantidad: r.vendedores, singular: 'vendedor', plural: 'vendedores' },
    { cantidad: r.proveedores, singular: 'proveedor', plural: 'proveedores' },
  ]);
  if (bloqueo) return { ok: false, mensaje: bloqueo };

  try {
    CiudadModel.eliminar(id);
    return { ok: true };
  } catch (error) {
    if (esErrorClaveForanea(error)) {
      return { ok: false, mensaje: 'No se puede eliminar: tiene registros asociados.' };
    }
    return { ok: false, mensaje: 'No se pudo eliminar la ciudad. Intente de nuevo.' };
  }
}