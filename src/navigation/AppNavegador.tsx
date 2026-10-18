import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { tema } from '../styles/tema';
import { CiudadForm } from '../views/CiudadForm';
import { CiudadLista } from '../views/CiudadLista';
import { EnConstruccion } from '../views/EnConstruccion';
import { IvaForm } from '../views/IvaForm';
import { IvaLista } from '../views/IvaLista';
import { MenuPrincipal } from '../views/MenuPrincipal';
import { ProvinciaForm } from '../views/ProvinciaForm';
import { ProvinciaLista } from '../views/ProvinciaLista';
import type { RootStackParamList } from './tipos';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Pantallas que todavía no están construidas. Al construir una, se quita de esta lista
// y se agrega su <Stack.Screen> con la pantalla real (se indica en cada paso).
const PANTALLAS_PENDIENTES: { nombre: Exclude<keyof RootStackParamList, 'Menu'>; titulo: string }[] = [
  { nombre: 'ClienteLista', titulo: 'Clientes' },
  { nombre: 'ClienteForm', titulo: 'Cliente' },
  { nombre: 'VendedorLista', titulo: 'Vendedores' },
  { nombre: 'VendedorForm', titulo: 'Vendedor' },
  { nombre: 'ProveedorLista', titulo: 'Proveedores' },
  { nombre: 'ProveedorForm', titulo: 'Proveedor' },
  { nombre: 'ProductoLista', titulo: 'Productos' },
  { nombre: 'ProductoForm', titulo: 'Producto' },
  { nombre: 'FacturaLista', titulo: 'Facturas' },
  { nombre: 'FacturaNueva', titulo: 'Nueva factura' },
  { nombre: 'FacturaDetalle', titulo: 'Detalle de factura' },
];

export function AppNavegador() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Menu"
        screenOptions={{
          headerStyle: { backgroundColor: tema.colores.primario },
          headerTintColor: tema.colores.textoSobrePrimario,
          headerTitleStyle: { fontWeight: '600' },
          headerBackButtonDisplayMode: 'minimal', // iPhone: solo la flecha, sin texto
          contentStyle: { backgroundColor: tema.colores.fondo },
        }}
      >
        <Stack.Screen name="Menu" component={MenuPrincipal} options={{ title: 'Facturación' }} />

        {/* Provincia (Paso 7) */}
        <Stack.Screen name="ProvinciaLista" component={ProvinciaLista} options={{ title: 'Provincias' }} />
        <Stack.Screen name="ProvinciaForm" component={ProvinciaForm} />

        {/* Ciudad (Paso 8) */}
        <Stack.Screen name="CiudadLista" component={CiudadLista} options={{ title: 'Ciudades' }} />
        <Stack.Screen name="CiudadForm" component={CiudadForm} />

        {/* IVA (Paso 9) */}
        <Stack.Screen name="IvaLista" component={IvaLista} options={{ title: 'IVA' }} />
        <Stack.Screen name="IvaForm" component={IvaForm} />

        {PANTALLAS_PENDIENTES.map((pantalla) => (
          <Stack.Screen
            key={pantalla.nombre}
            name={pantalla.nombre}
            component={EnConstruccion}
            options={{ title: pantalla.titulo }}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}