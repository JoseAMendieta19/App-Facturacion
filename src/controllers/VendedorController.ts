import * as CiudadModel from '../models/CiudadModel';
import * as ProvinciaModel from '../models/ProvinciaModel';
import * as VendedorModel from '../models/VendedorModel';
import { filtrarPorBusqueda, ordenarPorTexto } from '../utils/busqueda';
import {
  type Errores,
  hayErrores,
  juntarErrores,
  limpiarEspacios,
  normalizarCorreo,
  normalizarTexto,
  validarCorreo,
  validarSoloLetras,
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

export type { VendedorConUbicacion } from '../models/VendedorModel';
type VendedorConUbicacion = VendedorModel.VendedorConUbicacion;

export type CampoVendedor =
  | 'codigo'
  | 'nombre'
  | 'correo'
  | 'telefono'
  | 'provincia'
  | 'ciudad';

export type DatosVendedor = {
  codigo: string;
  nombre: string;
  correo: string;
  telefono: string;
  provinciaId: number | null; // null = todavía no eligió
  ciudadId: number | null;
};

const MSG_CODIGO_REPETIDO = 'Ya existe un vendedor con ese código';
const MSG_CORREO_REPETIDO = 'Ya existe un vendedor con ese correo';
const MSG_PROVINCIA_INEXISTENTE = 'La provincia seleccionada ya no existe';
const MSG_CIUDAD_INEXISTENTE = 'La ciudad seleccionada ya no existe';
const MSG_CIUDAD_OTRA_PROVINCIA = 'La ciudad no pertenece a la provincia seleccionada';

/* ---------- Lectura ---------- */

export function listar(): VendedorConUbicacion[] {
  return ordenarPorTexto(VendedorModel.listar(), (v) => v.vend_nombre);
}

export function obtener(id: number): VendedorConUbicacion | null {
  return VendedorModel.buscarPorId(id);
}

// Para el selector provincia/ciudad del formulario.
export function listarProvincias() {
  return ProvinciaController.listar();
}

export function listarCiudades() {
  return CiudadController.listar();
}

export function filtrar(
  vendedores: VendedorConUbicacion[],
  busqueda: string
): VendedorConUbicacion[] {
  return filtrarPorBusqueda(
    vendedores,
    busqueda,
    (v) =>
      `${v.vend_nombre} ${v.vend_codigo} ${v.vend_correo} ${v.vend_telefono} ${v.ciud_nombre} ${v.prov_nombres}`
  );
}

/* ---------- Guardar (crear o editar) ---------- */

// id = null: crear. id = número: editar (los duplicados excluyen a ese registro).
function validar(datos: DatosVendedor, id: number | null): Errores<CampoVendedor> {
  const codigo = limpiarEspacios(datos.codigo);
  const nombre = limpiarEspacios(datos.nombre);
  const correo = normalizarCorreo(datos.correo);
  const telefono = datos.telefono.trim();
  const { provinciaId, ciudadId } = datos;

  const errores = juntarErrores<CampoVendedor>({
    codigo: validarTexto(codigo, 'El código'),
    nombre: validarSoloLetras(nombre, 'El nombre'),
    correo: validarCorreo(correo),
    telefono: validarTelefono(telefono),
    provincia: provinciaId === null ? 'La provincia es obligatoria' : null,
    ciudad: ciudadId === null ? 'La ciudad es obligatoria' : null,
  });

  if (!errores.codigo) {
    // "V001" y "v001" cuentan como el mismo código.
    const clave = normalizarTexto(codigo);
    const repetido = VendedorModel.listar().some(
      (v) => v.vend_id !== id && normalizarTexto(v.vend_codigo) === clave
    );
    if (repetido || VendedorModel.existeCodigo(codigo, id)) errores.codigo = MSG_CODIGO_REPETIDO;
  }
  if (!errores.correo && VendedorModel.existeCorreo(correo, id)) {
    errores.correo = MSG_CORREO_REPETIDO;
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
  datos: DatosVendedor,
  id: number | null = null
): ResultadoGuardar<CampoVendedor> {
  const errores = validar(datos, id);
  const { provinciaId, ciudadId } = datos;
  if (hayErrores(errores) || provinciaId === null || ciudadId === null) {
    return { ok: false, errores };
  }

  const limpios: VendedorModel.DatosVendedorDB = {
    codigo: limpiarEspacios(datos.codigo),
    nombre: limpiarEspacios(datos.nombre),
    correo: normalizarCorreo(datos.correo),
    telefono: datos.telefono.trim(),
    provinciaId,
    ciudadId,
  };

  try {
    if (id === null) {
      VendedorModel.insertar(limpios);
    } else if (VendedorModel.actualizar(id, limpios) === 0) {
      return { ok: false, errores: {}, mensaje: 'El vendedor ya no existe.' };
    }
    return { ok: true };
  } catch (error) {
    // Segunda protección: lo que se haya colado lo rechaza SQLite (UNIQUE / FOREIGN KEY).
    const columna = columnaUnicaViolada(error);
    if (columna?.includes('vend_codigo')) {
      return { ok: false, errores: { codigo: MSG_CODIGO_REPETIDO } };
    }
    if (columna?.includes('vend_correo')) {
      return { ok: false, errores: { correo: MSG_CORREO_REPETIDO } };
    }
    if (esErrorClaveForanea(error)) {
      return {
        ok: false,
        errores: {},
        mensaje: 'La provincia o la ciudad seleccionada ya no existe. Vuelva a elegirla.',
      };
    }
    return { ok: false, errores: {}, mensaje: 'No se pudo guardar el vendedor. Intente de nuevo.' };
  }
}

/* ---------- Eliminar ---------- */

export function eliminar(id: number): ResultadoEliminar {
  if (VendedorModel.buscarPorId(id) === null) {
    return { ok: false, mensaje: 'El vendedor ya no existe.' };
  }

  const r = VendedorModel.contarRelacionados(id);
  const bloqueo = mensajeNoSePuedeEliminar([
    { cantidad: r.facturas, singular: 'factura', plural: 'facturas', femenino: true },
  ]);
  if (bloqueo) return { ok: false, mensaje: bloqueo };

  try {
    VendedorModel.eliminar(id);
    return { ok: true };
  } catch (error) {
    if (esErrorClaveForanea(error)) {
      return { ok: false, mensaje: 'No se puede eliminar: tiene registros asociados.' };
    }
    return { ok: false, mensaje: 'No se pudo eliminar el vendedor. Intente de nuevo.' };
  }
}