import {
  CajaResumen,
  EtiquetaResumen,
  EtiquetaTotal,
  FilaResumen,
  FilaTotal,
  ValorResumen,
  ValorTotal,
} from '../styles/factura';
import { formatearDinero } from '../utils/formato';

type Props = {
  subtotal: number;
  descuento: number;
  iva: number;
  ivaPorcentaje: number | null; // null = todavía no se eligió el IVA
  total: number;
};

// Subtotal, descuento, IVA y total. Se usa al armar la factura y (después) en el detalle.
export function ResumenTotales({ subtotal, descuento, iva, ivaPorcentaje, total }: Props) {
  return (
    <CajaResumen>
      <FilaResumen>
        <EtiquetaResumen>Subtotal</EtiquetaResumen>
        <ValorResumen>{formatearDinero(subtotal)}</ValorResumen>
      </FilaResumen>
      <FilaResumen>
        <EtiquetaResumen>Descuento</EtiquetaResumen>
        <ValorResumen>{descuento > 0 ? `-${formatearDinero(descuento)}` : formatearDinero(0)}</ValorResumen>
      </FilaResumen>
      <FilaResumen>
        <EtiquetaResumen>
          {ivaPorcentaje === null ? 'IVA' : `IVA (${ivaPorcentaje}%)`}
        </EtiquetaResumen>
        <ValorResumen>{formatearDinero(iva)}</ValorResumen>
      </FilaResumen>
      <FilaTotal>
        <EtiquetaTotal>Total</EtiquetaTotal>
        <ValorTotal>{formatearDinero(total)}</ValorTotal>
      </FilaTotal>
    </CajaResumen>
  );
}