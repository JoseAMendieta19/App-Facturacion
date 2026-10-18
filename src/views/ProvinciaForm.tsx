import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { ContenedorFormulario } from '../components/ContenedorFormulario';
import * as ProvinciaController from '../controllers/ProvinciaController';
import type { CampoProvincia } from '../controllers/ProvinciaController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, ZonaBotones } from '../styles/componentes';
import { useGuardando } from '../utils/useGuardando';
import type { Errores } from '../utils/validaciones';

export function ProvinciaForm({ navigation, route }: PropsPantalla<'ProvinciaForm'>) {
  const id = route.params?.id ?? null; // null = crear, número = editar
  const [codigo, setCodigo] = useState('');
  const [nombres, setNombres] = useState('');
  const [errores, setErrores] = useState<Errores<CampoProvincia>>({});
  const { guardando, ejecutar } = useGuardando();

  useLayoutEffect(() => {
    navigation.setOptions({ title: id === null ? 'Nueva provincia' : 'Editar provincia' });
  }, [navigation, id]);

  // Al editar, se cargan los datos actuales del registro.
  useEffect(() => {
    if (id === null) return;
    const provincia = ProvinciaController.obtener(id);
    if (!provincia) {
      Alert.alert('Editar provincia', 'La provincia ya no existe.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    setCodigo(provincia.prov_codigo);
    setNombres(provincia.prov_nombres);
  }, [id, navigation]);

  // Al escribir en un campo se quita su mensaje de error.
  function cambiar(campo: CampoProvincia, valor: string) {
    if (campo === 'codigo') setCodigo(valor);
    else setNombres(valor);
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function guardar() {
    return ejecutar(() => {
      const resultado = ProvinciaController.guardar({ codigo, nombres }, id);
      if (!resultado.ok) {
        setErrores(resultado.errores);
        if (resultado.mensaje) Alert.alert('No se pudo guardar', resultado.mensaje);
        return;
      }
      Alert.alert(
        'Listo',
        id === null ? 'Provincia creada correctamente.' : 'Provincia actualizada correctamente.',
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
          onCambiar={(texto) => cambiar('codigo', texto)}
          error={errores.codigo}
        />
        <CampoTexto
          etiqueta="Nombre"
          obligatorio
          tipo="letras"
          valor={nombres}
          onCambiar={(texto) => cambiar('nombres', texto)}
          error={errores.nombres}
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