import styled from 'styled-components/native';
import { tema } from './tema';

const { colores, espacio } = tema;

// Hoja inferior del selector de fecha en iPhone (en Android se usa el diálogo del sistema).
export const FondoHojaFecha = styled.View`
  flex: 1;
  justify-content: flex-end;
  background-color: ${colores.fondoModal};
`;

export const HojaFecha = styled.View`
  padding: ${espacio.l}px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background-color: ${colores.superficie};
`;

export const FilaBotonesFecha = styled.View`
  flex-direction: row;
  gap: ${espacio.m}px;
  margin-top: ${espacio.m}px;
`;

export const ColumnaBotonFecha = styled.View`
  flex: 1;
`;