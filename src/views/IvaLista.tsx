import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListaRegistros } from '../components/ListaRegistros';
import * as IvaController from '../controllers/IvaController';
import type { Iva } from '../controllers/IvaController';
import type { PropsPantalla } from '../navigation/tipos';

export function IvaLista({ navigation }: PropsPantalla<'IvaLista'>) {
  const [ivas, setIvas] = useState<Iva[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Se ejecuta cada vez que la pantalla vuelve a verse (por ejemplo, al regresar del formulario).
  useFocusEffect(
    useCallback(() => {
      setIvas(IvaController.listar());
    }, [])
  );

  const visibles = useMemo(() => IvaController.filtrar(ivas, busqueda), [ivas, busqueda]);

  function eliminar(iva: Iva) {
    const resultado = IvaController.eliminar(iva.iva_id);
    if (!resultado.ok) {
      Alert.alert('Eliminar IVA', resultado.mensaje);
      return;
    }
    setIvas(IvaController.listar());
    Alert.alert('Listo', 'IVA eliminado correctamente.');
  }

  function pedirConfirmacion(iva: Iva) {
    Alert.alert(
      'Eliminar IVA',
      `¿Desea eliminar "${iva.iva_nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(iva) },
      ]
    );
  }

  return (
    <ListaRegistros
      registros={visibles}
      hayRegistros={ivas.length > 0}
      busqueda={busqueda}
      onBuscar={setBusqueda}
      placeholderBusqueda="Buscar por nombre o porcentaje..."
      mensajeVacio="No hay tarifas de IVA registradas. Toque + para agregar una."
      claveDe={(i) => i.iva_id}
      tituloDe={(i) => i.iva_nombre}
      subtituloDe={(i) => `Porcentaje: ${i.iva_valor}%`}
      onEditar={(i) => navigation.navigate('IvaForm', { id: i.iva_id })}
      onEliminar={pedirConfirmacion}
      onNuevo={() => navigation.navigate('IvaForm')}
    />
  );
}