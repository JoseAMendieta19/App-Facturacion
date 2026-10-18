import { Ionicons } from '@expo/vector-icons';
import { Flotante } from '../styles/componentes';
import { tema } from '../styles/tema';

type Props = { onPress: () => void; etiqueta?: string };

// Va dentro de un contenedor con flex: 1 (por ejemplo <Pantalla>), se ancla abajo a la derecha.
export function BotonFlotante({ onPress, etiqueta = 'Agregar' }: Props) {
  return (
    <Flotante
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
    >
      <Ionicons name="add" size={32} color={tema.colores.textoSobrePrimario} />
    </Flotante>
  );
}