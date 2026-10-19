import * as CiudadModel from '../models/CiudadModel';
import * as ProveedorModel from '../models/ProveedorModel';
import * as ProvinciaModel from '../models/ProvinciaModel';
import { filtrarPorBusqueda, ordenarPorTexto } from '../utils/busqueda';
import {
  type Errores,
  hayErrores,
  juntarErrores,
  limpiarEspacios,
  normalizarTexto,
  validarTelefono,
  validarTexto,
} from '../utils/validaciones';
import {
  columnaUnicaViolada,
  esErrorClaveForanea,
  mensajeNoSePuedeEliminar,
  type ResultadoEliminar,
  type ResultadoGuardar,
} from './comun';
import * as CiudadController from './CiudadController';
import * as ProvinciaController from './ProvinciaController';

export type { ProveedorConUbicacion } from '../models/ProveedorModel';
type ProveedorConUbicacion = ProveedorModel.ProveedorConUbicacion;

export type CampoProveedor =
  | 'codigo'
  | 'nombre'
  | 'telefono'
  | 'direccion'
  | 'provincia'
  | 'ciudad';

export type DatosProveedor = {
  codigo: string;
  nombre: string;
  telefono: string;
  direccion: string;
  provinciaId: number | null; // null = todavía no eligió
  ciudadId: number | null;
};

const MSG_CODIGO_REPETIDO = 'Ya existe un proveedor con ese código';
const MSG_NOMBRE_REPETIDO = 'Ya existe un proveedor con ese nombre';
const MSG_PROVINCIA_INEXISTENTE = 'La provincia seleccionada ya no existe';
const MSG_CIUDAD_INEXISTENTE = 'La ciudad seleccionada ya no existe';
const MSG_CIUDAD_OTRA_PROVINCIA = 'La ciudad no pertenece a la provincia seleccionada';

/* ---------- Lectura ---------- */

export function listar(): ProveedorConUbicacion[] {
  return ordenarPorTexto(ProveedorModel.listar(), (p) => p.provee_nombre);
}

export function obtener(id: number): ProveedorConUbicacion | null {
  return ProveedorModel.buscarPorId(id);
}

// Para el selector provincia/ciudad del formulario.
export function listarProvincias() {
  return ProvinciaController.listar();
}

export function listarCiudades() {
  return CiudadController.listar();
}

export function filtrar(
  proveedores: ProveedorConUbicacion[],
  busqueda: string
): ProveedorConUbicacion[] {
  return filtrarPorBusqueda(
    proveedores,
    busqueda,
    (p) =>
      `${p.provee_nombre} ${p.provee_codigo} ${p.provee_telefono} ${p.ciud_nombre} ${p.prov_nombres}`
  );
}

/* ---------- Guardar (crear o editar) ---------- */

