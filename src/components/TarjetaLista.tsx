import { Ionicons } from '@expo/vector-icons';
import {
  BotonIcono,
  SubtituloTarjeta,
  Tarjeta,
  TextoDerecha,
  TextosTarjeta,
  TituloTarjeta,
} from '../styles/componentes';
import { tema } from '../styles/tema';

type Props = {
  titulo: string;
  subtitulo?: string;
  textoDerecha?: string; // por ejemplo el total de una factura
  onPress?: () => void;
  onEditar?: () => void; // si no se pasa, no aparece el ícono
  onEliminar?: () => void; // si no se pasa, no aparece el ícono
};

export function TarjetaLista({
  titulo,
  subtitulo,
  textoDerecha,
  onPress,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <Tarjeta onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
      <TextosTarjeta>
        <TituloTarjeta numberOfLines={1}>{titulo}</TituloTarjeta>
        {subtitulo ? <SubtituloTarjeta numberOfLines={1}>{subtitulo}</SubtituloTarjeta> : null}
      </TextosTarjeta>
      {textoDerecha ? <TextoDerecha>{textoDerecha}</TextoDerecha> : null}
      {onEditar ? (
        <BotonIcono onPress={onEditar} accessibilityLabel={`Editar ${titulo}`}>
          <Ionicons name="create-outline" size={22} color={tema.colores.primario} />
        </BotonIcono>
      ) : null}
      {onEliminar ? (
        <BotonIcono onPress={onEliminar} accessibilityLabel={`Eliminar ${titulo}`}>
          <Ionicons name="trash-outline" size={22} color={tema.colores.error} />
        </BotonIcono>
      ) : null}
    </Tarjeta>
  );
}