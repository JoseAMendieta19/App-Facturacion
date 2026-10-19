import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListaRegistros } from '../components/ListaRegistros';
import * as ClienteController from '../controllers/ClienteController';
import type { ClienteConUbicacion } from '../controllers/ClienteController';
import type { PropsPantalla } from '../navigation/tipos';

export function ClienteLista({ navigation }: PropsPantalla<'ClienteLista'>) {
  const [clientes, setClientes] = useState<ClienteConUbicacion[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Se ejecuta cada vez que la pantalla vuelve a verse (por ejemplo, al regresar del formulario).
  useFocusEffect(
    useCallback(() => {
      setClientes(ClienteController.listar());
    }, [])
  );

  const visibles = useMemo(
    () => ClienteController.filtrar(clientes, busqueda),
    [clientes, busqueda]
  );

  function eliminar(cliente: ClienteConUbicacion) {
    const resultado = ClienteController.eliminar(cliente.cli_id);
    if (!resultado.ok) {
      Alert.alert('Eliminar cliente', resultado.mensaje);
      return;
    }
    setClientes(ClienteController.listar());
    Alert.alert('Listo', 'Cliente eliminado correctamente.');
  }

  function pedirConfirmacion(cliente: ClienteConUbicacion) {
    Alert.alert(
      'Eliminar cliente',
      `¿Desea eliminar a "${cliente.cli_nombres}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(cliente) },
      ]
    );
  }

  return (
    <ListaRegistros
      registros={visibles}
      hayRegistros={clientes.length > 0}
      busqueda={busqueda}
      onBuscar={setBusqueda}
      placeholderBusqueda="Buscar por nombre, cédula, correo o ciudad..."
      mensajeVacio="No hay clientes registrados. Toque + para agregar uno."
      claveDe={(c) => c.cli_id}
      tituloDe={(c) => c.cli_nombres}
      subtituloDe={(c) => `Cédula: ${c.cli_cedula} · ${c.ciud_nombre}, ${c.prov_nombres}`}
      onEditar={(c) => navigation.navigate('ClienteForm', { id: c.cli_id })}
      onEliminar={pedirConfirmacion}
      onNuevo={() => navigation.navigate('ClienteForm')}
    />
  );
}