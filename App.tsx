import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Appearance, StyleSheet, Text, View } from 'react-native';
import { inicializarBaseDeDatos } from './src/database/conexion';
import { AppNavegador } from './src/navigation/AppNavegador';
import { tema } from './src/styles/tema';

// Fuerza el modo claro en toda la app (selector de fecha, alertas, teclado, etc.).
Appearance.setColorScheme('light');

type EstadoBD = { ok: true } | { ok: false; mensaje: string };

// La base se prepara una sola vez, antes de dibujar cualquier pantalla.
function prepararBaseDeDatos(): EstadoBD {
  try {
    inicializarBaseDeDatos();
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : String(error) };
  }
}

export default function App() {
  const [estadoBD] = useState<EstadoBD>(prepararBaseDeDatos);

  if (!estadoBD.ok) {
    return (
      <View style={estilos.error}>
        <Text style={estilos.errorTitulo}>No se pudo abrir la base de datos</Text>
        <Text style={estilos.errorDetalle}>{estadoBD.mensaje}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavegador />
    </>
  );
}

const estilos = StyleSheet.create({
  error: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: tema.colores.fondo },
  errorTitulo: { fontSize: 20, fontWeight: 'bold', color: tema.colores.error, marginBottom: 12 },
  errorDetalle: { fontSize: 15, color: tema.colores.texto },
});