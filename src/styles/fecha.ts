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
  padding: ${espacio.m}px ${espacio.l}px ${espacio.l}px ${espacio.l}px;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  border-width: 1px;
  border-color: ${colores.vidrioBorde};
  background-color: ${colores.superficie};
`;

// Rayita gris arriba de la hoja, indica que es un panel deslizable.
export const AgarraderaHoja = styled.View`
  align-self: center;
  width: 40px;
  height: 5px;
  margin-bottom: ${espacio.s}px;
  border-radius: 3px;
  background-color: ${colores.borde};
`;

export const FilaBotonesFecha = styled.View`
  flex-direction: row;
  gap: ${espacio.m}px;
  margin-top: ${espacio.m}px;
`;

export const ColumnaBotonFecha = styled.View`
  flex: 1;
`;