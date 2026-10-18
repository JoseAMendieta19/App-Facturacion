import { useHeaderHeight } from '@react-navigation/elements';
import type { ReactNode } from 'react';
import { AreaFormulario, ScrollFormulario } from '../styles/componentes';

// Envoltorio de todos los formularios: el teclado no tapa los campos y se puede hacer scroll.
// keyboardVerticalOffset compensa el encabezado de la pantalla (necesario en iPhone).
export function ContenedorFormulario({ children }: { children: ReactNode }) {
  const alturaEncabezado = useHeaderHeight();
  return (
    <AreaFormulario behavior="padding" keyboardVerticalOffset={alturaEncabezado}>
      <ScrollFormulario>{children}</ScrollFormulario>
    </AreaFormulario>
  );
}