// Colores, tamaños y espacios de toda la app (un solo lugar para cambiar el aspecto).
export const tema = {
  colores: {
    primario: '#1565c0',
    fondo: '#f4f6f8',
    superficie: '#ffffff',
    texto: '#1c1c1e',
    textoSecundario: '#6b7280',
    borde: '#c5cbd3',
    separador: '#e5e8ec',
    error: '#d32f2f',
    exito: '#2e7d32',
    deshabilitado: '#b0b7c0',
    campoBloqueado: '#eceff1',
    seleccion: '#e8f0fe',
    fondoModal: 'rgba(0,0,0,0.45)',
    textoSobrePrimario: '#ffffff',
  },
  radio: 10,
  espacio: { xs: 4, s: 8, m: 12, l: 16, xl: 24 },
  fuente: { chica: 13, normal: 16, titulo: 20 },
} as const;