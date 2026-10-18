import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListaRegistros } from '../components/ListaRegistros';
import * as CiudadController from '../controllers/CiudadController';
import type { CiudadConProvincia } from '../controllers/CiudadController';
import type { PropsPantalla } from '../navigation/tipos';

export function CiudadLista({ navigation }: PropsPantalla<'CiudadLista'>) {
  const [ciudades, setCiudades] = useState<CiudadConProvincia[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Se ejecuta cada vez que la pantalla vuelve a verse (por ejemplo, al regresar del formulario).
  useFocusEffect(
    useCallback(() => {
      setCiudades(CiudadController.listar());
    }, [])
  );

  const visibles = useMemo(
    () => CiudadController.filtrar(ciudades, busqueda),
    [ciudades, busqueda]
  );

  function eliminar(ciudad: CiudadConProvincia) {
    const resultado = CiudadController.eliminar(ciudad.ciud_id);
    if (!resultado.ok) {
      Alert.alert('Eliminar ciudad', resultado.mensaje);
      return;
    }
    setCiudades(CiudadController.listar());
    Alert.alert('Listo', 'Ciudad eliminada correctamente.');
  }

  function pedirConfirmacion(ciudad: CiudadConProvincia) {
    Alert.alert(
      'Eliminar ciudad',
      `¿Desea eliminar "${ciudad.ciud_nombre}" (${ciudad.prov_nombres})? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(ciudad) },
      ]
    );
  }

  return (
    <ListaRegistros
      registros={visibles}
      hayRegistros={ciudades.length > 0}
      busqueda={busqueda}
      onBuscar={setBusqueda}
      placeholderBusqueda="Buscar por ciudad, código o provincia..."
      mensajeVacio="No hay ciudades registradas. Toque + para agregar una."
      claveDe={(c) => c.ciud_id}
      tituloDe={(c) => c.ciud_nombre}
      subtituloDe={(c) => `${c.prov_nombres} · Código: ${c.ciu_codigo}`}
      onEditar={(c) => navigation.navigate('CiudadForm', { id: c.ciud_id })}
      onEliminar={pedirConfirmacion}
      onNuevo={() => navigation.navigate('CiudadForm')}
    />
  );
}