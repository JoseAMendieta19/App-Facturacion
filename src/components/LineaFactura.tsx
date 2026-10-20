import { Ionicons } from '@expo/vector-icons';
import type { LineaDetallada } from '../controllers/FacturaController';
import { TextoError } from '../styles/componentes';
import {
  BotonCantidad,
  ControlCantidad,
  DetalleLinea,
  EntradaCantidad,
  FilaCantidad,
  FilaLinea,
  NombreLinea,
  TarjetaLinea,
  TextosLinea,
  TotalLinea,
} from '../styles/factura';
import { tema } from '../styles/tema';
import { formatearDinero } from '../utils/formato';

type Props = {
  linea: LineaDetallada;
  cantidadTexto: string; // lo que se ve en el campo (puede estar vacío mientras se escribe)
  errorExtra?: string; // error que devolvió el controlador al intentar facturar
  onCambiarCantidad: (texto: string) => void;
  onSumar: () => void;
  onRestar: () => void;
  onQuitar: () => void;
};

// Un producto de la factura: nombre, precio, cantidad con - / + (o escrita) y total de la línea.
export function LineaFactura({
  linea,
  cantidadTexto,
  errorExtra,
  onCambiarCantidad,
  onSumar,
  onRestar,
  onQuitar,
}: Props) {
  const error = linea.error ?? errorExtra ?? null;
  const noPuedeRestar = linea.cantidad <= 1;
  const noPuedeSumar = linea.cantidad >= linea.stock;

  return (
    <TarjetaLinea $conError={Boolean(error)}>
      <FilaLinea>
        <TextosLinea>
          <NombreLinea numberOfLines={2}>{linea.nombre}</NombreLinea>
          <DetalleLinea>
            {formatearDinero(linea.precio)} c/u · Stock: {linea.stock}
          </DetalleLinea>
        </TextosLinea>
        <BotonCantidad
          $inactivo={false}
          onPress={onQuitar}
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${linea.nombre}`}
        >
          <Ionicons name="trash-outline" size={22} color={tema.colores.error} />
        </BotonCantidad>
      </FilaLinea>

      <FilaCantidad>
        <ControlCantidad>
          <BotonCantidad
            $inactivo={noPuedeRestar}
            disabled={noPuedeRestar}
            onPress={onRestar}
            accessibilityRole="button"
            accessibilityLabel="Disminuir cantidad"
          >
            <Ionicons name="remove" size={22} color={tema.colores.primario} />
          </BotonCantidad>
          <EntradaCantidad
            value={cantidadTexto}
            onChangeText={onCambiarCantidad}
            keyboardType="number-pad"
            maxLength={6}
            selectTextOnFocus
            accessibilityLabel={`Cantidad de ${linea.nombre}`}
            $conError={Boolean(error)}
          />
          <BotonCantidad
            $inactivo={noPuedeSumar}
            disabled={noPuedeSumar}
            onPress={onSumar}
            accessibilityRole="button"
            accessibilityLabel="Aumentar cantidad"
          >
            <Ionicons name="add" size={22} color={tema.colores.primario} />
          </BotonCantidad>
        </ControlCantidad>
        <TotalLinea>{formatearDinero(linea.total)}</TotalLinea>
      </FilaCantidad>

      {error ? <TextoError>{error}</TextoError> : null}
    </TarjetaLinea>
  );
}