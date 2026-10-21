import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { tema } from './tema';

const { colores, radio, radioGrande, espacio, fuente } = tema;

export type VarianteBoton = 'primario' | 'secundario' | 'peligro';

/* ---------- Pantallas y formularios ---------- */
export const Pantalla = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

export const AreaFormulario = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${colores.fondo};
`;

export const ScrollFormulario = styled.ScrollView.attrs({
  keyboardShouldPersistTaps: 'handled',
  contentContainerStyle: { padding: espacio.l, paddingBottom: 120 },
})`
  flex: 1;
`;

/* ---------- Campo de texto ---------- */
export const GrupoCampo = styled.View`
  margin-bottom: ${espacio.l}px;
`;

export const Etiqueta = styled.Text`
  font-size: ${fuente.chica}px;
  font-weight: 600;
  color: ${colores.texto};
  margin-bottom: ${espacio.xs}px;
  margin-left: ${espacio.xs}px;
`;

export const Asterisco = styled.Text`
  color: ${colores.error};
`;

export const EntradaTexto = styled.TextInput<{ $conError: boolean; $bloqueado: boolean }>`
  min-height: 52px;
  border-width: 1px;
  border-color: ${(p) => (p.$conError ? colores.error : colores.vidrioBorde)};
  border-radius: ${radio}px;
  padding: 10px ${espacio.m}px;
  font-size: ${fuente.normal}px;
  color: ${colores.texto};
  background-color: ${(p) => (p.$bloqueado ? colores.campoBloqueado : colores.vidrioFuerte)};
  shadow-color: ${colores.primario};
  shadow-opacity: 0.08;
  shadow-radius: 10px;
  shadow-offset: 0px 4px;
`;

export const TextoError = styled.Text`
  color: ${colores.error};
  font-size: ${fuente.chica}px;
  margin-top: ${espacio.xs}px;
  margin-left: ${espacio.xs}px;
`;

/* ---------- Botones ---------- */
export const BotonBase = styled.TouchableOpacity<{ $variante: VarianteBoton; $inactivo: boolean }>`
  min-height: 52px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 ${espacio.l}px;
  border-radius: ${radio}px;
  border-width: ${(p) => (p.$variante === 'secundario' ? 1.5 : 0)}px;
  border-color: ${colores.primario};
  background-color: ${(p) => {
    if (p.$inactivo) return p.$variante === 'secundario' ? 'transparent' : colores.deshabilitado;
    if (p.$variante === 'primario') return colores.primario;
    if (p.$variante === 'peligro') return colores.error;
    return colores.vidrio;
  }};
  shadow-color: ${colores.primario};
  shadow-opacity: ${(p) => (p.$variante === 'primario' && !p.$inactivo ? 0.3 : 0)};
  shadow-radius: 12px;
  shadow-offset: 0px 6px;
  elevation: ${(p) => (p.$variante === 'primario' && !p.$inactivo ? 4 : 0)};
`;

export const TextoBoton = styled.Text<{ $variante: VarianteBoton }>`
  font-size: ${fuente.normal}px;
  font-weight: 600;
  color: ${(p) => (p.$variante === 'secundario' ? colores.primario : colores.textoSobrePrimario)};
`;

export const BotonIcono = styled.TouchableOpacity`
  padding: ${espacio.s}px;
`;

export const Flotante = styled.TouchableOpacity`
  position: absolute;
  right: 20px;
  bottom: 24px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.primario};
  elevation: 8;
  shadow-color: ${colores.primario};
  shadow-opacity: 0.35;
  shadow-radius: 14px;
  shadow-offset: 0px 8px;
`;

/* ---------- Buscador ---------- */
export const CajaBuscador = styled.View`
  flex-direction: row;
  align-items: center;
  min-height: 50px;
  padding: 0 ${espacio.m}px;
  border-width: 1px;
  border-color: ${colores.vidrioBorde};
  border-radius: ${radioGrande}px;
  background-color: ${colores.vidrioFuerte};
  shadow-color: ${colores.primario};
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
`;

export const EntradaBuscador = styled.TextInput`
  flex: 1;
  padding: 10px ${espacio.s}px;
  font-size: ${fuente.normal}px;
  color: ${colores.texto};
`;

/* ---------- Tarjeta de lista ---------- */
export const Tarjeta = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 14px ${espacio.l}px;
  margin-bottom: 10px;
  border-radius: ${radioGrande}px;
  border-width: 1px;
  border-color: ${colores.vidrioBorde};
  background-color: ${colores.vidrioFuerte};
  shadow-color: ${colores.primario};
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
  elevation: 0;
`;

