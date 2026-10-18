import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListaRegistros } from '../components/ListaRegistros';
import * as ProvinciaController from '../controllers/ProvinciaController';
import type { Provincia } from '../controllers/ProvinciaController';
import type { PropsPantalla } from '../navigation/tipos';

export function ProvinciaLista({ navigation }: PropsPantalla<'ProvinciaLista'>) {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Se ejecuta cada vez que la pantalla vuelve a verse (por ejemplo, al regresar del formulario).
  useFocusEffect(
    useCallback(() => {
      setProvincias(ProvinciaController.listar());
    }, [])
  );

  const visibles = useMemo(
    () => ProvinciaController.filtrar(provincias, busqueda),
    [provincias, busqueda]
  );

  function eliminar(provincia: Provincia) {
    const resultado = ProvinciaController.eliminar(provincia.prov_id);
    if (!resultado.ok) {
      Alert.alert('Eliminar provincia', resultado.mensaje);
      return;
    }
    setProvincias(ProvinciaController.listar());
    Alert.alert('Listo', 'Provincia eliminada correctamente.');
  }

  function pedirConfirmacion(provincia: Provincia) {
    Alert.alert(
      'Eliminar provincia',
      `¿Desea eliminar "${provincia.prov_nombres}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(provincia) },
      ]
    );
  }

  return (
    <ListaRegistros
      registros={visibles}
      hayRegistros={provincias.length > 0}
      busqueda={busqueda}
      onBuscar={setBusqueda}
      placeholderBusqueda="Buscar por nombre o código..."
      mensajeVacio="No hay provincias registradas. Toque + para agregar una."
      claveDe={(p) => p.prov_id}
      tituloDe={(p) => p.prov_nombres}
      subtituloDe={(p) => `Código: ${p.prov_codigo}`}
      onEditar={(p) => navigation.navigate('ProvinciaForm', { id: p.prov_id })}
      onEliminar={pedirConfirmacion}
      onNuevo={() => navigation.navigate('ProvinciaForm')}
    />
  );
}