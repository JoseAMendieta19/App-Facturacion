import * as CiudadModel from '../models/CiudadModel';
import * as ClienteModel from '../models/ClienteModel';
import * as ProvinciaModel from '../models/ProvinciaModel';
import { filtrarPorBusqueda, ordenarPorTexto } from '../utils/busqueda';
import {
  type Errores,
  hayErrores,
  juntarErrores,
  limpiarEspacios,
  normalizarCorreo,
  validarCedula,
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

export type { ClienteConUbicacion } from '../models/ClienteModel';
type ClienteConUbicacion = ClienteModel.ClienteConUbicacion;

export type CampoCliente =
  | 'cedula'
  | 'nombres'
  | 'correo'
  | 'telefono'
  | 'direccion'
  | 'provincia'
  | 'ciudad';

export type DatosCliente = {
  cedula: string;
  nombres: string;
  correo: string;
  telefono: string;
  direccion: string;
  provinciaId: number | null; // null = todavía no eligió
  ciudadId: number | null;
};

const MSG_CEDULA_REPETIDA = 'Ya existe un cliente con esa cédula';
const MSG_CORREO_REPETIDO = 'Ya existe un cliente con ese correo';
const MSG_PROVINCIA_INEXISTENTE = 'La provincia seleccionada ya no existe';
const MSG_CIUDAD_INEXISTENTE = 'La ciudad seleccionada ya no existe';
const MSG_CIUDAD_OTRA_PROVINCIA = 'La ciudad no pertenece a la provincia seleccionada';

/* ---------- Lectura ---------- */

export function listar(): ClienteConUbicacion[] {
  return ordenarPorTexto(ClienteModel.listar(), (c) => c.cli_nombres);
}

export function obtener(id: number): ClienteConUbicacion | null {
  return ClienteModel.buscarPorId(id);
}

// Para el selector provincia/ciudad del formulario.
export function listarProvincias() {
  return ProvinciaController.listar();
}

export function listarCiudades() {
  return CiudadController.listar();
}

export function filtrar(clientes: ClienteConUbicacion[], busqueda: string): ClienteConUbicacion[] {
  return filtrarPorBusqueda(
    clientes,
    busqueda,
    (c) =>
      `${c.cli_nombres} ${c.cli_cedula} ${c.cli_correo} ${c.cli_telefono} ${c.ciud_nombre} ${c.prov_nombres}`
  );
}

/* ---------- Guardar (crear o editar) ---------- */

// id = null: crear. id = número: editar (los duplicados excluyen a ese registro).
function validar(datos: DatosCliente, id: number | null): Errores<CampoCliente> {
  const cedula = datos.cedula.trim();
  const nombres = limpiarEspacios(datos.nombres);
  const correo = normalizarCorreo(datos.correo);
  const telefono = datos.telefono.trim();
  const direccion = limpiarEspacios(datos.direccion);
  const { provinciaId, ciudadId } = datos;

  const errores = juntarErrores<CampoCliente>({
    cedula: validarCedula(cedula),
    nombres: validarSoloLetras(nombres, 'El nombre'),
    correo: validarCorreo(correo),
    telefono: validarTelefono(telefono),
    direccion: validarTexto(direccion, 'La dirección'),
    provincia: provinciaId === null ? 'La provincia es obligatoria' : null,
    ciudad: ciudadId === null ? 'La ciudad es obligatoria' : null,
  });

  if (!errores.cedula && ClienteModel.existeCedula(cedula, id)) {
    errores.cedula = MSG_CEDULA_REPETIDA;
  }
  if (!errores.correo && ClienteModel.existeCorreo(correo, id)) {
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
  datos: DatosCliente,
  id: number | null = null
): ResultadoGuardar<CampoCliente> {
  const errores = validar(datos, id);
  const { provinciaId, ciudadId } = datos;
  if (hayErrores(errores) || provinciaId === null || ciudadId === null) {
    return { ok: false, errores };
  }

  const limpios: ClienteModel.DatosClienteDB = {
    cedula: datos.cedula.trim(),
    nombres: limpiarEspacios(datos.nombres),
    correo: normalizarCorreo(datos.correo),
    telefono: datos.telefono.trim(),
    direccion: limpiarEspacios(datos.direccion),
    provinciaId,
    ciudadId,
  };

  try {
    if (id === null) {
      ClienteModel.insertar(limpios);
    } else if (ClienteModel.actualizar(id, limpios) === 0) {
      return { ok: false, errores: {}, mensaje: 'El cliente ya no existe.' };
    }
    return { ok: true };
  } catch (error) {
    // Segunda protección: lo que se haya colado lo rechaza SQLite (UNIQUE / FOREIGN KEY).
    const columna = columnaUnicaViolada(error);
    if (columna?.includes('cli_cedula')) {
      return { ok: false, errores: { cedula: MSG_CEDULA_REPETIDA } };
    }
    if (columna?.includes('cli_correo')) {
      return { ok: false, errores: { correo: MSG_CORREO_REPETIDO } };
    }
    if (esErrorClaveForanea(error)) {
      return {
        ok: false,
        errores: {},
        mensaje: 'La provincia o la ciudad seleccionada ya no existe. Vuelva a elegirla.',
      };
    }
    return { ok: false, errores: {}, mensaje: 'No se pudo guardar el cliente. Intente de nuevo.' };
  }
}

/* ---------- Eliminar ---------- */

export function eliminar(id: number): ResultadoEliminar {
  if (ClienteModel.buscarPorId(id) === null) {
    return { ok: false, mensaje: 'El cliente ya no existe.' };
  }

  const r = ClienteModel.contarRelacionados(id);
  const bloqueo = mensajeNoSePuedeEliminar([
    { cantidad: r.facturas, singular: 'factura', plural: 'facturas', femenino: true },
  ]);
  if (bloqueo) return { ok: false, mensaje: bloqueo };

  try {
    ClienteModel.eliminar(id);
    return { ok: true };
  } catch (error) {
    if (esErrorClaveForanea(error)) {
      return { ok: false, mensaje: 'No se puede eliminar: tiene registros asociados.' };
    }
    return { ok: false, mensaje: 'No se pudo eliminar el cliente. Intente de nuevo.' };
  }
}