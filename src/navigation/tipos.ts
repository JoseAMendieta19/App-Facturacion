import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Todas las pantallas de la app y los datos que recibe cada una.
// "undefined" = no recibe nada. En los formularios, { id } significa "editar ese registro";
// sin id es "crear uno nuevo".
export type RootStackParamList = {
  Menu: undefined;

  ProvinciaLista: undefined;
  ProvinciaForm: { id?: number } | undefined;
  CiudadLista: undefined;
  CiudadForm: { id?: number } | undefined;
  IvaLista: undefined;
  IvaForm: { id?: number } | undefined;

  ClienteLista: undefined;
  ClienteForm: { id?: number } | undefined;
  VendedorLista: undefined;
  VendedorForm: { id?: number } | undefined;
  ProveedorLista: undefined;
  ProveedorForm: { id?: number } | undefined;
  ProductoLista: undefined;
  ProductoForm: { id?: number } | undefined;

  FacturaLista: undefined;
  FacturaNueva: undefined;
  FacturaDetalle: { id: number };
};

// Props que recibe cada pantalla: PropsPantalla<'ClienteForm'> trae navigation y route con tipos.
export type PropsPantalla<R extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  R
>;

// Rutas a las que se puede ir sin pasar datos (las del menú principal).
export type RutaSinDatos = {
  [R in keyof RootStackParamList]: undefined extends RootStackParamList[R] ? R : never;
}[keyof RootStackParamList];

// Hace que useNavigation() conozca las rutas sin tener que indicarlas cada vez.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}