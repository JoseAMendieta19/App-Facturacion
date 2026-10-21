import { Ionicons } from '@expo/vector-icons';
import {
  Avatar,
  BotonAccion,
  SubtituloTarjeta,
  Tarjeta,
  TextoAvatar,
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
  const inicial = titulo.trim().charAt(0).toUpperCase();

  return (
    <Tarjeta onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
      <Avatar>
        <TextoAvatar>{inicial}</TextoAvatar>
      </Avatar>
      <TextosTarjeta>
        <TituloTarjeta numberOfLines={1}>{titulo}</TituloTarjeta>
        {subtitulo ? <SubtituloTarjeta numberOfLines={1}>{subtitulo}</SubtituloTarjeta> : null}
      </TextosTarjeta>
      {textoDerecha ? <TextoDerecha>{textoDerecha}</TextoDerecha> : null}
      {onEditar ? (
        <BotonAccion onPress={onEditar} accessibilityLabel={`Editar ${titulo}`}>
          <Ionicons name="create-outline" size={20} color={tema.colores.primario} />
        </BotonAccion>
      ) : null}
      {onEliminar ? (
        <BotonAccion $peligro onPress={onEliminar} accessibilityLabel={`Eliminar ${titulo}`}>
          <Ionicons name="trash-outline" size={20} color={tema.colores.error} />
        </BotonAccion>
      ) : null}
    </Tarjeta>
  );
}