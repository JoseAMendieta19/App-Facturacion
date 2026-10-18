import { ActivityIndicator } from 'react-native';
import { BotonBase, TextoBoton, type VarianteBoton } from '../styles/componentes';
import { tema } from '../styles/tema';

type Props = {
  titulo: string;
  onPress: () => void;
  cargando?: boolean; // mientras guarda: se desactiva y muestra el indicador
  deshabilitado?: boolean;
  variante?: VarianteBoton;
};

export function Boton({
  titulo,
  onPress,
  cargando = false,
  deshabilitado = false,
  variante = 'primario',
}: Props) {
  const inactivo = cargando || deshabilitado;
  const colorIndicador =
    variante === 'secundario' ? tema.colores.primario : tema.colores.textoSobrePrimario;

  return (
    <BotonBase
      onPress={onPress}
      disabled={inactivo}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      $variante={variante}
      $inactivo={inactivo}
    >
      {cargando ? <ActivityIndicator color={colorIndicador} style={{ marginRight: 8 }} /> : null}
      <TextoBoton $variante={variante}>{titulo}</TextoBoton>
    </BotonBase>
  );
}