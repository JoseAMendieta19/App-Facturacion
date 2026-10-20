import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AreaModal,
  Asterisco,
  BotonIcono,
  CabeceraHoja,
  CajaSelector,
  ContadorResultados,
  ContenidoOpcion,
  DetalleOpcion,
  Etiqueta,
  FilaOpcion,
  FondoModal,
  GrupoCampo,
  HojaModal,
  TextoError,
  TextoOpcion,
  TextoSelector,
  TituloHoja,
  ZonaCerrar,
} from '../styles/componentes';
import { tema } from '../styles/tema';
import { normalizarTexto } from '../utils/validaciones';
import { Buscador } from './Buscador';

export type Opcion = {
  id: number;
  texto: string; // lo que se muestra y se busca
  detalle?: string; // línea secundaria (también se busca), p. ej. la cédula
};

type Props = {
  etiqueta: string;
  opciones: Opcion[];
  valorId: number | null;
  onSeleccionar: (id: number) => void;
  placeholder?: string;
  obligatorio?: boolean;
  error?: string;
  deshabilitado?: boolean;
  mensajeDeshabilitado?: string; // se muestra en lugar del placeholder si está deshabilitado
  mensajeVacio?: string; // cuando no hay ninguna opción
};

export function SelectorBuscable({
  etiqueta,
  opciones,
  valorId,
  onSeleccionar,
  placeholder = 'Seleccione una opción',
  obligatorio = false,
  error,
  deshabilitado = false,
  mensajeDeshabilitado,
  mensajeVacio = 'No hay opciones disponibles',
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const { bottom } = useSafeAreaInsets(); // la hoja no debe quedar bajo la barra del sistema
  const [consulta, setConsulta] = useState('');

  const seleccionada = opciones.find((o) => o.id === valorId) ?? null;

  // El texto de cada opción se normaliza una sola vez (sin tildes ni mayúsculas).
  const indexadas = useMemo(
    () =>
      opciones.map((opcion) => ({
        opcion,
        clave: normalizarTexto(`${opcion.texto} ${opcion.detalle ?? ''}`),
      })),
    [opciones]
  );

  // Cada palabra escrita debe aparecer en la opción: "perez juan" encuentra "Juan Pérez".
  const visibles = useMemo(() => {
    const palabras = normalizarTexto(consulta).split(' ').filter(Boolean);
    if (palabras.length === 0) return opciones;
    return indexadas
      .filter((item) => palabras.every((palabra) => item.clave.includes(palabra)))
      .map((item) => item.opcion);
  }, [consulta, indexadas, opciones]);

  function abrir() {
    setConsulta('');
    setAbierto(true);
  }

  function elegir(id: number) {
    onSeleccionar(id);
    setAbierto(false);
  }

  const textoMostrado = deshabilitado
    ? (mensajeDeshabilitado ?? placeholder)
    : (seleccionada?.texto ?? placeholder);

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
        accessibilityLabel={`${etiqueta}: ${seleccionada?.texto ?? 'sin seleccionar'}`}
        $conError={Boolean(error)}
        $bloqueado={deshabilitado}
      >
        <TextoSelector numberOfLines={1} $vacio={deshabilitado || !seleccionada}>
          {textoMostrado}
        </TextoSelector>
        <Ionicons name="chevron-down" size={20} color={tema.colores.textoSecundario} />
      </CajaSelector>
      {error ? <TextoError>{error}</TextoError> : null}

      <Modal
        visible={abierto}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setAbierto(false)}
      >
        <AreaModal behavior="padding">
          <FondoModal>
            <ZonaCerrar
              activeOpacity={1}
              onPress={() => setAbierto(false)}
              accessibilityLabel="Cerrar selector"
            />
            <HojaModal style={{ paddingBottom: tema.espacio.xl + bottom }}>
              <CabeceraHoja>
                <TituloHoja>{etiqueta}</TituloHoja>
                <BotonIcono onPress={() => setAbierto(false)} accessibilityLabel="Cerrar">
                  <Ionicons name="close" size={24} color={tema.colores.texto} />
                </BotonIcono>
              </CabeceraHoja>

              <Buscador valor={consulta} onCambiar={setConsulta} placeholder="Escriba para buscar..." autoFocus />
              <ContadorResultados>
                {visibles.length} de {opciones.length}
              </ContadorResultados>

              <FlatList
                data={visibles}
                keyExtractor={(opcion) => String(opcion.id)}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={20}
                ListEmptyComponent={
                  <ContadorResultados>
                    {consulta.trim() ? 'Sin resultados para su búsqueda' : mensajeVacio}
                  </ContadorResultados>
                }
                renderItem={({ item }) => (
                  <FilaOpcion
                    onPress={() => elegir(item.id)}
                    activeOpacity={0.6}
                    $seleccionada={item.id === valorId}
                  >
                    <ContenidoOpcion>
                      <TextoOpcion>{item.texto}</TextoOpcion>
                      {item.detalle ? <DetalleOpcion>{item.detalle}</DetalleOpcion> : null}
                    </ContenidoOpcion>
                    {item.id === valorId ? (
                      <Ionicons name="checkmark" size={20} color={tema.colores.primario} />
                    ) : null}
                  </FilaOpcion>
                )}
              />
            </HojaModal>
          </FondoModal>
        </AreaModal>
      </Modal>
    </GrupoCampo>
  );
}