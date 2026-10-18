import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { ContenedorFormulario } from '../components/ContenedorFormulario';
import * as IvaController from '../controllers/IvaController';
import type { CampoIva } from '../controllers/IvaController';
import type { PropsPantalla } from '../navigation/tipos';
import { Pantalla, ZonaBotones } from '../styles/componentes';
import { useGuardando } from '../utils/useGuardando';
import type { Errores } from '../utils/validaciones';

export function IvaForm({ navigation, route }: PropsPantalla<'IvaForm'>) {
  const id = route.params?.id ?? null; // null = crear, número = editar
  const [nombre, setNombre] = useState('');
  const [valor, setValor] = useState('');
  const [errores, setErrores] = useState<Errores<CampoIva>>({});
  const { guardando, ejecutar } = useGuardando();

  useLayoutEffect(() => {
    navigation.setOptions({ title: id === null ? 'Nuevo IVA' : 'Editar IVA' });
  }, [navigation, id]);

  // Al editar, se cargan los datos actuales del registro.
  useEffect(() => {
    if (id === null) return;
    const iva = IvaController.obtener(id);
    if (!iva) {
      Alert.alert('Editar IVA', 'El IVA ya no existe.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    setNombre(iva.iva_nombre);
    setValor(String(iva.iva_valor));
  }, [id, navigation]);

  // Al escribir en un campo se quita su mensaje de error.
  function limpiarError(campo: CampoIva) {
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function guardar() {
    return ejecutar(() => {
      const resultado = IvaController.guardar({ nombre, valor }, id);
      if (!resultado.ok) {
        setErrores(resultado.errores);
        if (resultado.mensaje) Alert.alert('No se pudo guardar', resultado.mensaje);
        return;
      }
      Alert.alert(
        'Listo',
        id === null ? 'IVA creado correctamente.' : 'IVA actualizado correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    });
  }

  return (
    <Pantalla>
      <ContenedorFormulario>
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
          etiqueta="Porcentaje (%)"
          obligatorio
          tipo="decimal"
          maxEnteros={3}
          maxDecimales={2}
          valor={valor}
          onCambiar={(texto) => {
            setValor(texto);
            limpiarError('valor');
          }}
          error={errores.valor}
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