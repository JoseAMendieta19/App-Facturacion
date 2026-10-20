import { useLayoutEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { ContenedorFormulario } from '../components/ContenedorFormulario';
import { LineaFactura } from '../components/LineaFactura';
import { ResumenTotales } from '../components/ResumenTotales';
import { type Opcion, SelectorBuscable } from '../components/SelectorBuscable';
import * as FacturaController from '../controllers/FacturaController';
import type { CampoFactura, DatosFactura } from '../controllers/FacturaController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, TextoError, ZonaBotones } from '../styles/componentes';
import {
  CajaEncabezado,
  FechaFactura,
  NumeroFactura,
  TextoSinProductos,
  TituloSeccion,
} from '../styles/factura';
import { formatearDinero, formatearFecha } from '../utils/formato';
import { useGuardando } from '../utils/useGuardando';
import { type Errores, filtrarNumeros } from '../utils/validaciones';

// Lo que la pantalla guarda de cada línea: el producto y la cantidad tal como se está escribiendo.
type LineaEditable = { producId: number; cantidadTexto: string };

export function FacturaNueva({ navigation }: PropsPantalla<'FacturaNueva'>) {
  // Clientes, vendedores, IVAs y productos vendibles: se cargan una sola vez al abrir.
  const datos = useMemo(() => FacturaController.cargarDatosFormulario(), []);

  const [clienteId, setClienteId] = useState<number | null>(null);
  const [vendedorId, setVendedorId] = useState<number | null>(null);
  const [ivaId, setIvaId] = useState<number | null>(null);
  const [descuento, setDescuento] = useState('');
  const [lineas, setLineas] = useState<LineaEditable[]>([]);
  const [errores, setErrores] = useState<Errores<CampoFactura>>({});
  const [erroresLineas, setErroresLineas] = useState<Record<number, string>>({});
  const { guardando, ejecutar } = useGuardando();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Nueva factura' });
  }, [navigation]);

  /* ---------- Opciones de los selectores ---------- */
  const opcionesCliente = useMemo<Opcion[]>(
    () =>
      datos.clientes.map((c) => ({
        id: c.cli_id,
        texto: c.cli_nombres,
        detalle: `Cédula: ${c.cli_cedula}`,
      })),
    [datos.clientes]
  );
  const opcionesVendedor = useMemo<Opcion[]>(
    () =>
      datos.vendedores.map((v) => ({
        id: v.vend_id,
        texto: v.vend_nombre,
        detalle: `Código: ${v.vend_codigo}`,
      })),
    [datos.vendedores]
  );
  const opcionesIva = useMemo<Opcion[]>(
    () =>
      datos.ivas.map((i) => ({ id: i.iva_id, texto: i.iva_nombre, detalle: `${i.iva_valor}%` })),
    [datos.ivas]
  );
  // Los productos que ya están en la factura no se ofrecen otra vez.
  const opcionesProducto = useMemo<Opcion[]>(() => {
    const enFactura = new Set(lineas.map((l) => l.producId));
    return datos.productos
      .filter((p) => !enFactura.has(p.produc_id))
      .map((p) => ({
        id: p.produc_id,
        texto: p.produc_nombre,
        detalle: `Serie: ${p.produc_serie} · Stock: ${p.produc_cantidad} · ${formatearDinero(p.produc_precio)}`,
      }));
  }, [datos.productos, lineas]);

  /* ---------- Cálculo en vivo ---------- */
  const detalladas = useMemo(
    () =>
      FacturaController.detallarLineas(
        lineas.map((l) => ({ producId: l.producId, cantidad: Number(l.cantidadTexto) })),
        datos.productos
      ),
    [lineas, datos.productos]
  );
  const iva = datos.ivas.find((i) => i.iva_id === ivaId) ?? null;
  const resumen = useMemo(
    () => FacturaController.resumir(detalladas, descuento, iva?.iva_valor ?? null),
    [detalladas, descuento, iva]
  );

  /* ---------- Cambios en el carrito ---------- */
  function limpiarError(campo: CampoFactura) {
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function limpiarErrorLinea(producId: number) {
    setErroresLineas((anteriores) => {
      const nuevos = { ...anteriores };
      delete nuevos[producId];
      return nuevos;
    });
  }

  function agregarProducto(producId: number) {
    setLineas((anteriores) =>
      anteriores.some((l) => l.producId === producId)
        ? anteriores
        : [...anteriores, { producId, cantidadTexto: '1' }]
    );
    limpiarError('productos');
  }

  function cambiarCantidad(producId: number, texto: string) {
    setLineas((anteriores) =>
      anteriores.map((l) =>
        l.producId === producId ? { ...l, cantidadTexto: filtrarNumeros(texto, 6) } : l
      )
    );
    limpiarErrorLinea(producId);
  }

  function sumar(producId: number, stock: number) {
    setLineas((anteriores) =>
      anteriores.map((l) =>
        l.producId === producId
          ? { ...l, cantidadTexto: String(Math.min((Number(l.cantidadTexto) || 0) + 1, stock)) }
          : l
      )
    );
    limpiarErrorLinea(producId);
  }

  function restar(producId: number) {
    setLineas((anteriores) =>
      anteriores.map((l) =>
        l.producId === producId
          ? { ...l, cantidadTexto: String(Math.max((Number(l.cantidadTexto) || 0) - 1, 1)) }
          : l
      )
    );
    limpiarErrorLinea(producId);
  }

  function quitar(producId: number) {
    setLineas((anteriores) => anteriores.filter((l) => l.producId !== producId));
    limpiarErrorLinea(producId);
  }

  /* ---------- Facturar ---------- */
  function armarDatos(): DatosFactura {
    return {
      clienteId,
      vendedorId,
      ivaId,
      descuento,
      lineas: lineas.map((l) => ({ producId: l.producId, cantidad: Number(l.cantidadTexto) })),
    };
  }

  function emitir() {
    return ejecutar(() => {
      const resultado = FacturaController.crear(armarDatos());
      if (!resultado.ok) {
        setErrores(resultado.errores);
        setErroresLineas(resultado.erroresLineas);
        Alert.alert(
          'No se pudo emitir',
          resultado.mensaje ?? 'Revise los datos marcados en rojo. No se guardó nada.'
        );
        return;
      }
      Alert.alert(
        'Factura emitida',
        `${resultado.numero} por ${formatearDinero(resultado.total)} se guardó correctamente.`,
                [{ text: 'Ver factura', onPress: () => navigation.replace('FacturaDetalle', { id: resultado.id }) }],
        { cancelable: false }
      );
    });
  }

  function facturar() {
    const validacion = FacturaController.validar(armarDatos());
    if (FacturaController.hayErroresFactura(validacion)) {
      setErrores(validacion.errores);
      setErroresLineas(validacion.erroresLineas);
      Alert.alert('Revise la factura', 'Hay datos por corregir. Revise los campos marcados en rojo.');
      return;
    }
    Alert.alert(
      'Emitir factura',
      `¿Desea emitir la factura ${datos.numero} por ${formatearDinero(resumen.total)}? Una vez emitida no se puede modificar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Facturar', onPress: emitir },
      ]
    );
  }

  const mensajeSinProductos =
    datos.productos.length === 0
      ? 'No hay productos disponibles (con stock y sin vencer). Registre productos primero.'
      : 'Ya agregó todos los productos disponibles';

  return (
    <Pantalla>
      <ContenedorFormulario>
        <CajaEncabezado>
          <NumeroFactura>{datos.numero}</NumeroFactura>
          <FechaFactura>Fecha: {formatearFecha(datos.fecha)}</FechaFactura>
        </CajaEncabezado>

        <SelectorBuscable
          etiqueta="Cliente"
          obligatorio
          opciones={opcionesCliente}
          valorId={clienteId}
          onSeleccionar={(id) => {
            setClienteId(id);
            limpiarError('cliente');
          }}
          placeholder="Buscar por nombre o cédula"
          mensajeVacio="No hay clientes registrados. Cree uno primero."
          error={errores.cliente}
        />
        <SelectorBuscable
          etiqueta="Vendedor"
          obligatorio
          opciones={opcionesVendedor}
          valorId={vendedorId}
          onSeleccionar={(id) => {
            setVendedorId(id);
            limpiarError('vendedor');
          }}
          placeholder="Seleccione un vendedor"
          mensajeVacio="No hay vendedores registrados. Cree uno primero."
          error={errores.vendedor}
        />
        <SelectorBuscable
          etiqueta="IVA"
          obligatorio
          opciones={opcionesIva}
          valorId={ivaId}
          onSeleccionar={(id) => {
            setIvaId(id);
            limpiarError('iva');
          }}
          placeholder="Seleccione el IVA de la factura"
          mensajeVacio="No hay tarifas de IVA registradas. Cree una primero."
          error={errores.iva}
        />

        <TituloSeccion>Productos</TituloSeccion>
        <SelectorBuscable
          etiqueta="Agregar producto"
          opciones={opcionesProducto}
          valorId={null}
          onSeleccionar={agregarProducto}
          placeholder="Toque para buscar y agregar un producto"
          mensajeVacio={mensajeSinProductos}
        />
        {lineas.length === 0 ? (
          <TextoSinProductos>Todavía no agregó productos a la factura.</TextoSinProductos>
        ) : (
          detalladas.map((linea) => {
            const editable = lineas.find((l) => l.producId === linea.producId);
            return (
              <LineaFactura
                key={linea.producId}
                linea={linea}
                cantidadTexto={editable?.cantidadTexto ?? ''}
                errorExtra={erroresLineas[linea.producId]}
                onCambiarCantidad={(texto) => cambiarCantidad(linea.producId, texto)}
                onSumar={() => sumar(linea.producId, linea.stock)}
                onRestar={() => restar(linea.producId)}
                onQuitar={() => quitar(linea.producId)}
              />
            );
          })
        )}
        {errores.productos ? <TextoError>{errores.productos}</TextoError> : null}

        <CampoTexto
          etiqueta="Descuento ($)"
          tipo="decimal"
          maxEnteros={6}
          maxDecimales={2}
          placeholder="0.00"
          valor={descuento}
          onCambiar={(texto) => {
            setDescuento(texto);
            limpiarError('descuento');
          }}
          error={errores.descuento ?? resumen.errorDescuento ?? undefined}
        />

        <ResumenTotales
          subtotal={resumen.subtotal}
          descuento={resumen.descuento}
          iva={resumen.iva}
          ivaPorcentaje={iva?.iva_valor ?? null}
          total={resumen.total}
        />

        <ZonaBotones>
          <Boton
            titulo={guardando ? 'Facturando...' : 'Facturar'}
            onPress={facturar}
            cargando={guardando}
          />
          <Boton
            titulo="Cancelar"
            variante="secundario"
            onPress={() => navigation.goBack()}
            deshabilitado={guardando}
          />
        </ZonaBotones>
      </ContenedorFormulario>
    </Pantalla>
  );
}