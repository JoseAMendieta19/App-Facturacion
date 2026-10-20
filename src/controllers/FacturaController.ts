import * as ClienteModel from '../models/ClienteModel';
import * as FacturaModel from '../models/FacturaModel';
import * as IvaModel from '../models/IvaModel';
import * as ProductoModel from '../models/ProductoModel';
import * as VendedorModel from '../models/VendedorModel';
import { filtrarPorBusqueda } from '../utils/busqueda';
import {
  esFechaValida,
  fechaLocalISO,
  formatearDinero,
  formatearFecha,
  redondear2,
} from '../utils/formato';
import { calcularTotales, sumarLineas, totalLinea } from '../utils/totales';
import { type Errores, hayErrores, validarNumero } from '../utils/validaciones';
import { columnaUnicaViolada, esErrorCheck, esErrorClaveForanea } from './comun';
import * as ClienteController from './ClienteController';
import * as IvaController from './IvaController';
import * as ProductoController from './ProductoController';
import * as VendedorController from './VendedorController';

export type { FacturaListada } from '../models/FacturaModel';
export type CampoFactura = 'cliente' | 'vendedor' | 'iva' | 'descuento' | 'productos';

// Una línea tal como la arma la pantalla: qué producto y cuántas unidades.
export type LineaEntrada = { producId: number; cantidad: number };

export type DatosFactura = {
  clienteId: number | null; // null = todavía no eligió
  vendedorId: number | null;
  ivaId: number | null;
  descuento: string; // dinero escrito por el usuario; vacío = sin descuento
  lineas: LineaEntrada[];
};

// Errores de una factura: por campo, y por línea (la clave es el id del producto).
export type ErroresFactura = {
  errores: Errores<CampoFactura>;
  erroresLineas: Record<number, string>;
};

export type ResultadoFactura =
  | { ok: true; id: number; numero: string; total: number }
  | ({ ok: false; mensaje?: string } & ErroresFactura);

// Línea lista para mostrar: datos del producto + total + error si lo hay.
export type LineaDetallada = {
  producId: number;
  nombre: string;
  serie: string;
  precio: number;
  stock: number;
  cantidad: number;
  total: number;
  error: string | null;
};

export type ResumenFactura = {
  subtotal: number;
  descuento: number;
  base: number;
  iva: number;
  total: number;
  errorDescuento: string | null;
};

// Rechazo general (no ligado a un campo): se muestra como mensaje.
function falla(mensaje: string, validacion?: ErroresFactura): ResultadoFactura {
  return { ok: false, errores: {}, erroresLineas: {}, ...validacion, mensaje };
}

/* ---------- Datos para la pantalla ---------- */

// Solo se pueden vender productos con stock y que no estén vencidos.
function productosDisponibles() {
  return ProductoController.listar().filter(
    (p) => p.produc_cantidad > 0 && !ProductoController.estaVencido(p)
  );
}

export function cargarDatosFormulario() {
  return {
    numero: FacturaModel.siguienteNumero(),
    fecha: fechaLocalISO(),
    clientes: ClienteController.listar(),
    vendedores: VendedorController.listar(),
    ivas: IvaController.listar(),
    productos: productosDisponibles(),
  };
}

/* ---------- Reglas de cada línea y del descuento ---------- */

type ProductoParaVender = { produc_cantidad: number; produc_fecha_venci: string };

// Mensaje de error de una línea, o null si se puede vender esa cantidad.
function errorDeLinea(cantidad: number, producto: ProductoParaVender): string | null {
  if (ProductoController.estaVencido(producto)) {
    return `Producto vencido el ${formatearFecha(producto.produc_fecha_venci)}`;
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return 'La cantidad debe ser un número entero de 1 o más';
  }
  if (producto.produc_cantidad === 0) return 'Sin stock disponible';
  if (cantidad > producto.produc_cantidad) {
    return `Solo hay ${producto.produc_cantidad} en stock`;
  }
  return null;
}

// Convierte el texto del descuento a dinero. Vacío = 0. No puede superar el subtotal.
function interpretarDescuento(
  texto: string,
  subtotal: number
): { valor: number; error: string | null } {
  if (texto.trim() === '') return { valor: 0, error: null };
  const error = validarNumero(texto, 'El descuento', { min: 0, maxDecimales: 2 });
  if (error) return { valor: 0, error };
  const valor = redondear2(Number(texto.trim()));
  if (valor > subtotal) {
    return {
      valor: 0,
      error: `El descuento no puede ser mayor al subtotal (${formatearDinero(subtotal)})`,
    };
  }
  return { valor, error: null };
}

