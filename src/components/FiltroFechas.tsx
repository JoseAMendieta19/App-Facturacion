import { ColumnaFiltro, FilaFiltros } from '../styles/factura';
import { CampoFecha } from './CampoFecha';

type Props = {
  desde: string;
  hasta: string;
  onCambiarDesde: (fecha: string) => void;
  onCambiarHasta: (fecha: string) => void;
  errorDesde?: string;
  errorHasta?: string;
};

// Dos selectores de fecha lado a lado. Cada uno se puede borrar con la X.
export function FiltroFechas({
  desde,
  hasta,
  onCambiarDesde,
  onCambiarHasta,
  errorDesde,
  errorHasta,
}: Props) {
  return (
    <FilaFiltros>
      <ColumnaFiltro>
        <CampoFecha
          etiqueta="Desde"
          valor={desde}
          onCambiar={onCambiarDesde}
          error={errorDesde}
          permitirBorrar
          placeholder="Seleccionar"
        />
      </ColumnaFiltro>
      <ColumnaFiltro>
        <CampoFecha
          etiqueta="Hasta"
          valor={hasta}
          onCambiar={onCambiarHasta}
          error={errorHasta}
          permitirBorrar
          placeholder="Seleccionar"
        />
      </ColumnaFiltro>
    </FilaFiltros>
  );
}