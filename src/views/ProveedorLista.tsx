import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListaRegistros } from '../components/ListaRegistros';
import * as ProveedorController from '../controllers/ProveedorController';
import type { ProveedorConUbicacion } from '../controllers/ProveedorController';
import type { PropsPantalla } from '../navigation/tipos';

export function ProveedorLista({ navigation }: PropsPantalla<'ProveedorLista'>) {
  const [proveedores, setProveedores] = useState<ProveedorConUbicacion[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Se ejecuta cada vez que la pantalla vuelve a verse (por ejemplo, al regresar del formulario).
  useFocusEffect(
    useCallback(() => {
      setProveedores(ProveedorController.listar());
    }, [])
  );

  const visibles = useMemo(
    () => ProveedorController.filtrar(proveedores, busqueda),
    [proveedores, busqueda]
  );

  function eliminar(proveedor: ProveedorConUbicacion) {
    const resultado = ProveedorController.eliminar(proveedor.provee_id);
    if (!resultado.ok) {
      Alert.alert('Eliminar proveedor', resultado.mensaje);
      return;
    }
    setProveedores(ProveedorController.listar());
    Alert.alert('Listo', 'Proveedor eliminado correctamente.');
  }

  function pedirConfirmacion(proveedor: ProveedorConUbicacion) {
    Alert.alert(
      'Eliminar proveedor',
      `¿Desea eliminar a "${proveedor.provee_nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(proveedor) },
      ]
    );
  }

  return (
    <ListaRegistros
      registros={visibles}
      hayRegistros={proveedores.length > 0}
      busqueda={busqueda}
      onBuscar={setBusqueda}
      placeholderBusqueda="Buscar por nombre, código, teléfono o ciudad..."
      mensajeVacio="No hay proveedores registrados. Toque + para agregar uno."
      claveDe={(p) => p.provee_id}
      tituloDe={(p) => p.provee_nombre}
      subtituloDe={(p) => `Código: ${p.provee_codigo} · ${p.ciud_nombre}, ${p.prov_nombres}`}
      onEditar={(p) => navigation.navigate('ProveedorForm', { id: p.provee_id })}
      onEliminar={pedirConfirmacion}
      onNuevo={() => navigation.navigate('ProveedorForm')}
    />
  );
}