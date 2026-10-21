import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { useWindowDimensions } from 'react-native';
import type { PropsPantalla, RutaSinDatos } from '../navigation/tipos';
import { Pantalla } from '../styles/componentes';
import {
  CapaFondo,
  CirculoIcono,
  Difuminado,
  FilaTarjetas,
  GradienteTarjeta,
  Mancha,
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
const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };

export function MenuPrincipal({ navigation }: PropsPantalla<'Menu'>) {
  const { width } = useWindowDimensions();

  // 2 columnas en vertical y 4 en horizontal: el ancho se recalcula al girar el celular.
  const columnas = width >= 600 ? 4 : 2;
  const anchoTarjeta = Math.floor((width - MARGEN * 2 - SEPARACION * (columnas - 1)) / columnas);

  return (
    <Pantalla>
      <CapaFondo colors={tema.gradientes.fondo} />
      <Mancha colors={tema.gradientes.manchaAzul} {...DIAGONAL} $tam={190} $top={-50} $right={-60} />
      <Mancha
        colors={tema.gradientes.manchaLila}
        {...DIAGONAL}
        $tam={160}
        $top={300}
        $left={-80}
        $opacidad={0.8}
      />
      <Mancha
        colors={tema.gradientes.manchaCian}
        {...DIAGONAL}
        $tam={190}
        $bottom={90}
        $right={-90}
        $opacidad={0.75}
      />
      <Mancha
        colors={tema.gradientes.manchaVioleta}
        {...DIAGONAL}
        $tam={100}
        $bottom={-20}
        $left={30}
        $opacidad={0.8}
      />
      <Difuminado intensity={60} tint="light" />

      <ScrollMenu>
        {SECCIONES.map((seccion) => (
          <Fragment key={seccion.titulo}>
            <TituloSeccion>{seccion.titulo}</TituloSeccion>
            <FilaTarjetas>
              {seccion.items.map((item) => {
                const destacada = item.ruta === 'FacturaNueva';
                return (
                  <TarjetaMenu
                    key={item.ruta}
                    $ancho={anchoTarjeta}
                    $destacada={destacada}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate(item.ruta)}
                    accessibilityRole="button"
                    accessibilityLabel={item.titulo}
                  >
                    {destacada && <GradienteTarjeta colors={tema.gradientes.primario} {...DIAGONAL} />}
                    <CirculoIcono $destacada={destacada}>
                      <Ionicons
                        name={item.icono}
                        size={28}
                        color={destacada ? tema.colores.textoSobrePrimario : tema.colores.primario}
                      />
                    </CirculoIcono>
                    <TextoMenu $destacada={destacada}>{item.titulo}</TextoMenu>
                  </TarjetaMenu>
                );
              })}
            </FilaTarjetas>
          </Fragment>
        ))}
      </ScrollMenu>
    </Pantalla>
  );
}