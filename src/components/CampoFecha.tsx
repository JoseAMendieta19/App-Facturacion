import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Asterisco,
  BotonIcono,
  CajaSelector,
  Etiqueta,
  GrupoCampo,
  TextoError,
  TextoSelector,
} from '../styles/componentes';
import {
  AgarraderaHoja,
  ColumnaBotonFecha,
  FilaBotonesFecha,
  FondoHojaFecha,
  HojaFecha,
} from '../styles/fecha';
import { tema } from '../styles/tema';
import { fechaDesdeISO, fechaInicial } from '../utils/fechas';
import { fechaLocalISO, formatearFecha } from '../utils/formato';
import { Boton } from './Boton';

type Props = {
  etiqueta: string;
  valor: string; // AAAA-MM-DD, o vacío si no hay fecha elegida
  onCambiar: (fecha: string) => void; // recibe AAAA-MM-DD; '' al borrar
  obligatorio?: boolean;
  error?: string;
  minimaFecha?: string; // AAAA-MM-DD: no se pueden elegir fechas anteriores
  maximaFecha?: string; // AAAA-MM-DD: no se pueden elegir fechas posteriores
  permitirBorrar?: boolean; // muestra una X para dejar el campo vacío (filtros)
  placeholder?: string;
  deshabilitado?: boolean;
};

// Campo de fecha con selector: en Android abre el calendario del sistema; en iPhone, una hoja
// con calendario y botones Aceptar / Cancelar. Siempre entrega una fecha válida en AAAA-MM-DD.
export function CampoFecha({
  etiqueta,
  valor,
  onCambiar,
  obligatorio = false,
  error,
  minimaFecha,
  maximaFecha,
  permitirBorrar = false,
  placeholder = 'Seleccionar fecha',
  deshabilitado = false,
}: Props) {
  const [abierto, setAbierto] = useState(false); // solo iPhone
  const [temporal, setTemporal] = useState<Date>(() => fechaInicial(valor, minimaFecha, maximaFecha));
  const { bottom } = useSafeAreaInsets();

  const minima = minimaFecha ? fechaDesdeISO(minimaFecha) : undefined;
  const maxima = maximaFecha ? fechaDesdeISO(maximaFecha) : undefined;

  function abrir() {
    const inicial = fechaInicial(valor, minimaFecha, maximaFecha);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: inicial,
        mode: 'date',
        minimumDate: minima,
        maximumDate: maxima,
        onValueChange: (_evento, fecha) => onCambiar(fechaLocalISO(fecha)),
      });
    } else {
      setTemporal(inicial);
      setAbierto(true);
    }
  }

  function aceptar() {
    onCambiar(fechaLocalISO(temporal));
    setAbierto(false);
  }

  const hayValor = valor !== '';

  return (
    <GrupoCampo>
      <Etiqueta>
        {etiqueta}
        {obligatorio ? <Asterisco> *</Asterisco> : null}
      </Etiqueta>

      <CajaSelector
        onPress={abrir}
        disabled={deshabilitado}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${hayValor ? formatearFecha(valor) : 'sin seleccionar'}`}
        $conError={Boolean(error)}
        $bloqueado={deshabilitado}
      >
        <TextoSelector numberOfLines={1} $vacio={!hayValor}>
          {hayValor ? formatearFecha(valor) : placeholder}
        </TextoSelector>
        {permitirBorrar && hayValor && !deshabilitado ? (
          <BotonIcono
            onPress={() => onCambiar('')}
            style={{ padding: 4 }}
            accessibilityLabel={`Borrar ${etiqueta}`}
          >
            <Ionicons name="close-circle" size={20} color={tema.colores.textoSecundario} />
          </BotonIcono>
        ) : (
          <Ionicons name="calendar-outline" size={20} color={tema.colores.primario} />
        )}
      </CajaSelector>
      {error ? <TextoError>{error}</TextoError> : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={abierto}
          transparent
          animationType="slide"
          onRequestClose={() => setAbierto(false)}
        >
          <FondoHojaFecha>
            <HojaFecha style={{ paddingBottom: tema.espacio.l + bottom }}>
              <AgarraderaHoja />
              <DateTimePicker
                value={temporal}
                mode="date"
                display="inline"
                locale="es-EC"
                minimumDate={minima}
                maximumDate={maxima}
                onValueChange={(_evento, fecha) => setTemporal(fecha)}
                themeVariant="light"
                accentColor={tema.colores.primario}
              />
              <FilaBotonesFecha>
                <ColumnaBotonFecha>
                  <Boton titulo="Cancelar" variante="secundario" onPress={() => setAbierto(false)} />
                </ColumnaBotonFecha>
                <ColumnaBotonFecha>
                  <Boton titulo="Aceptar" onPress={aceptar} />
                </ColumnaBotonFecha>
              </FilaBotonesFecha>
            </HojaFecha>
          </FondoHojaFecha>
        </Modal>
      ) : null}
    </GrupoCampo>
  );
}