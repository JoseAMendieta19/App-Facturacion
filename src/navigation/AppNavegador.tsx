import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { tema } from '../styles/tema';
import { CiudadForm } from '../views/CiudadForm';
import { CiudadLista } from '../views/CiudadLista';
import { ClienteForm } from '../views/ClienteForm';
import { ClienteLista } from '../views/ClienteLista';
import { EnConstruccion } from '../views/EnConstruccion';
import { IvaForm } from '../views/IvaForm';
import { IvaLista } from '../views/IvaLista';
import { MenuPrincipal } from '../views/MenuPrincipal';
import { ProductoForm } from '../views/ProductoForm';
import { ProductoLista } from '../views/ProductoLista';
import { ProveedorForm } from '../views/ProveedorForm';
import { ProveedorLista } from '../views/ProveedorLista';
import { ProvinciaForm } from '../views/ProvinciaForm';
import { ProvinciaLista } from '../views/ProvinciaLista';
import { VendedorForm } from '../views/VendedorForm';
import { VendedorLista } from '../views/VendedorLista';
import type { RootStackParamList } from './tipos';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Pantallas que todavía no están construidas. Al construir una, se quita de esta lista
// y se agrega su <Stack.Screen> con la pantalla real (se indica en cada paso).
const PANTALLAS_PENDIENTES: { nombre: Exclude<keyof RootStackParamList, 'Menu'>; titulo: string }[] = [
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

        {/* Cliente (Paso 10) */}
        <Stack.Screen name="ClienteLista" component={ClienteLista} options={{ title: 'Clientes' }} />
        <Stack.Screen name="ClienteForm" component={ClienteForm} />

        {/* Vendedor (Paso 11) */}
        <Stack.Screen name="VendedorLista" component={VendedorLista} options={{ title: 'Vendedores' }} />
        <Stack.Screen name="VendedorForm" component={VendedorForm} />

        {/* Proveedor (Paso 12) */}
        <Stack.Screen name="ProveedorLista" component={ProveedorLista} options={{ title: 'Proveedores' }} />
        <Stack.Screen name="ProveedorForm" component={ProveedorForm} />

        {/* Producto (Paso 13) */}
        <Stack.Screen name="ProductoLista" component={ProductoLista} options={{ title: 'Productos' }} />
        <Stack.Screen name="ProductoForm" component={ProductoForm} />

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