// Para mostrar el carrito en pantalla (con los datos de productos ya cargados).
export function detallarLineas(
  lineas: LineaEntrada[],
  productos: ProductoModel.ProductoConProveedor[]
): LineaDetallada[] {
  const detalladas: LineaDetallada[] = [];
  for (const linea of lineas) {
    const p = productos.find((x) => x.produc_id === linea.producId);
    if (!p) continue;
    detalladas.push({
      producId: p.produc_id,
      nombre: p.produc_nombre,
      serie: p.produc_serie,
      precio: p.produc_precio,
      stock: p.produc_cantidad,
      cantidad: linea.cantidad,
      total: totalLinea(p.produc_precio, linea.cantidad),
      error: errorDeLinea(linea.cantidad, p),
    });
  }
  return detalladas;
}

// Subtotal, descuento, IVA y total en vivo mientras se arma la factura.
export function resumir(
  lineas: { total: number }[],
  descuentoTexto: string,
  ivaPorcentaje: number | null
): ResumenFactura {
  const subtotal = sumarLineas(lineas.map((l) => l.total));
  const { valor, error } = interpretarDescuento(descuentoTexto, subtotal);
  const totales = calcularTotales(subtotal, valor, ivaPorcentaje ?? 0);
  return { ...totales, errorDescuento: error };
}

/* ---------- Validar y emitir ---------- */

// Revisa todo contra los datos ACTUALES de la base (no contra lo que mostraba la pantalla).
export function validar(datos: DatosFactura): ErroresFactura {
  const errores: Errores<CampoFactura> = {};
  const erroresLineas: Record<number, string> = {};

  if (datos.clienteId === null) errores.cliente = 'El cliente es obligatorio';
  else if (ClienteModel.buscarPorId(datos.clienteId) === null) {
    errores.cliente = 'El cliente seleccionado ya no existe';
  }

  if (datos.vendedorId === null) errores.vendedor = 'El vendedor es obligatorio';
  else if (VendedorModel.buscarPorId(datos.vendedorId) === null) {
    errores.vendedor = 'El vendedor seleccionado ya no existe';
  }

  if (datos.ivaId === null) errores.iva = 'El IVA es obligatorio';
  else if (IvaModel.buscarPorId(datos.ivaId) === null) {
    errores.iva = 'El IVA seleccionado ya no existe';
  }

  if (datos.lineas.length === 0) errores.productos = 'Agregue al menos un producto';

  const totalesLineas: number[] = [];
  const vistos = new Set<number>();
  for (const linea of datos.lineas) {
    if (vistos.has(linea.producId)) {
      errores.productos = 'Hay productos repetidos en la factura';
      continue;
    }
    vistos.add(linea.producId);

    const producto = ProductoModel.buscarPorId(linea.producId);
    if (producto === null) {
      erroresLineas[linea.producId] = 'El producto ya no existe';
      continue;
    }
    const error = errorDeLinea(linea.cantidad, producto);
    if (error) erroresLineas[linea.producId] = error;
    else totalesLineas.push(totalLinea(producto.produc_precio, linea.cantidad));
  }
  if (Object.keys(erroresLineas).length > 0 && !errores.productos) {
    errores.productos = 'Corrija los productos marcados en rojo';
  }

  const subtotal = sumarLineas(totalesLineas);
  const descuento = interpretarDescuento(datos.descuento, subtotal);
  if (descuento.error) errores.descuento = descuento.error;

  return { errores, erroresLineas };
}

export function hayErroresFactura(v: ErroresFactura): boolean {
  return hayErrores(v.errores) || Object.keys(v.erroresLineas).length > 0;
}

