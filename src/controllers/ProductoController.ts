import * as ProductoModel from '../models/ProductoModel';
import * as ProveedorModel from '../models/ProveedorModel';
import { filtrarPorBusqueda, ordenarPorTexto } from '../utils/busqueda';
import { esFechaPasada, formatearDinero, formatearFecha, redondear2 } from '../utils/formato';
import {
  type Errores,
  hayErrores,
  juntarErrores,
  limpiarEspacios,
  normalizarTexto,
  validarFecha,
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
import * as ProveedorController from './ProveedorController';

export type { ProductoConProveedor } from '../models/ProductoModel';
type ProductoConProveedor = ProductoModel.ProductoConProveedor;

export type CampoProducto =
  | 'serie'
  | 'nombre'
  | 'cantidad'
  | 'proveedor'
  | 'fechaVenci'
  | 'precio';

// Lo que escribe el usuario: cantidad y precio llegan como texto y aquí se validan y convierten.
export type DatosProducto = {
  serie: string;
  nombre: string;
  cantidad: string;
  proveedorId: number | null; // null = todavía no eligió
  fechaVenci: string; // AAAA-MM-DD
  precio: string;
};

const MSG_SERIE_REPETIDA = 'Ya existe un producto con esa serie';
const MSG_PROVEEDOR_INEXISTENTE = 'El proveedor seleccionado ya no existe';
const MSG_CANTIDAD_RANGO = 'La cantidad debe ser un número entero mayor o igual a 0';
const MSG_PRECIO_RANGO = 'El precio debe ser mayor que 0';

/* ---------- Lectura ---------- */

export function listar(): ProductoConProveedor[] {
  return ordenarPorTexto(ProductoModel.listar(), (p) => p.produc_nombre);
}

export function obtener(id: number): ProductoConProveedor | null {
  return ProductoModel.buscarPorId(id);
}

// Para el selector de proveedor del formulario.
export function listarProveedores() {
  return ProveedorController.listar();
}

export function filtrar(
  productos: ProductoConProveedor[],
  busqueda: string
): ProductoConProveedor[] {
  return filtrarPorBusqueda(
    productos,
    busqueda,
    (p) => `${p.produc_nombre} ${p.produc_serie} ${p.provee_nombre}`
  );
}

// Un producto vence el día de su fecha; está vencido a partir del día siguiente.
export function estaVencido(producto: { produc_fecha_venci: string }): boolean {
  return esFechaPasada(producto.produc_fecha_venci);
}

// Textos listos para mostrar en la lista.
export function textoPrecio(producto: { produc_precio: number }): string {
  return formatearDinero(producto.produc_precio);
}

export function textoDetalle(producto: ProductoConProveedor): string {
  const vence = estaVencido(producto)
    ? 'VENCIDO'
    : `Vence: ${formatearFecha(producto.produc_fecha_venci)}`;
  return `Serie: ${producto.produc_serie} · Stock: ${producto.produc_cantidad} · ${vence}`;
}

/* ---------- Guardar (crear o editar) ---------- */

// id = null: crear. id = número: editar (los duplicados excluyen a ese registro).
function validar(datos: DatosProducto, id: number | null): Errores<CampoProducto> {
  const serie = limpiarEspacios(datos.serie);
  const nombre = limpiarEspacios(datos.nombre);
  const cantidad = datos.cantidad.trim();
  const precio = datos.precio.trim();
  const fecha = datos.fechaVenci.trim();
  const { proveedorId } = datos;

  // Al crear, la fecha no puede ser pasada. Al editar solo se exige si la cambiaron:
  // un producto que ya venció puede seguir guardándose con su fecha original.
  const original = id === null ? null : ProductoModel.buscarPorId(id);
  const exigirNoPasada = original === null || original.produc_fecha_venci !== fecha;

  const errores = juntarErrores<CampoProducto>({
    serie: validarTexto(serie, 'La serie'),
    nombre: validarTexto(nombre, 'El nombre'),
    cantidad: validarNumero(cantidad, 'La cantidad', { min: 0, maxDecimales: 0 }),
    proveedor: proveedorId === null ? 'El proveedor es obligatorio' : null,
    fechaVenci: validarFecha(fecha, 'La fecha de vencimiento', { noPasada: exigirNoPasada }),
    precio: validarNumero(precio, 'El precio', {
      min: 0,
      minExclusivo: true,
      max: 999999.99,
      maxDecimales: 2,
    }),
  });

  if (!errores.serie) {
    // "S-001" y "s-001" cuentan como la misma serie.
    const clave = normalizarTexto(serie);
    const repetido = ProductoModel.listar().some(
      (p) => p.produc_id !== id && normalizarTexto(p.produc_serie) === clave
    );
    if (repetido || ProductoModel.existeSerie(serie, id)) errores.serie = MSG_SERIE_REPETIDA;
  }

  if (proveedorId !== null && ProveedorModel.buscarPorId(proveedorId) === null) {
    errores.proveedor = MSG_PROVEEDOR_INEXISTENTE;
  }
  return errores;
}

export function guardar(
  datos: DatosProducto,
  id: number | null = null
): ResultadoGuardar<CampoProducto> {
  const errores = validar(datos, id);
  const { proveedorId } = datos;
  if (hayErrores(errores) || proveedorId === null) return { ok: false, errores };

  const limpios: ProductoModel.DatosProductoDB = {
    serie: limpiarEspacios(datos.serie),
    nombre: limpiarEspacios(datos.nombre),
    cantidad: Number(datos.cantidad.trim()),
    proveedorId,
    fechaVenci: datos.fechaVenci.trim(),
    precio: redondear2(Number(datos.precio.trim())),
  };

  try {
    if (id === null) {
      ProductoModel.insertar(limpios);
    } else if (ProductoModel.actualizar(id, limpios) === 0) {
      return { ok: false, errores: {}, mensaje: 'El producto ya no existe.' };
    }
    return { ok: true };
  } catch (error) {
    // Segunda protección: lo que se haya colado lo rechaza SQLite (UNIQUE / CHECK / FOREIGN KEY).
    const columna = columnaUnicaViolada(error);
    if (columna?.includes('produc_serie')) {
      return { ok: false, errores: { serie: MSG_SERIE_REPETIDA } };
    }
    if (esErrorClaveForanea(error)) {
      return { ok: false, errores: { proveedor: MSG_PROVEEDOR_INEXISTENTE } };
    }
    if (esErrorCheck(error)) {
      return {
        ok: false,
        errores: { cantidad: MSG_CANTIDAD_RANGO, precio: MSG_PRECIO_RANGO },
      };
    }
    return { ok: false, errores: {}, mensaje: 'No se pudo guardar el producto. Intente de nuevo.' };
  }
}

/* ---------- Eliminar ---------- */

export function eliminar(id: number): ResultadoEliminar {
  if (ProductoModel.buscarPorId(id) === null) {
    return { ok: false, mensaje: 'El producto ya no existe.' };
  }

  const r = ProductoModel.contarRelacionados(id);
  const bloqueo = mensajeNoSePuedeEliminar([
    { cantidad: r.facturas, singular: 'factura', plural: 'facturas', femenino: true },
  ]);
  if (bloqueo) return { ok: false, mensaje: bloqueo };

  try {
    ProductoModel.eliminar(id);
    return { ok: true };
  } catch (error) {
    if (esErrorClaveForanea(error)) {
      return { ok: false, mensaje: 'No se puede eliminar: tiene registros asociados.' };
    }
    return { ok: false, mensaje: 'No se pudo eliminar el producto. Intente de nuevo.' };
  }
}