// id = null: crear. id = número: editar (los duplicados excluyen a ese registro).
function validar(datos: DatosProveedor, id: number | null): Errores<CampoProveedor> {
  const codigo = limpiarEspacios(datos.codigo);
  const nombre = limpiarEspacios(datos.nombre);
  const telefono = datos.telefono.trim();
  const direccion = limpiarEspacios(datos.direccion);
  const { provinciaId, ciudadId } = datos;

  const errores = juntarErrores<CampoProveedor>({
    codigo: validarTexto(codigo, 'El código'),
    nombre: validarTexto(nombre, 'El nombre'), // un proveedor puede ser una empresa: admite números
    telefono: validarTelefono(telefono),
    direccion: validarTexto(direccion, 'La dirección'),
    provincia: provinciaId === null ? 'La provincia es obligatoria' : null,
    ciudad: ciudadId === null ? 'La ciudad es obligatoria' : null,
  });

  const otros = ProveedorModel.listar().filter((p) => p.provee_id !== id);

  if (!errores.codigo) {
    // "P001" y "p001" cuentan como el mismo código.
    const clave = normalizarTexto(codigo);
    const repetido = otros.some((p) => normalizarTexto(p.provee_codigo) === clave);
    if (repetido || ProveedorModel.existeCodigo(codigo, id)) errores.codigo = MSG_CODIGO_REPETIDO;
  }
  if (!errores.nombre) {
    // "Distribuidora Andina" y "distribuidora  andina" cuentan como el mismo nombre.
    const clave = normalizarTexto(nombre);
    if (otros.some((p) => normalizarTexto(p.provee_nombre) === clave)) {
      errores.nombre = MSG_NOMBRE_REPETIDO;
    }
  }

  // La provincia y la ciudad deben existir, y la ciudad debe ser de esa provincia.
  if (provinciaId !== null && ProvinciaModel.buscarPorId(provinciaId) === null) {
    errores.provincia = MSG_PROVINCIA_INEXISTENTE;
  }
  if (ciudadId !== null) {
    const ciudad = CiudadModel.buscarPorId(ciudadId);
    if (ciudad === null) {
      errores.ciudad = MSG_CIUDAD_INEXISTENTE;
    } else if (!errores.provincia && provinciaId !== null && ciudad.prov_id !== provinciaId) {
      errores.ciudad = MSG_CIUDAD_OTRA_PROVINCIA;
    }
  }
  return errores;
}

export function guardar(
  datos: DatosProveedor,
  id: number | null = null
): ResultadoGuardar<CampoProveedor> {
  const errores = validar(datos, id);
  const { provinciaId, ciudadId } = datos;
  if (hayErrores(errores) || provinciaId === null || ciudadId === null) {
    return { ok: false, errores };
  }

  const limpios: ProveedorModel.DatosProveedorDB = {
    codigo: limpiarEspacios(datos.codigo),
    nombre: limpiarEspacios(datos.nombre),
    telefono: datos.telefono.trim(),
    direccion: limpiarEspacios(datos.direccion),
    provinciaId,
    ciudadId,
  };

  try {
    if (id === null) {
      ProveedorModel.insertar(limpios);
    } else if (ProveedorModel.actualizar(id, limpios) === 0) {
      return { ok: false, errores: {}, mensaje: 'El proveedor ya no existe.' };
    }
    return { ok: true };
  } catch (error) {
    // Segunda protección: lo que se haya colado lo rechaza SQLite (UNIQUE / FOREIGN KEY).
    const columna = columnaUnicaViolada(error);
    if (columna?.includes('provee_codigo')) {
      return { ok: false, errores: { codigo: MSG_CODIGO_REPETIDO } };
    }
    if (columna?.includes('provee_nombre')) {
      return { ok: false, errores: { nombre: MSG_NOMBRE_REPETIDO } };
    }
    if (esErrorClaveForanea(error)) {
      return {
        ok: false,
        errores: {},
        mensaje: 'La provincia o la ciudad seleccionada ya no existe. Vuelva a elegirla.',
      };
    }
    return { ok: false, errores: {}, mensaje: 'No se pudo guardar el proveedor. Intente de nuevo.' };
  }
}

/* ---------- Eliminar ---------- */

export function eliminar(id: number): ResultadoEliminar {
  if (ProveedorModel.buscarPorId(id) === null) {
    return { ok: false, mensaje: 'El proveedor ya no existe.' };
  }

  const r = ProveedorModel.contarRelacionados(id);
  const bloqueo = mensajeNoSePuedeEliminar([
    { cantidad: r.productos, singular: 'producto', plural: 'productos' },
  ]);
  if (bloqueo) return { ok: false, mensaje: bloqueo };

  try {
    ProveedorModel.eliminar(id);
    return { ok: true };
  } catch (error) {
    if (esErrorClaveForanea(error)) {
      return { ok: false, mensaje: 'No se puede eliminar: tiene registros asociados.' };
    }
    return { ok: false, mensaje: 'No se pudo eliminar el proveedor. Intente de nuevo.' };
  }
}