// Emite la factura: valida, calcula con los precios de la base, guarda todo y descuenta el stock.
export function crear(datos: DatosFactura): ResultadoFactura {
  const validacion = validar(datos);
  if (hayErroresFactura(validacion)) return { ok: false, ...validacion };

  const { clienteId, vendedorId, ivaId } = datos;
  const iva = ivaId === null ? null : IvaModel.buscarPorId(ivaId);
  if (clienteId === null || vendedorId === null || iva === null) {
    return falla('Faltan datos de la factura.', validacion);
  }

  // El precio sale SIEMPRE de la base de datos, nunca de lo que mande la pantalla.
  const detalles: FacturaModel.DetalleNuevo[] = [];
  for (const linea of datos.lineas) {
    const producto = ProductoModel.buscarPorId(linea.producId);
    if (producto === null) return falla('Un producto de la factura ya no existe.', validacion);
    detalles.push({
      producId: producto.produc_id,
      cantidad: linea.cantidad,
      precioUnitario: producto.produc_precio,
      total: totalLinea(producto.produc_precio, linea.cantidad),
    });
  }

  const subtotal = sumarLineas(detalles.map((d) => d.total));
  const { valor: descuento } = interpretarDescuento(datos.descuento, subtotal);
  const totales = calcularTotales(subtotal, descuento, iva.iva_valor);

  try {
    const resultado = FacturaModel.emitir(
      {
        fecha: fechaLocalISO(),
        clienteId,
        vendedorId,
        ivaId: iva.iva_id,
        subtotal: totales.subtotal,
        descuento: totales.descuento,
        total: totales.total,
      },
      detalles
    );

    if (!resultado.ok) {
      // El stock cambió entre la validación y el guardado: no se guardó nada.
      const producId = resultado.sinStockProducId;
      const stock = ProductoModel.buscarPorId(producId)?.produc_cantidad ?? 0;
      return {
        ok: false,
        errores: { productos: 'Corrija los productos marcados en rojo' },
        erroresLineas: { [producId]: stock === 0 ? 'Sin stock disponible' : `Solo hay ${stock} en stock` },
      };
    }
    return { ok: true, id: resultado.id, numero: resultado.numero, total: totales.total };
  } catch (error) {
    if (columnaUnicaViolada(error)?.includes('fac_numero')) {
      return falla('No se pudo generar el número de factura. Intente de nuevo.');
    }
    if (esErrorClaveForanea(error)) {
      return falla('Un dato de la factura ya no existe. Revise cliente, vendedor, IVA y productos.');
    }
    if (esErrorCheck(error)) {
      return falla('Algún valor de la factura no es válido. Revise los montos.');
    }
    return falla('No se pudo emitir la factura. No se guardó nada, intente de nuevo.');
  }
}

/* ---------- Lista de facturas ---------- */

export function listar(): FacturaModel.FacturaListada[] {
  return FacturaModel.listar();
}

export type FiltroFacturas = { busqueda: string; desde: string; hasta: string };
export type CampoFiltro = 'desde' | 'hasta';

// Una fecha escrita a medias (menos de 10 caracteres) todavía no filtra ni da error.
function fechaCompleta(texto: string): boolean {
  return texto.trim().length === 10;
}

// Errores del filtro de fechas. Solo se revisan las fechas completas.
export function validarFiltro(desde: string, hasta: string): Errores<CampoFiltro> {
  const errores: Errores<CampoFiltro> = {};
  if (fechaCompleta(desde) && !esFechaValida(desde.trim())) errores.desde = 'Fecha no válida';
  if (fechaCompleta(hasta) && !esFechaValida(hasta.trim())) errores.hasta = 'Fecha no válida';
  if (
    !errores.desde &&
    !errores.hasta &&
    fechaCompleta(desde) &&
    fechaCompleta(hasta) &&
    desde.trim() > hasta.trim()
  ) {
    errores.hasta = 'Debe ser igual o posterior a Desde';
  }
  return errores;
}

// Busca por número, cliente o cédula, y por rango de fechas (ambos extremos incluidos).
// Una fecha con error no filtra: la pantalla muestra el error en rojo.
export function filtrar(
  facturas: FacturaModel.FacturaListada[],
  filtro: FiltroFacturas
): FacturaModel.FacturaListada[] {
  const errores = validarFiltro(filtro.desde, filtro.hasta);
  const rangoInvalido = Boolean(errores.hasta && !errores.desde);
  const desde = fechaCompleta(filtro.desde) && !errores.desde && !rangoInvalido ? filtro.desde.trim() : null;
  const hasta = fechaCompleta(filtro.hasta) && !errores.hasta ? filtro.hasta.trim() : null;

  const porTexto = filtrarPorBusqueda(
    facturas,
    filtro.busqueda,
    (f) => `${f.fac_numero} ${f.cli_nombres} ${f.cli_cedula}`
  );
  return porTexto.filter(
    (f) => (desde === null || f.fac_fecha >= desde) && (hasta === null || f.fac_fecha <= hasta)
  );
}

// Suma de los totales de las facturas que se están viendo.
export function totalDe(facturas: { fac_total: number }[]): number {
  return sumarLineas(facturas.map((f) => f.fac_total));
}

/* ---------- Detalle de una factura ---------- */

export type DetalleCompleto = {
  factura: FacturaModel.FacturaCompleta;
  lineas: FacturaModel.LineaGuardada[];
  resumen: { subtotal: number; descuento: number; base: number; iva: number; total: number };
};

// Todo sale de lo que se guardó al emitir. El IVA en dinero es: total - (subtotal - descuento).
export function obtenerDetalle(id: number): DetalleCompleto | null {
  const factura = FacturaModel.buscarPorId(id);
  if (factura === null) return null;
  const subtotal = redondear2(factura.fac_subtotal);
  const descuento = redondear2(factura.fac_descuento);
  const base = redondear2(subtotal - descuento);
  const total = redondear2(factura.fac_total);
  return {
    factura,
    lineas: FacturaModel.listarDetalles(id),
    resumen: { subtotal, descuento, base, iva: redondear2(total - base), total },
  };
}