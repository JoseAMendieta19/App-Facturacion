import type { TextInputProps } from 'react-native';
import { Asterisco, EntradaTexto, Etiqueta, GrupoCampo, TextoError } from '../styles/componentes';
import { tema } from '../styles/tema';
import { filtrarDecimal, filtrarFecha, filtrarLetras, filtrarNumeros } from '../utils/validaciones';

export type TipoCampo = 'texto' | 'letras' | 'entero' | 'decimal' | 'correo' | 'fecha';

type Props = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'keyboardType' | 'maxLength' | 'style'
> & {
  etiqueta: string;
  valor: string;
  onCambiar: (texto: string) => void;
  tipo?: TipoCampo;
  maxLength?: number; // por defecto 45 (VARCHAR(45)). En 'entero' = máximo de dígitos
  maxEnteros?: number; // solo 'decimal'
  maxDecimales?: number; // solo 'decimal'
  obligatorio?: boolean;
  error?: string;
};

const TECLADOS = {
  texto: 'default',
  letras: 'default',
  entero: 'number-pad',
  decimal: 'decimal-pad',
  correo: 'email-address',
  fecha: 'number-pad',
} as const;

export function CampoTexto({
  etiqueta,
  valor,
  onCambiar,
  tipo = 'texto',
  maxLength = 45,
  maxEnteros = 8,
  maxDecimales = 2,
  obligatorio = false,
  error,
  editable = true,
  ...resto
}: Props) {
  // Cada carácter que entra (escrito o pegado) pasa por el filtro del tipo.
  function manejarCambio(texto: string) {
    switch (tipo) {
      case 'entero':
        return onCambiar(filtrarNumeros(texto, maxLength));
      case 'decimal':
        return onCambiar(filtrarDecimal(texto, maxEnteros, maxDecimales));
      case 'fecha':
        return onCambiar(filtrarFecha(texto)); // AAAA-MM-DD con guiones automáticos
      case 'letras':
        return onCambiar(filtrarLetras(texto).slice(0, maxLength));
      case 'correo':
        return onCambiar(texto.replace(/\s/g, '').toLowerCase().slice(0, maxLength));
      default:
        return onCambiar(texto.slice(0, maxLength));
    }
  }

  const limite = tipo === 'decimal' ? maxEnteros + maxDecimales + 1 : tipo === 'fecha' ? 10 : maxLength;
  const textoLibre = tipo === 'texto' || tipo === 'letras';

  return (
    <GrupoCampo>
      <Etiqueta>
        {etiqueta}
        {obligatorio ? <Asterisco> *</Asterisco> : null}
      </Etiqueta>
      <EntradaTexto
        value={valor}
        onChangeText={manejarCambio}
        keyboardType={TECLADOS[tipo]}
        autoCapitalize={tipo === 'correo' ? 'none' : tipo === 'letras' ? 'words' : 'sentences'}
        autoCorrect={textoLibre}
        maxLength={limite}
        editable={editable}
        placeholderTextColor={tema.colores.textoSecundario}
        accessibilityLabel={etiqueta}
        $conError={Boolean(error)}
        $bloqueado={!editable}
        {...resto}
      />
      {error ? <TextoError>{error}</TextoError> : null}
    </GrupoCampo>
  );
}