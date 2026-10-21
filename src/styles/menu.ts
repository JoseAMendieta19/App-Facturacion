import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { tema } from './tema';

const { colores, espacio, fuente, radioGrande } = tema;

export const ScrollMenu = styled.ScrollView.attrs({
  contentContainerStyle: { padding: espacio.l, paddingBottom: espacio.xl },
})`
  flex: 1;
`;

/* ---------- Fondo decorativo (solo visual) ---------- */

export const CapaFondo = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

type PropsMancha = {
  $tam: number;
  $top?: number;
  $bottom?: number;
  $left?: number;
  $right?: number;
  $opacidad?: number;
};

export const Mancha = styled(LinearGradient)<PropsMancha>`
  position: absolute;
  width: ${(p) => p.$tam}px;
  height: ${(p) => p.$tam}px;
  border-radius: ${(p) => p.$tam / 2}px;
  opacity: ${(p) => p.$opacidad ?? 0.85};
  ${(p) => (p.$top !== undefined ? `top: ${p.$top}px;` : '')}
  ${(p) => (p.$bottom !== undefined ? `bottom: ${p.$bottom}px;` : '')}
  ${(p) => (p.$left !== undefined ? `left: ${p.$left}px;` : '')}
  ${(p) => (p.$right !== undefined ? `right: ${p.$right}px;` : '')}
`;

// Desenfoca las manchas que quedan debajo de él.
export const Difuminado = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

/* ---------- Contenido ---------- */

export const TituloSeccion = styled.Text`
  margin: ${espacio.s}px 0 ${espacio.m}px ${espacio.xs}px;
  font-size: ${fuente.chica}px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${colores.textoSecundario};
`;

export const FilaTarjetas = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${espacio.m}px;
  margin-bottom: ${espacio.l}px;
`;

export const TarjetaMenu = styled.TouchableOpacity<{ $ancho: number; $destacada?: boolean }>`
  width: ${(p) => p.$ancho}px;
  min-height: 124px;
  align-items: center;
  justify-content: center;
  padding: ${espacio.m}px;
  border-radius: ${radioGrande}px;
  background-color: ${colores.vidrio};
  border-width: 1px;
  border-color: ${colores.vidrioBorde};
  shadow-color: ${colores.primario};
  shadow-opacity: ${(p) => (p.$destacada ? 0.3 : 0.12)};
  shadow-radius: ${(p) => (p.$destacada ? 18 : 14)}px;
  shadow-offset: 0px 6px;
  elevation: 0;
`;

export const GradienteTarjeta = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${radioGrande}px;
`;

export const CirculoIcono = styled.View<{ $destacada?: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${espacio.s}px;
  background-color: ${(p) => (p.$destacada ? colores.sobreGradiente : colores.primarioSuave)};
`;

export const TextoMenu = styled.Text<{ $destacada?: boolean }>`
  font-size: ${fuente.normal}px;
  font-weight: 600;
  text-align: center;
  color: ${(p) => (p.$destacada ? colores.textoSobrePrimario : colores.texto)};
`;