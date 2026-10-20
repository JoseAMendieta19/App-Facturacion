import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { CampoFecha } from '../components/CampoFecha';
import { CampoTexto } from '../components/CampoTexto';
import { ContenedorFormulario } from '../components/ContenedorFormulario';
import { type Opcion, SelectorBuscable } from '../components/SelectorBuscable';
import * as ProductoController from '../controllers/ProductoController';
import type { CampoProducto } from '../controllers/ProductoController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, ZonaBotones } from '../styles/componentes';
import { fechaLocalISO } from '../utils/formato';
import { useGuardando } from '../utils/useGuardando';
import type { Errores } from '../utils/validaciones';

export function ProductoForm({ navigation, route }: PropsPantalla<'ProductoForm'>) {
  const id = route.params?.id ?? null; // null = crear, número = editar
  const [serie, setSerie] = useState('');
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [fechaVenci, setFechaVenci] = useState('');
  const [fechaOriginal, setFechaOriginal] = useState(''); // la que tenía al abrir (solo al editar)
  const [precio, setPrecio] = useState('');
  const [errores, setErrores] = useState<Errores<CampoProducto>>({});
  const { guardando, ejecutar } = useGuardando();

  const opcionesProveedor = useMemo<Opcion[]>(
    () =>
      ProductoController.listarProveedores().map((p) => ({
        id: p.provee_id,
        texto: p.provee_nombre,
        detalle: `Código: ${p.provee_codigo}`,
      })),
    []
  );
    // No se pueden elegir fechas pasadas, salvo al editar un producto que ya estaba vencido
  // (entonces el selector abre en su fecha y se puede dejar igual).
  const hoy = fechaLocalISO();
  const fechaMinima = fechaOriginal !== '' && fechaOriginal < hoy ? undefined : hoy;

  useLayoutEffect(() => {
    navigation.setOptions({ title: id === null ? 'Nuevo producto' : 'Editar producto' });
  }, [navigation, id]);

  // Al editar, se cargan los datos actuales del registro.
  useEffect(() => {
    if (id === null) return;
    const producto = ProductoController.obtener(id);
    if (!producto) {
      Alert.alert('Editar producto', 'El producto ya no existe.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    setSerie(producto.produc_serie);
    setNombre(producto.produc_nombre);
    setCantidad(String(producto.produc_cantidad));
    setProveedorId(producto.provee_id);
    setFechaVenci(producto.produc_fecha_venci);
    setFechaOriginal(producto.produc_fecha_venci);
    setPrecio(String(producto.produc_precio));
  }, [id, navigation]);

  // Al escribir en un campo se quita su mensaje de error.
  function limpiarError(campo: CampoProducto) {
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function guardar() {
    return ejecutar(() => {
      const resultado = ProductoController.guardar(
        { serie, nombre, cantidad, proveedorId, fechaVenci, precio },
        id
      );
      if (!resultado.ok) {
        setErrores(resultado.errores);
        if (resultado.mensaje) Alert.alert('No se pudo guardar', resultado.mensaje);
        return;
      }
      Alert.alert(
        'Listo',
        id === null ? 'Producto creado correctamente.' : 'Producto actualizado correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    });
  }

  return (
    <Pantalla>
      <ContenedorFormulario>
        <CampoTexto
          etiqueta="Serie"
          obligatorio
          valor={serie}
          onCambiar={(texto) => {
            setSerie(texto);
            limpiarError('serie');
          }}
          error={errores.serie}
        />
        <CampoTexto
          etiqueta="Nombre"
          obligatorio
          valor={nombre}
          onCambiar={(texto) => {
            setNombre(texto);
            limpiarError('nombre');
          }}
          error={errores.nombre}
        />
        <CampoTexto
          etiqueta="Cantidad (stock)"
          obligatorio
          tipo="entero"
          maxLength={6}
          valor={cantidad}
          onCambiar={(texto) => {
            setCantidad(texto);
            limpiarError('cantidad');
          }}
          error={errores.cantidad}
        />
        <SelectorBuscable
          etiqueta="Proveedor"
          obligatorio
          opciones={opcionesProveedor}
          valorId={proveedorId}
          onSeleccionar={(valor) => {
            setProveedorId(valor);
            limpiarError('proveedor');
          }}
          placeholder="Seleccione un proveedor"
          mensajeVacio="No hay proveedores registrados. Cree uno primero."
          error={errores.proveedor}
        />
        <CampoFecha
            etiqueta="Fecha de vencimiento"
            obligatorio
            valor={fechaVenci}
            onCambiar={(fecha) => {
              setFechaVenci(fecha);
              limpiarError('fechaVenci');
            }}
            minimaFecha={fechaMinima}
            maximaFecha="2100-12-31"
            placeholder="Seleccione la fecha de vencimiento"
            error={errores.fechaVenci}
        />
        <CampoTexto
          etiqueta="Precio unitario ($)"
          obligatorio
          tipo="decimal"
          maxEnteros={6}
          maxDecimales={2}
          valor={precio}
          onCambiar={(texto) => {
            setPrecio(texto);
            limpiarError('precio');
          }}
          error={errores.precio}
        />
        <ZonaBotones>
          <Boton
            titulo={guardando ? 'Guardando...' : 'Guardar'}
            onPress={guardar}
            cargando={guardando}
          />
          <Boton
            titulo="Cancelar"
            variante="secundario"
            onPress={() => navigation.goBack()}
            deshabilitado={guardando}
          />
        </ZonaBotones>
      </ContenedorFormulario>
    </Pantalla>
  );
}