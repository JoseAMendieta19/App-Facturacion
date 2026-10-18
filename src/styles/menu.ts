import styled from 'styled-components/native';
import { tema } from './tema';

const { colores, espacio, fuente } = tema;

export const ScrollMenu = styled.ScrollView.attrs({
  contentContainerStyle: { padding: espacio.l, paddingBottom: espacio.xl },
})`
  flex: 1;
`;

export const TituloSeccion = styled.Text`
  margin: ${espacio.s}px 0 ${espacio.m}px 0;
  font-size: ${fuente.chica}px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${colores.textoSecundario};
`;

export const FilaTarjetas = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${espacio.m}px;
  margin-bottom: ${espacio.l}px;
`;

export const TarjetaMenu = styled.TouchableOpacity<{ $ancho: number }>`
  width: ${(p) => p.$ancho}px;
  min-height: 112px;
  align-items: center;
  justify-content: center;
  padding: ${espacio.m}px;
  border-radius: 14px;
  background-color: ${colores.superficie};
  elevation: 2;
  shadow-color: #000000;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

export const CirculoIcono = styled.View`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${espacio.s}px;
  background-color: ${colores.seleccion};
`;

export const TextoMenu = styled.Text`
  font-size: ${fuente.normal}px;
  font-weight: 600;
  text-align: center;
  color: ${colores.texto};
`;