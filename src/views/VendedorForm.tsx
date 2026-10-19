import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { ContenedorFormulario } from '../components/ContenedorFormulario';
import { SelectorProvinciaCiudad } from '../components/SelectorProvinciaCiudad';
import * as VendedorController from '../controllers/VendedorController';
import type { CampoVendedor } from '../controllers/VendedorController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, ZonaBotones } from '../styles/componentes';
import { useGuardando } from '../utils/useGuardando';
import type { Errores } from '../utils/validaciones';

export function VendedorForm({ navigation, route }: PropsPantalla<'VendedorForm'>) {
  const id = route.params?.id ?? null; // null = crear, número = editar
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [ciudadId, setCiudadId] = useState<number | null>(null);
  const [errores, setErrores] = useState<Errores<CampoVendedor>>({});
  const { guardando, ejecutar } = useGuardando();

  // Listas para el selector en cascada (se cargan una sola vez al abrir el formulario).
  const provincias = useMemo(
    () =>
      VendedorController.listarProvincias().map((p) => ({ id: p.prov_id, nombre: p.prov_nombres })),
    []
  );
  const ciudades = useMemo(
    () =>
      VendedorController.listarCiudades().map((c) => ({
        id: c.ciud_id,
        nombre: c.ciud_nombre,
        provinciaId: c.prov_id,
      })),
    []
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: id === null ? 'Nuevo vendedor' : 'Editar vendedor' });
  }, [navigation, id]);

  // Al editar, se cargan los datos actuales del registro.
  useEffect(() => {
    if (id === null) return;
    const vendedor = VendedorController.obtener(id);
    if (!vendedor) {
      Alert.alert('Editar vendedor', 'El vendedor ya no existe.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    setCodigo(vendedor.vend_codigo);
    setNombre(vendedor.vend_nombre);
    setCorreo(vendedor.vend_correo);
    setTelefono(vendedor.vend_telefono);
    setProvinciaId(vendedor.prov_id);
    setCiudadId(vendedor.ciud_id);
  }, [id, navigation]);

  // Al escribir en un campo se quita su mensaje de error.
  function limpiarError(...campos: CampoVendedor[]) {
    setErrores((anteriores) => {
      const nuevos = { ...anteriores };
      for (const campo of campos) delete nuevos[campo];
      return nuevos;
    });
  }

  function guardar() {
    return ejecutar(() => {
      const resultado = VendedorController.guardar(
        { codigo, nombre, correo, telefono, provinciaId, ciudadId },
        id
      );
      if (!resultado.ok) {
        setErrores(resultado.errores);
        if (resultado.mensaje) Alert.alert('No se pudo guardar', resultado.mensaje);
        return;
      }
      Alert.alert(
        'Listo',
        id === null ? 'Vendedor creado correctamente.' : 'Vendedor actualizado correctamente.',
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
          tipo="letras"
          valor={nombre}
          onCambiar={(texto) => {
            setNombre(texto);
            limpiarError('nombre');
          }}
          error={errores.nombre}
        />
        <CampoTexto
          etiqueta="Correo"
          obligatorio
          tipo="correo"
          autoCapitalize="none"
          autoCorrect={false}
          valor={correo}
          onCambiar={(texto) => {
            setCorreo(texto);
            limpiarError('correo');
          }}
          error={errores.correo}
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