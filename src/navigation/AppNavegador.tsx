import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { tema } from '../styles/tema';
import { CiudadForm } from '../views/CiudadForm';
import { CiudadLista } from '../views/CiudadLista';
import { ClienteForm } from '../views/ClienteForm';
import { ClienteLista } from '../views/ClienteLista';
import { FacturaDetalle } from '../views/FacturaDetalle';
import { FacturaLista } from '../views/FacturaLista';
import { FacturaNueva } from '../views/FacturaNueva';
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

export function AppNavegador() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Menu"
        screenOptions={{
          // Barra clara del mismo color del fondo, sin línea de sombra: se ve integrada con el cristal.
          headerStyle: { backgroundColor: tema.colores.fondo },
          headerShadowVisible: false,
          headerTintColor: tema.colores.primario, // flecha de volver en azul
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: tema.fuente.subtitulo,
            color: tema.colores.texto,
          },
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

        {/* Factura (Paso 14: nueva; Paso 15: lista y detalle) */}
        <Stack.Screen name="FacturaLista" component={FacturaLista} options={{ title: 'Facturas' }} />
        <Stack.Screen name="FacturaNueva" component={FacturaNueva} options={{ title: 'Nueva factura' }} />
        <Stack.Screen name="FacturaDetalle" component={FacturaDetalle} options={{ title: 'Detalle de factura' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}