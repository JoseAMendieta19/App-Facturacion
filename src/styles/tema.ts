// Colores, tamaños y espacios de toda la app (un solo lugar para cambiar el aspecto).
// Estilo: glassmorphism azul/cian. Las claves originales se mantienen; solo cambian sus valores.
export const tema = {
  colores: {
    // --- Claves originales (mismos nombres) ---
    primario: '#2563eb',
    fondo: '#eaf0ff',
    superficie: '#ffffff',
    texto: '#14233a',
    textoSecundario: '#5b6b82',
    borde: '#c9d6ee',
    separador: '#e3eaf7',
    error: '#e5484d',
    exito: '#12b76a',
    deshabilitado: '#a9b6ce',
    campoBloqueado: '#e8eef9',
    seleccion: '#e3edff',
    fondoModal: 'rgba(20,35,58,0.45)',
    textoSobrePrimario: '#ffffff',

    // --- Nuevas (solo visuales) ---
    cian: '#22d3ee',
    primarioSuave: 'rgba(37,99,235,0.12)', // fondo de iconos en círculo
    vidrio: 'rgba(255,255,255,0.62)', // tarjetas translúcidas
    vidrioFuerte: 'rgba(255,255,255,0.82)', // inputs y paneles
    vidrioBorde: 'rgba(255,255,255,0.85)',
    sobreGradiente: 'rgba(255,255,255,0.25)', // círculo de icono sobre degradado
  },

  // Degradados para expo-linear-gradient (tuplas de solo lectura).
  gradientes: {
    primario: ['#3b82f6', '#2563eb', '#22a7f0'],
    fondo: ['#e8eeff', '#f5f7fd'],
    manchaAzul: ['#3b82f6', '#22d3ee'],
    manchaLila: ['#60a5fa', '#a5b4fc'],
    manchaCian: ['#22d3ee', '#3b82f6'],
    manchaVioleta: ['#c4b5fd', '#93c5fd'],
  },

  // Sombras suaves (se usan con ...tema.sombra.suave dentro de styled-components).
  sombra: {
    suave: {
      shadowColor: '#2563eb',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    fuerte: {
      shadowColor: '#2563eb',
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
  },

  radio: 14,
  radioGrande: 20,
  radioPildora: 999,
  espacio: { xs: 4, s: 8, m: 12, l: 16, xl: 24 },
  fuente: { chica: 13, normal: 16, subtitulo: 18, titulo: 20, grande: 26 },
} as const;