import { Ionicons } from '@expo/vector-icons';
import { BotonIcono, CajaBuscador, EntradaBuscador } from '../styles/componentes';
import { tema } from '../styles/tema';

type Props = {
  valor: string;
  onCambiar: (texto: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function Buscador({ valor, onCambiar, placeholder = 'Buscar...', autoFocus = false }: Props) {
  return (
    <CajaBuscador>
      <Ionicons name="search" size={20} color={tema.colores.textoSecundario} />
      <EntradaBuscador
        value={valor}
        onChangeText={onCambiar}
        placeholder={placeholder}
        placeholderTextColor={tema.colores.textoSecundario}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
        maxLength={45}
        accessibilityLabel={placeholder}
      />
      {valor.length > 0 ? (
        <BotonIcono
          onPress={() => onCambiar('')}
          style={{ padding: 4 }}
          accessibilityLabel="Borrar búsqueda"
        >
          <Ionicons name="close-circle" size={20} color={tema.colores.textoSecundario} />
        </BotonIcono>
      ) : null}
    </CajaBuscador>
  );
}