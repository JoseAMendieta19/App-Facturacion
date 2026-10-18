import { Ionicons } from '@expo/vector-icons';
import { ContenedorVacio, TextoVacio } from '../styles/componentes';
import { tema } from '../styles/tema';

type Props = {
  mensaje: string;
  icono?: keyof typeof Ionicons.glyphMap;
};

// Se muestra cuando una lista no tiene registros o la búsqueda no encuentra nada.
export function EstadoVacio({ mensaje, icono = 'file-tray-outline' }: Props) {
  return (
    <ContenedorVacio>
      <Ionicons name={icono} size={56} color={tema.colores.deshabilitado} />
      <TextoVacio>{mensaje}</TextoVacio>
    </ContenedorVacio>
  );
}