export const TextosTarjeta = styled.View`
  flex: 1;
`;

export const TituloTarjeta = styled.Text`
  font-size: ${fuente.normal}px;
  font-weight: 600;
  color: ${colores.texto};
`;

export const SubtituloTarjeta = styled.Text`
  margin-top: 2px;
  font-size: ${fuente.chica}px;
  color: ${colores.textoSecundario};
`;

export const TextoDerecha = styled.Text`
  margin-left: ${espacio.s}px;
  font-size: ${fuente.normal}px;
  font-weight: 700;
  color: ${colores.primario};
`;

/* ---------- Estado vacío ---------- */
export const ContenedorVacio = styled.View`
  align-items: center;
  padding: 48px ${espacio.xl}px;
`;

export const TextoVacio = styled.Text`
  margin-top: ${espacio.m}px;
  font-size: ${fuente.normal}px;
  text-align: center;
  color: ${colores.textoSecundario};
`;

/* ---------- Selector con búsqueda ---------- */
export const CajaSelector = styled.TouchableOpacity<{ $conError: boolean; $bloqueado: boolean }>`
  min-height: 52px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px ${espacio.m}px;
  border-width: 1px;
  border-color: ${(p) => (p.$conError ? colores.error : colores.vidrioBorde)};
  border-radius: ${radio}px;
  background-color: ${(p) => (p.$bloqueado ? colores.campoBloqueado : colores.vidrioFuerte)};
  shadow-color: ${colores.primario};
  shadow-opacity: 0.08;
  shadow-radius: 10px;
  shadow-offset: 0px 4px;
`;

export const TextoSelector = styled.Text<{ $vacio: boolean }>`
  flex: 1;
  margin-right: ${espacio.s}px;
  font-size: ${fuente.normal}px;
  color: ${(p) => (p.$vacio ? colores.textoSecundario : colores.texto)};
`;

export const AreaModal = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const FondoModal = styled.View`
  flex: 1;
  background-color: ${colores.fondoModal};
`;

export const ZonaCerrar = styled.TouchableOpacity`
  height: 64px;
`;

export const HojaModal = styled.View`
  flex: 1;
  padding: ${espacio.l}px ${espacio.l}px ${espacio.xl}px ${espacio.l}px;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  background-color: ${colores.superficie};
`;

export const CabeceraHoja = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${espacio.m}px;
`;

export const TituloHoja = styled.Text`
  font-size: ${fuente.titulo}px;
  font-weight: 700;
  color: ${colores.texto};
`;

export const ContadorResultados = styled.Text`
  margin: ${espacio.s}px 0 ${espacio.xs}px 0;
  font-size: ${fuente.chica}px;
  color: ${colores.textoSecundario};
`;

export const FilaOpcion = styled.TouchableOpacity<{ $seleccionada: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px ${espacio.s}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colores.separador};
  border-radius: ${(p) => (p.$seleccionada ? radio : 0)}px;
  background-color: ${(p) => (p.$seleccionada ? colores.seleccion : 'transparent')};
`;

export const ContenidoOpcion = styled.View`
  flex: 1;
`;

export const TextoOpcion = styled.Text`
  font-size: ${fuente.normal}px;
  color: ${colores.texto};
`;

export const DetalleOpcion = styled.Text`
  margin-top: 2px;
  font-size: ${fuente.chica}px;
  color: ${colores.textoSecundario};
`;

/* ---------- Listas y formularios (compartidos por todos los módulos) ---------- */
export const ZonaBuscador = styled.View`
  padding: ${espacio.l}px ${espacio.l}px ${espacio.s}px ${espacio.l}px;
`;

export const ZonaBotones = styled.View`
  gap: ${espacio.m}px;
  margin-top: ${espacio.s}px;
`;
/* ---------- Extras visuales (degradados, avatar y acciones) ---------- */
export const GradienteBoton = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${radio}px;
`;

export const GradienteFlotante = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 30px;
`;

export const Avatar = styled.View`
  width: 42px;
  height: 42px;
  border-radius: 21px;
  align-items: center;
  justify-content: center;
  margin-right: ${espacio.m}px;
  background-color: ${colores.primarioSuave};
`;

export const TextoAvatar = styled.Text`
  font-size: ${fuente.normal}px;
  font-weight: 700;
  color: ${colores.primario};
`;

export const BotonAccion = styled.TouchableOpacity<{ $peligro?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  margin-left: ${espacio.xs}px;
  background-color: ${(p) => (p.$peligro ? 'rgba(229,72,77,0.1)' : colores.primarioSuave)};
`;