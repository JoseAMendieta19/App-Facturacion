import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { useWindowDimensions } from 'react-native';
import type { PropsPantalla, RutaSinDatos } from '../navigation/tipos';
import { Pantalla } from '../styles/componentes';
import {
  CirculoIcono,
  FilaTarjetas,
  ScrollMenu,
  TarjetaMenu,
  TextoMenu,
  TituloSeccion,
} from '../styles/menu';
import { tema } from '../styles/tema';

type ItemMenu = {
  titulo: string;
  ruta: RutaSinDatos;
  icono: keyof typeof Ionicons.glyphMap;
};

const SECCIONES: { titulo: string; items: ItemMenu[] }[] = [
  {
    titulo: 'Facturación',
    items: [
      { titulo: 'Nueva factura', ruta: 'FacturaNueva', icono: 'receipt-outline' },
      { titulo: 'Facturas', ruta: 'FacturaLista', icono: 'document-text-outline' },
    ],
  },
  {
    titulo: 'Gestión',
    items: [
      { titulo: 'Clientes', ruta: 'ClienteLista', icono: 'people-outline' },
      { titulo: 'Vendedores', ruta: 'VendedorLista', icono: 'briefcase-outline' },
      { titulo: 'Proveedores', ruta: 'ProveedorLista', icono: 'business-outline' },
      { titulo: 'Productos', ruta: 'ProductoLista', icono: 'cube-outline' },
    ],
  },
  {
    titulo: 'Catálogos',
    items: [
      { titulo: 'Provincias', ruta: 'ProvinciaLista', icono: 'map-outline' },
      { titulo: 'Ciudades', ruta: 'CiudadLista', icono: 'location-outline' },
      { titulo: 'IVA', ruta: 'IvaLista', icono: 'calculator-outline' },
    ],
  },
];

const MARGEN = tema.espacio.l;
const SEPARACION = tema.espacio.m;

export function MenuPrincipal({ navigation }: PropsPantalla<'Menu'>) {
  const { width } = useWindowDimensions();

  // 2 columnas en vertical y 4 en horizontal: el ancho se recalcula al girar el celular.
  const columnas = width >= 600 ? 4 : 2;
  const anchoTarjeta = Math.floor((width - MARGEN * 2 - SEPARACION * (columnas - 1)) / columnas);

  return (
    <Pantalla>
      <ScrollMenu>
        {SECCIONES.map((seccion) => (
          <Fragment key={seccion.titulo}>
            <TituloSeccion>{seccion.titulo}</TituloSeccion>
            <FilaTarjetas>
              {seccion.items.map((item) => (
                <TarjetaMenu
                  key={item.ruta}
                  $ancho={anchoTarjeta}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(item.ruta)}
                  accessibilityRole="button"
                  accessibilityLabel={item.titulo}
                >
                  <CirculoIcono>
                    <Ionicons name={item.icono} size={28} color={tema.colores.primario} />
                  </CirculoIcono>
                  <TextoMenu>{item.titulo}</TextoMenu>
                </TarjetaMenu>
              ))}
            </FilaTarjetas>
          </Fragment>
        ))}
      </ScrollMenu>
    </Pantalla>
  );
}