import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListaRegistros } from '../components/ListaRegistros';
import * as VendedorController from '../controllers/VendedorController';
import type { VendedorConUbicacion } from '../controllers/VendedorController';
import type { PropsPantalla } from '../navigation/tipos';

export function VendedorLista({ navigation }: PropsPantalla<'VendedorLista'>) {
  const [vendedores, setVendedores] = useState<VendedorConUbicacion[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Se ejecuta cada vez que la pantalla vuelve a verse (por ejemplo, al regresar del formulario).
  useFocusEffect(
    useCallback(() => {
      setVendedores(VendedorController.listar());
    }, [])
  );

  const visibles = useMemo(
    () => VendedorController.filtrar(vendedores, busqueda),
    [vendedores, busqueda]
  );

  function eliminar(vendedor: VendedorConUbicacion) {
    const resultado = VendedorController.eliminar(vendedor.vend_id);
    if (!resultado.ok) {
      Alert.alert('Eliminar vendedor', resultado.mensaje);
      return;
    }
    setVendedores(VendedorController.listar());
    Alert.alert('Listo', 'Vendedor eliminado correctamente.');
  }

  function pedirConfirmacion(vendedor: VendedorConUbicacion) {
    Alert.alert(
      'Eliminar vendedor',
      `¿Desea eliminar a "${vendedor.vend_nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(vendedor) },
      ]
    );
  }

  return (
    <ListaRegistros
      registros={visibles}
      hayRegistros={vendedores.length > 0}
      busqueda={busqueda}
      onBuscar={setBusqueda}
      placeholderBusqueda="Buscar por nombre, código, correo o ciudad..."
      mensajeVacio="No hay vendedores registrados. Toque + para agregar uno."
      claveDe={(v) => v.vend_id}
      tituloDe={(v) => v.vend_nombre}
      subtituloDe={(v) => `Código: ${v.vend_codigo} · ${v.ciud_nombre}, ${v.prov_nombres}`}
      onEditar={(v) => navigation.navigate('VendedorForm', { id: v.vend_id })}
      onEliminar={pedirConfirmacion}
      onNuevo={() => navigation.navigate('VendedorForm')}
    />
  );
}