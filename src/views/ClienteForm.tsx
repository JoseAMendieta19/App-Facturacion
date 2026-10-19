import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { ContenedorFormulario } from '../components/ContenedorFormulario';
import { SelectorProvinciaCiudad } from '../components/SelectorProvinciaCiudad';
import * as ClienteController from '../controllers/ClienteController';
import type { CampoCliente } from '../controllers/ClienteController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, ZonaBotones } from '../styles/componentes';
import { useGuardando } from '../utils/useGuardando';
import type { Errores } from '../utils/validaciones';

export function ClienteForm({ navigation, route }: PropsPantalla<'ClienteForm'>) {
  const id = route.params?.id ?? null; // null = crear, número = editar
  const [cedula, setCedula] = useState('');
  const [nombres, setNombres] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [ciudadId, setCiudadId] = useState<number | null>(null);
  const [errores, setErrores] = useState<Errores<CampoCliente>>({});
  const { guardando, ejecutar } = useGuardando();

  // Listas para el selector en cascada (se cargan una sola vez al abrir el formulario).
  const provincias = useMemo(
    () =>
      ClienteController.listarProvincias().map((p) => ({ id: p.prov_id, nombre: p.prov_nombres })),
    []
  );
  const ciudades = useMemo(
    () =>
      ClienteController.listarCiudades().map((c) => ({
        id: c.ciud_id,
        nombre: c.ciud_nombre,
        provinciaId: c.prov_id,
      })),
    []
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: id === null ? 'Nuevo cliente' : 'Editar cliente' });
  }, [navigation, id]);

  // Al editar, se cargan los datos actuales del registro.
  useEffect(() => {
    if (id === null) return;
    const cliente = ClienteController.obtener(id);
    if (!cliente) {
      Alert.alert('Editar cliente', 'El cliente ya no existe.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    setCedula(cliente.cli_cedula);
    setNombres(cliente.cli_nombres);
    setCorreo(cliente.cli_correo);
    setTelefono(cliente.cli_telefono);
    setDireccion(cliente.cli_direccion);
    setProvinciaId(cliente.prov_id);
    setCiudadId(cliente.ciud_id);
  }, [id, navigation]);

  // Al escribir en un campo se quita su mensaje de error.
  function limpiarError(...campos: CampoCliente[]) {
    setErrores((anteriores) => {
      const nuevos = { ...anteriores };
      for (const campo of campos) delete nuevos[campo];
      return nuevos;
    });
  }

  function guardar() {
    return ejecutar(() => {
      const resultado = ClienteController.guardar(
        { cedula, nombres, correo, telefono, direccion, provinciaId, ciudadId },
        id
      );
      if (!resultado.ok) {
        setErrores(resultado.errores);
        if (resultado.mensaje) Alert.alert('No se pudo guardar', resultado.mensaje);
        return;
      }
      Alert.alert(
        'Listo',
        id === null ? 'Cliente creado correctamente.' : 'Cliente actualizado correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    });
  }

  return (
    <Pantalla>
      <ContenedorFormulario>
        <CampoTexto
          etiqueta="Cédula"
          obligatorio
          tipo="entero"
          maxLength={10}
          valor={cedula}
          onCambiar={(texto) => {
            setCedula(texto);
            limpiarError('cedula');
          }}
          error={errores.cedula}
        />
        <CampoTexto
          etiqueta="Nombres"
          obligatorio
          tipo="letras"
          valor={nombres}
          onCambiar={(texto) => {
            setNombres(texto);
            limpiarError('nombres');
          }}
          error={errores.nombres}
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