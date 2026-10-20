import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { Boton } from '../components/Boton';
import { BotonFlotante } from '../components/BotonFlotante';
import { Buscador } from '../components/Buscador';
import { EstadoVacio } from '../components/EstadoVacio';
import { FiltroFechas } from '../components/FiltroFechas';
import { TarjetaLista } from '../components/TarjetaLista';
import * as FacturaController from '../controllers/FacturaController';
import type { FacturaListada } from '../controllers/FacturaController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, ZonaBuscador } from '../styles/componentes';
import {
  BarraTotal,
  TextoCantidadFacturas,
  TextoTotalFacturas,
} from '../styles/factura';
import { tema } from '../styles/tema';
import { formatearDinero, formatearFecha } from '../utils/formato';

const ESTILO_CONTENIDO = {
  padding: tema.espacio.l,
  paddingTop: tema.espacio.s,
  paddingBottom: 100, // espacio para que el botón flotante no tape la última tarjeta
};

export function FacturaLista({ navigation }: PropsPantalla<'FacturaLista'>) {
  const [facturas, setFacturas] = useState<FacturaListada[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Se recarga cada vez que la pantalla vuelve a verse (por ejemplo, tras emitir una factura).
  useFocusEffect(
    useCallback(() => {
      setFacturas(FacturaController.listar());
    }, [])
  );

  const errores = FacturaController.validarFiltro(desde, hasta);
  const visibles = useMemo(
    () => FacturaController.filtrar(facturas, { busqueda, desde, hasta }),
    [facturas, busqueda, desde, hasta]
  );
  const cantidad = visibles.length;
  const total = FacturaController.totalDe(visibles);
  const hayFiltros = busqueda !== '' || desde !== '' || hasta !== '';

  function limpiarFiltros() {
    setBusqueda('');
    setDesde('');
    setHasta('');
  }

  return (
    <Pantalla>
      <ZonaBuscador>
        <Buscador
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por número o cliente..."
        />
      </ZonaBuscador>

      <FiltroFechas
        desde={desde}
        hasta={hasta}
        onCambiarDesde={setDesde}
        onCambiarHasta={setHasta}
        errorDesde={errores.desde}
        errorHasta={errores.hasta}
      />

      {hayFiltros ? (
        <ZonaBuscador style={{ paddingTop: 0 }}>
          <Boton titulo="Limpiar filtros" variante="secundario" onPress={limpiarFiltros} />
        </ZonaBuscador>
      ) : null}

      <BarraTotal>
        <TextoCantidadFacturas>
          {cantidad} {cantidad === 1 ? 'factura' : 'facturas'}
        </TextoCantidadFacturas>
        <TextoTotalFacturas>Total: {formatearDinero(total)}</TextoTotalFacturas>
      </BarraTotal>

      <FlatList
        data={visibles}
        keyExtractor={(f) => String(f.fac_id)}
        contentContainerStyle={ESTILO_CONTENIDO}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EstadoVacio
            icono={facturas.length > 0 ? 'search-outline' : 'file-tray-outline'}
            mensaje={
              facturas.length > 0
                ? 'No se encontraron facturas con esos filtros.'
                : 'Todavía no hay facturas. Toque + para emitir la primera.'
            }
          />
        }
        renderItem={({ item }) => (
          <TarjetaLista
            titulo={item.fac_numero}
            subtitulo={`${item.cli_nombres} · ${formatearFecha(item.fac_fecha)}`}
            textoDerecha={formatearDinero(item.fac_total)}
            onPress={() => navigation.navigate('FacturaDetalle', { id: item.fac_id })}
          />
        )}
      />

      <BotonFlotante onPress={() => navigation.navigate('FacturaNueva')} etiqueta="Nueva factura" />
    </Pantalla>
  );
}