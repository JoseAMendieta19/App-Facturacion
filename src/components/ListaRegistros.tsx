import { FlatList } from 'react-native';
import { Pantalla, ZonaBuscador } from '../styles/componentes';
import { tema } from '../styles/tema';
import { BotonFlotante } from './BotonFlotante';
import { Buscador } from './Buscador';
import { EstadoVacio } from './EstadoVacio';
import { TarjetaLista } from './TarjetaLista';

type Props<T> = {
  registros: T[]; // ya filtrados por la búsqueda
  hayRegistros: boolean; // ¿existe alguno sin filtrar? (distingue "vacío" de "sin resultados")
  busqueda: string;
  onBuscar: (texto: string) => void;
  placeholderBusqueda: string;
  mensajeVacio: string;
  claveDe: (registro: T) => string | number;
  tituloDe: (registro: T) => string;
  subtituloDe?: (registro: T) => string;
  derechaDe?: (registro: T) => string;
  onEditar?: (registro: T) => void; // también se ejecuta al tocar la tarjeta
  onEliminar?: (registro: T) => void;
  onNuevo: () => void;
};

const ESTILO_CONTENIDO = {
  padding: tema.espacio.l,
  paddingTop: tema.espacio.s,
  paddingBottom: 100, // espacio para que el botón flotante no tape la última tarjeta
};

// Pantalla de lista estándar de todos los módulos: buscador, tarjetas, estado vacío y botón "+".
export function ListaRegistros<T>({
  registros,
  hayRegistros,
  busqueda,
  onBuscar,
  placeholderBusqueda,
  mensajeVacio,
  claveDe,
  tituloDe,
  subtituloDe,
  derechaDe,
  onEditar,
  onEliminar,
  onNuevo,
}: Props<T>) {
  return (
    <Pantalla>
      <ZonaBuscador>
        <Buscador valor={busqueda} onCambiar={onBuscar} placeholder={placeholderBusqueda} />
      </ZonaBuscador>

      <FlatList
        data={registros}
        keyExtractor={(registro) => String(claveDe(registro))}
        contentContainerStyle={ESTILO_CONTENIDO}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EstadoVacio
            icono={hayRegistros ? 'search-outline' : 'file-tray-outline'}
            mensaje={hayRegistros ? 'No se encontraron resultados para su búsqueda.' : mensajeVacio}
          />
        }
        renderItem={({ item }) => (
          <TarjetaLista
            titulo={tituloDe(item)}
            subtitulo={subtituloDe?.(item)}
            textoDerecha={derechaDe?.(item)}
            onPress={onEditar ? () => onEditar(item) : undefined}
            onEditar={onEditar ? () => onEditar(item) : undefined}
            onEliminar={onEliminar ? () => onEliminar(item) : undefined}
          />
        )}
      />

      <BotonFlotante onPress={onNuevo} />
    </Pantalla>
  );
}