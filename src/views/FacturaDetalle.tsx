import { useLayoutEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { EstadoVacio } from '../components/EstadoVacio';
import { ResumenTotales } from '../components/ResumenTotales';
import * as FacturaController from '../controllers/FacturaController';
import * as FacturaPdfController from '../controllers/FacturaPdfController';
import type { PropsPantalla } from '../navigation/tipos';
import { AreaFormulario, Pantalla, ScrollFormulario, ZonaBotones } from '../styles/componentes';
import {
  CajaEncabezado,
  DetalleLinea,
  EtiquetaDato,
  FechaFactura,
  FilaProducto,
  NombreLinea,
  NumeroFactura,
  TarjetaDato,
  TextoDato,
  TextosLinea,
  TotalLinea,
} from '../styles/factura';
import { formatearDinero, formatearFecha } from '../utils/formato';
import { useGuardando } from '../utils/useGuardando';

export function FacturaDetalle({ navigation, route }: PropsPantalla<'FacturaDetalle'>) {
  const { id } = route.params;
  const detalle = useMemo(() => FacturaController.obtenerDetalle(id), [id]);
  const { guardando, ejecutar } = useGuardando();

  useLayoutEffect(() => {
    navigation.setOptions({ title: detalle ? detalle.factura.fac_numero : 'Detalle de factura' });
  }, [navigation, detalle]);

  if (detalle === null) {
    return (
      <Pantalla>
        <EstadoVacio icono="alert-circle-outline" mensaje="Esta factura no existe." />
      </Pantalla>
    );
  }

  const { factura, lineas, resumen } = detalle;

    function ejecutarPdf(accion: (id: number) => Promise<FacturaPdfController.ResultadoPdf>) {
    return ejecutar(async () => {
      const resultado = await accion(id);
      if (!resultado.ok) Alert.alert('PDF', resultado.mensaje);
    });
  }

  return (
    <AreaFormulario>
      <ScrollFormulario>
        <CajaEncabezado>
          <NumeroFactura>{factura.fac_numero}</NumeroFactura>
          <FechaFactura>Fecha: {formatearFecha(factura.fac_fecha)}</FechaFactura>
        </CajaEncabezado>

        <TarjetaDato>
          <EtiquetaDato>CLIENTE</EtiquetaDato>
          <TextoDato>{factura.cli_nombres}</TextoDato>
          <DetalleLinea>Cédula: {factura.cli_cedula}</DetalleLinea>
          <DetalleLinea>Teléfono: {factura.cli_telefono}</DetalleLinea>
          <DetalleLinea>Dirección: {factura.cli_direccion}</DetalleLinea>
        </TarjetaDato>

        <TarjetaDato>
          <EtiquetaDato>VENDEDOR</EtiquetaDato>
          <TextoDato>{factura.vend_nombre}</TextoDato>
          <DetalleLinea>Código: {factura.vend_codigo}</DetalleLinea>
        </TarjetaDato>

        <TarjetaDato>
          <EtiquetaDato>PRODUCTOS</EtiquetaDato>
          {lineas.map((linea, indice) => (
            <FilaProducto key={linea.det_fac_id} $ultima={indice === lineas.length - 1}>
              <TextosLinea>
                <NombreLinea numberOfLines={2}>{linea.produc_nombre}</NombreLinea>
                <DetalleLinea>
                  {linea.det_fac_cant} x {formatearDinero(linea.det_fac_precio_unitario)}
                </DetalleLinea>
              </TextosLinea>
              <TotalLinea>{formatearDinero(linea.det_fac_total)}</TotalLinea>
            </FilaProducto>
          ))}
        </TarjetaDato>

        <ResumenTotales
          subtotal={resumen.subtotal}
          descuento={resumen.descuento}
          iva={resumen.iva}
          ivaPorcentaje={factura.iva_valor}
          total={resumen.total}
        />

        <ZonaBotones>
            <Boton
                titulo="Ver PDF"
                onPress={() => ejecutarPdf(FacturaPdfController.ver)}
                deshabilitado={guardando}
            />
            <Boton
                titulo={guardando ? 'Generando PDF...' : 'Compartir PDF'}
                variante="secundario"
                onPress={() => ejecutarPdf(FacturaPdfController.compartir)}
                cargando={guardando}
            />
        </ZonaBotones>

      </ScrollFormulario>
    </AreaFormulario>
  );
}