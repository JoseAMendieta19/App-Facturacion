import * as IvaModel from '../models/IvaModel';
import { filtrarPorBusqueda } from '../utils/busqueda';
import { redondear2 } from '../utils/formato';
import {
  type Errores,
  hayErrores,
  juntarErrores,
  limpiarEspacios,
  normalizarTexto,
  validarNumero,
  validarTexto,
} from '../utils/validaciones';
import {
  columnaUnicaViolada,
  esErrorCheck,
  esErrorClaveForanea,
  mensajeNoSePuedeEliminar,
  type ResultadoEliminar,
  type ResultadoGuardar,
} from './comun';

export type { Iva } from '../models/IvaModel';
type Iva = IvaModel.Iva;

export type CampoIva = 'nombre' | 'valor';
// Lo que escribe el usuario: el porcentaje llega como texto y aquí se valida y convierte.
export type DatosIva = { nombre: string; valor: string };

const MSG_NOMBRE_REPETIDO = 'Ya existe un IVA con ese nombre';
const MSG_VALOR_REPETIDO = 'Ya existe un IVA con ese porcentaje';
const MSG_VALOR_RANGO = 'El porcentaje debe estar entre 0 y 100';

/* ---------- Lectura ---------- */

// De menor a mayor porcentaje: 0%, 8%, 15%.
export function listar(): Iva[] {
  return [...IvaModel.listar()].sort((a, b) => a.iva_valor - b.iva_valor);
}

export function obtener(id: number): Iva | null {
  return IvaModel.buscarPorId(id);
}

export function filtrar(ivas: Iva[], busqueda: string): Iva[] {
  return filtrarPorBusqueda(ivas, busqueda, (i) => `${i.iva_nombre} ${i.iva_valor}`);
}

/* ---------- Guardar (crear o editar) ---------- */

// id = null: crear. id = número: editar (los duplicados excluyen a ese registro).
function validar(datos: DatosIva, id: number | null): Errores<CampoIva> {
  const nombre = limpiarEspacios(datos.nombre);
  const valorTexto = datos.valor.trim();

  const errores = juntarErrores<CampoIva>({
    nombre: validarTexto(nombre, 'El nombre'),
    valor: validarNumero(valorTexto, 'El porcentaje', { min: 0, max: 100, maxDecimales: 2 }),
  });

  if (!errores.nombre) {
    // "IVA 15%", "iva 15%" y "IVA  15%" cuentan como el mismo nombre.
    const clave = normalizarTexto(nombre);
    const repetido = IvaModel.listar().some(
      (i) => i.iva_id !== id && normalizarTexto(i.iva_nombre) === clave
    );
    if (repetido) errores.nombre = MSG_NOMBRE_REPETIDO;
  }

  // "15", "15.00" y "015" son el mismo porcentaje.
  if (!errores.valor && IvaModel.existeValor(redondear2(Number(valorTexto)), id)) {
    errores.valor = MSG_VALOR_REPETIDO;
  }
  return errores;
}

export function guardar(datos: DatosIva, id: number | null = null): ResultadoGuardar<CampoIva> {
  const errores = validar(datos, id);
  if (hayErrores(errores)) return { ok: false, errores };

  const nombre = limpiarEspacios(datos.nombre);
  const valor = redondear2(Number(datos.valor.trim()));

  try {
    if (id === null) {
      IvaModel.insertar(nombre, valor);
    } else if (IvaModel.actualizar(id, nombre, valor) === 0) {
      return { ok: false, errores: {}, mensaje: 'El IVA ya no existe.' };
    }
    return { ok: true };
  } catch (error) {
    // Segunda protección: lo que se haya colado lo rechaza SQLite (UNIQUE / CHECK).
    const columna = columnaUnicaViolada(error);
    if (columna?.includes('iva_nombre')) {
      return { ok: false, errores: { nombre: MSG_NOMBRE_REPETIDO } };
    }
    if (columna?.includes('iva_valor')) {
      return { ok: false, errores: { valor: MSG_VALOR_REPETIDO } };
    }
    if (esErrorCheck(error)) {
      return { ok: false, errores: { valor: MSG_VALOR_RANGO } };
    }
    return { ok: false, errores: {}, mensaje: 'No se pudo guardar el IVA. Intente de nuevo.' };
  }
}

/* ---------- Eliminar ---------- */

export function eliminar(id: number): ResultadoEliminar {
  if (IvaModel.buscarPorId(id) === null) {
    return { ok: false, mensaje: 'El IVA ya no existe.' };
  }

  const r = IvaModel.contarRelacionados(id);
  const bloqueo = mensajeNoSePuedeEliminar([
    { cantidad: r.facturas, singular: 'factura', plural: 'facturas', femenino: true },
  ]);
  if (bloqueo) return { ok: false, mensaje: bloqueo };

  try {
    IvaModel.eliminar(id);
    return { ok: true };
  } catch (error) {
    if (esErrorClaveForanea(error)) {
      return { ok: false, mensaje: 'No se puede eliminar: tiene registros asociados.' };
    }
    return { ok: false, mensaje: 'No se pudo eliminar el IVA. Intente de nuevo.' };
  }
}