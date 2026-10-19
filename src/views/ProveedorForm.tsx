import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { ContenedorFormulario } from '../components/ContenedorFormulario';
import { SelectorProvinciaCiudad } from '../components/SelectorProvinciaCiudad';
import * as ProveedorController from '../controllers/ProveedorController';
import type { CampoProveedor } from '../controllers/ProveedorController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, ZonaBotones } from '../styles/componentes';
import { useGuardando } from '../utils/useGuardando';
import type { Errores } from '../utils/validaciones';

export function ProveedorForm({ navigation, route }: PropsPantalla<'ProveedorForm'>) {
  const id = route.params?.id ?? null; // null = crear, número = editar
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [ciudadId, setCiudadId] = useState<number | null>(null);
  const [errores, setErrores] = useState<Errores<CampoProveedor>>({});
  const { guardando, ejecutar } = useGuardando();

  // Listas para el selector en cascada (se cargan una sola vez al abrir el formulario).
  const provincias = useMemo(
    () =>
      ProveedorController.listarProvincias().map((p) => ({
        id: p.prov_id,
        nombre: p.prov_nombres,
      })),
    []
  );
  const ciudades = useMemo(
    () =>
      ProveedorController.listarCiudades().map((c) => ({
        id: c.ciud_id,
        nombre: c.ciud_nombre,
        provinciaId: c.prov_id,
      })),
    []
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: id === null ? 'Nuevo proveedor' : 'Editar proveedor' });
  }, [navigation, id]);

  // Al editar, se cargan los datos actuales del registro.
  useEffect(() => {
    if (id === null) return;
    const proveedor = ProveedorController.obtener(id);
    if (!proveedor) {
      Alert.alert('Editar proveedor', 'El proveedor ya no existe.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    setCodigo(proveedor.provee_codigo);
    setNombre(proveedor.provee_nombre);
    setTelefono(proveedor.provee_telefono);
    setDireccion(proveedor.provee_direccion);
    setProvinciaId(proveedor.prov_id);
    setCiudadId(proveedor.ciud_id);
  }, [id, navigation]);

  // Al escribir en un campo se quita su mensaje de error.
  function limpiarError(...campos: CampoProveedor[]) {
    setErrores((anteriores) => {
      const nuevos = { ...anteriores };
      for (const campo of campos) delete nuevos[campo];
      return nuevos;
    });
  }

  function guardar() {
    return ejecutar(() => {
      const resultado = ProveedorController.guardar(
        { codigo, nombre, telefono, direccion, provinciaId, ciudadId },
        id
      );
      if (!resultado.ok) {
        setErrores(resultado.errores);
        if (resultado.mensaje) Alert.alert('No se pudo guardar', resultado.mensaje);
        return;
      }
      Alert.alert(
        'Listo',
        id === null ? 'Proveedor creado correctamente.' : 'Proveedor actualizado correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    });
  }

  return (
    <Pantalla>
      <ContenedorFormulario>
        <CampoTexto
          etiqueta="Código"
          obligatorio
          valor={codigo}
          onCambiar={(texto) => {
            setCodigo(texto);
            limpiarError('codigo');
          }}
          error={errores.codigo}
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
          etiqueta="Teléfono"
          obligatorio
          tipo="entero"
          maxLength={10}
          valor={telefono}
          onCambiar={(texto) => {
            setTelefono(texto);
            limpiarError('telefono');
          }}
          error={errores.telefono}
        />
        <CampoTexto
          etiqueta="Dirección"
          obligatorio
          valor={direccion}
          onCambiar={(texto) => {
            setDireccion(texto);
            limpiarError('direccion');
          }}
          error={errores.direccion}
        />
        <SelectorProvinciaCiudad
          provincias={provincias}
          ciudades={ciudades}
          provinciaId={provinciaId}
          ciudadId={ciudadId}
          onCambiar={(nuevaProvincia, nuevaCiudad) => {
            setProvinciaId(nuevaProvincia);
            setCiudadId(nuevaCiudad);
            limpiarError('provincia', 'ciudad');
          }}
          errorProvincia={errores.provincia}
          errorCiudad={errores.ciudad}
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