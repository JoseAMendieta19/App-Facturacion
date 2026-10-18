import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { ContenedorFormulario } from '../components/ContenedorFormulario';
import { type Opcion, SelectorBuscable } from '../components/SelectorBuscable';
import * as CiudadController from '../controllers/CiudadController';
import type { CampoCiudad } from '../controllers/CiudadController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, ZonaBotones } from '../styles/componentes';
import { useGuardando } from '../utils/useGuardando';
import type { Errores } from '../utils/validaciones';

export function CiudadForm({ navigation, route }: PropsPantalla<'CiudadForm'>) {
  const id = route.params?.id ?? null; // null = crear, número = editar
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [errores, setErrores] = useState<Errores<CampoCiudad>>({});
  const { guardando, ejecutar } = useGuardando();

  const opcionesProvincia = useMemo<Opcion[]>(
    () =>
      CiudadController.listarProvincias().map((p) => ({
        id: p.prov_id,
        texto: p.prov_nombres,
        detalle: `Código: ${p.prov_codigo}`,
      })),
    []
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: id === null ? 'Nueva ciudad' : 'Editar ciudad' });
  }, [navigation, id]);

  // Al editar, se cargan los datos actuales del registro.
  useEffect(() => {
    if (id === null) return;
    const ciudad = CiudadController.obtener(id);
    if (!ciudad) {
      Alert.alert('Editar ciudad', 'La ciudad ya no existe.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    setCodigo(ciudad.ciu_codigo);
    setNombre(ciudad.ciud_nombre);
    setProvinciaId(ciudad.prov_id);
  }, [id, navigation]);

  // Al escribir en un campo se quita su mensaje de error.
  function limpiarError(...campos: CampoCiudad[]) {
    setErrores((anteriores) => {
      const nuevos = { ...anteriores };
      for (const campo of campos) delete nuevos[campo];
      return nuevos;
    });
  }

  function guardar() {
    return ejecutar(() => {
      const resultado = CiudadController.guardar({ codigo, nombre, provinciaId }, id);
      if (!resultado.ok) {
        setErrores(resultado.errores);
        if (resultado.mensaje) Alert.alert('No se pudo guardar', resultado.mensaje);
        return;
      }
      Alert.alert(
        'Listo',
        id === null ? 'Ciudad creada correctamente.' : 'Ciudad actualizada correctamente.',
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
        <SelectorBuscable
          etiqueta="Provincia"
          obligatorio
          opciones={opcionesProvincia}
          valorId={provinciaId}
          onSeleccionar={(valor) => {
            setProvinciaId(valor);
            limpiarError('provincia', 'nombre'); // el nombre repetido depende de la provincia
          }}
          placeholder="Seleccione una provincia"
          mensajeVacio="No hay provincias registradas. Cree una primero."
          error={errores.provincia}
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