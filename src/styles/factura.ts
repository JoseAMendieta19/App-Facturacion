import styled from 'styled-components/native';
import { tema } from './tema';

// Estilos propios de la pantalla de factura (los generales están en componentes.ts).
const { colores, radio, radioGrande, espacio, fuente } = tema;

/* ---------- Encabezado (número y fecha) ---------- */
export const CajaEncabezado = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${espacio.m}px ${espacio.l}px;
  margin-bottom: ${espacio.l}px;
  border-radius: ${radioGrande}px;
  border-width: 1px;
  border-color: ${colores.vidrioBorde};
  background-color: ${colores.primarioSuave};
`;

export const NumeroFactura = styled.Text`
  font-size: ${fuente.titulo}px;
  font-weight: 700;
  color: ${colores.primario};
`;

export const FechaFactura = styled.Text`
  font-size: ${fuente.chica}px;
  color: ${colores.textoSecundario};
`;

/* ---------- Productos de la factura ---------- */
export const TituloSeccion = styled.Text`
  font-size: ${fuente.normal}px;
  font-weight: 700;
  color: ${colores.texto};
  margin-bottom: ${espacio.s}px;
  margin-left: ${espacio.xs}px;
`;

export const TextoSinProductos = styled.Text`
  padding: ${espacio.l}px;
  margin-bottom: ${espacio.l}px;
  text-align: center;
  font-size: ${fuente.chica}px;
  color: ${colores.textoSecundario};
  border-width: 1.5px;
  border-style: dashed;
  border-color: ${colores.borde};
  border-radius: ${radioGrande}px;
  background-color: ${colores.vidrio};
`;

export const TarjetaLinea = styled.View<{ $conError: boolean }>`
  padding: ${espacio.m}px;
  margin-bottom: ${espacio.s}px;
  border-radius: ${radioGrande}px;
  border-width: 1px;
  border-color: ${(p) => (p.$conError ? colores.error : colores.vidrioBorde)};
  background-color: ${colores.vidrioFuerte};
  shadow-color: ${colores.primario};
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
`;

export const FilaLinea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const TextosLinea = styled.View`
  flex: 1;
  margin-right: ${espacio.s}px;
`;

export const NombreLinea = styled.Text`
  font-size: ${fuente.normal}px;
  font-weight: 600;
  color: ${colores.texto};
`;

export const DetalleLinea = styled.Text`
  margin-top: 2px;
  font-size: ${fuente.chica}px;
  color: ${colores.textoSecundario};
`;

export const FilaCantidad = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${espacio.m}px;
`;

export const ControlCantidad = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const BotonCantidad = styled.TouchableOpacity<{ $inactivo: boolean }>`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: ${radio}px;
  background-color: ${(p) => (p.$inactivo ? colores.campoBloqueado : colores.primarioSuave)};
`;

export const EntradaCantidad = styled.TextInput<{ $conError: boolean }>`
  width: 64px;
  height: 44px;
  margin: 0 ${espacio.s}px;
  text-align: center;
  font-size: ${fuente.normal}px;
  font-weight: 600;
  color: ${colores.texto};
  border-width: 1px;
  border-radius: ${radio}px;
  border-color: ${(p) => (p.$conError ? colores.error : colores.vidrioBorde)};
  background-color: ${colores.vidrioFuerte};
`;

export const TotalLinea = styled.Text`
  font-size: ${fuente.normal}px;
  font-weight: 700;
  color: ${colores.texto};
`;

/* ---------- Resumen de totales ---------- */
export const CajaResumen = styled.View`
  padding: ${espacio.l}px;
  margin-bottom: ${espacio.l}px;
  border-radius: ${radioGrande}px;
  background-color: ${colores.vidrioFuerte};
  border-width: 1px;
  border-color: ${colores.vidrioBorde};
  shadow-color: ${colores.primario};
  shadow-opacity: 0.12;
  shadow-radius: 14px;
  shadow-offset: 0px 6px;
`;

export const FilaResumen = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: ${espacio.xs}px 0;
`;

export const EtiquetaResumen = styled.Text`
  font-size: ${fuente.normal}px;
  color: ${colores.textoSecundario};
`;

export const ValorResumen = styled.Text`
  font-size: ${fuente.normal}px;
  color: ${colores.texto};
`;

export const FilaTotal = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${espacio.s}px;
  padding-top: ${espacio.m}px;
  border-top-width: 1px;
  border-top-color: ${colores.separador};
`;

export const EtiquetaTotal = styled.Text`
  font-size: ${fuente.titulo}px;
  font-weight: 700;
  color: ${colores.texto};
`;

export const ValorTotal = styled.Text`
  font-size: ${fuente.grande}px;
  font-weight: 700;
  color: ${colores.primario};
`;

/* ---------- Lista de facturas (filtros y total) ---------- */
export const FilaFiltros = styled.View`
  flex-direction: row;
  gap: ${espacio.m}px;
  padding: 0 ${espacio.l}px;
`;

export const ColumnaFiltro = styled.View`
  flex: 1;
`;

export const BarraTotal = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0 ${espacio.l}px ${espacio.s}px ${espacio.l}px;
  padding: ${espacio.s}px ${espacio.m}px;
  border-radius: ${radio}px;
  border-width: 1px;
  border-color: ${colores.vidrioBorde};
  background-color: ${colores.primarioSuave};
`;

export const TextoCantidadFacturas = styled.Text`
  font-size: ${fuente.chica}px;
  color: ${colores.textoSecundario};
`;

export const TextoTotalFacturas = styled.Text`
  font-size: ${fuente.normal}px;
  font-weight: 700;
  color: ${colores.primario};
`;

/* ---------- Detalle de factura ---------- */
export const TarjetaDato = styled.View`
  padding: ${espacio.m}px ${espacio.l}px;
  margin-bottom: ${espacio.l}px;
  border-radius: ${radioGrande}px;
  border-width: 1px;
  border-color: ${colores.vidrioBorde};
  background-color: ${colores.vidrioFuerte};
  shadow-color: ${colores.primario};
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
`;

export const EtiquetaDato = styled.Text`
  font-size: ${fuente.chica}px;
  font-weight: 700;
  color: ${colores.textoSecundario};
  margin-bottom: ${espacio.xs}px;
`;

export const TextoDato = styled.Text`
  font-size: ${fuente.normal}px;
  color: ${colores.texto};
`;

export const FilaProducto = styled.View<{ $ultima: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${espacio.s}px 0;
  border-bottom-width: ${(p) => (p.$ultima ? 0 : 1)}px;
  border-bottom-color: ${colores.separador};
`;