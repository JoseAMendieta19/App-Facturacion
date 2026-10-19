import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListaRegistros } from '../components/ListaRegistros';
import * as ProductoController from '../controllers/ProductoController';
import type { ProductoConProveedor } from '../controllers/ProductoController';
import type { PropsPantalla } from '../navigation/tipos';

export function ProductoLista({ navigation }: PropsPantalla<'ProductoLista'>) {
  const [productos, setProductos] = useState<ProductoConProveedor[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Se ejecuta cada vez que la pantalla vuelve a verse (por ejemplo, al regresar del formulario).
  useFocusEffect(
    useCallback(() => {
      setProductos(ProductoController.listar());
    }, [])
  );

  const visibles = useMemo(
    () => ProductoController.filtrar(productos, busqueda),
    [productos, busqueda]
  );

  function eliminar(producto: ProductoConProveedor) {
    const resultado = ProductoController.eliminar(producto.produc_id);
    if (!resultado.ok) {
      Alert.alert('Eliminar producto', resultado.mensaje);
      return;
    }
    setProductos(ProductoController.listar());
    Alert.alert('Listo', 'Producto eliminado correctamente.');
  }

  function pedirConfirmacion(producto: ProductoConProveedor) {
    Alert.alert(
      'Eliminar producto',
      `¿Desea eliminar "${producto.produc_nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(producto) },
      ]
    );
  }

  return (
    <ListaRegistros
      registros={visibles}
      hayRegistros={productos.length > 0}
      busqueda={busqueda}
      onBuscar={setBusqueda}
      placeholderBusqueda="Buscar por nombre, serie o proveedor..."
      mensajeVacio="No hay productos registrados. Toque + para agregar uno."
      claveDe={(p) => p.produc_id}
      tituloDe={(p) => p.produc_nombre}
      subtituloDe={ProductoController.textoDetalle}
      derechaDe={ProductoController.textoPrecio}
      onEditar={(p) => navigation.navigate('ProductoForm', { id: p.produc_id })}
      onEliminar={pedirConfirmacion}
      onNuevo={() => navigation.navigate('ProductoForm')}
    />
  );
}