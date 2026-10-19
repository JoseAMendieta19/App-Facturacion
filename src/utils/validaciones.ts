import { esFechaPasada, esFechaValida } from './formato';

// Errores campo por campo: { cedula: 'mensaje', correo: 'mensaje' }. Vacío = todo bien.
export type Errores<K extends string = string> = Partial<Record<K, string>>;

export function hayErrores(errores: Errores<string>): boolean {
  return Object.keys(errores).length > 0;
}

const LETRA = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';

/* ---------- Limpieza y filtrado (se usan mientras el usuario escribe) ---------- */

// Quita espacios al inicio/final y junta los repetidos: "  Juan   Pérez " -> "Juan Pérez"
export function limpiarEspacios(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ');
}

export function normalizarCorreo(texto: string): string {
  return texto.trim().toLowerCase();
}

// Solo dígitos, con tope de longitud. También elimina lo que se pegue (letras, símbolos).
export function filtrarNumeros(texto: string, maxDigitos: number): string {
  return texto.replace(/\D/g, '').slice(0, maxDigitos);
}

// Dígitos y un solo punto decimal. Acepta la coma como punto. Limita enteros y decimales.
export function filtrarDecimal(texto: string, maxEnteros = 8, maxDecimales = 2): string {
  const limpio = texto.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const [enteros = '', decimales] = limpio.split('.');
  const parteEntera = enteros.slice(0, maxEnteros);
  if (decimales === undefined || maxDecimales === 0) return parteEntera;
  return `${parteEntera}.${decimales.slice(0, maxDecimales)}`;
}

// Fecha mientras se escribe: solo dígitos, y agrega los guiones solos -> "20261231" = "2026-12-31"
export function filtrarFecha(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

// Solo letras (con tildes y ñ) y espacios.
export function filtrarLetras(texto: string): string {
  return texto.replace(new RegExp(`[^${LETRA} ]`, 'g'), '');
}

// Para comparar duplicados: minúsculas, sin tildes (conserva la ñ) y sin espacios sobrantes.
// "Manabí" y " MANABI " dan el mismo resultado: "manabi".
export function normalizarTexto(texto: string): string {
  return limpiarEspacios(texto)
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u');
}

/* ---------- Validaciones: devuelven el mensaje de error o null si está bien ---------- */

// "El nombre es obligatorio" / "La serie es obligatoria" (concuerda con el artículo de la etiqueta).
function mensajeObligatorio(etiqueta: string): string {
  return `${etiqueta} es ${/^la\s/i.test(etiqueta) ? 'obligatoria' : 'obligatorio'}`;
}

export function validarObligatorio(valor: string, etiqueta: string): string | null {
  return limpiarEspacios(valor) === '' ? mensajeObligatorio(etiqueta) : null;
}

export function validarLongitudMax(valor: string, max: number, etiqueta: string): string | null {
  return limpiarEspacios(valor).length > max
    ? `${etiqueta} admite máximo ${max} caracteres`
    : null;
}

// Obligatorio + longitud máxima (el caso más común de los textos del modelo).
export function validarTexto(valor: string, etiqueta: string, max = 45): string | null {
  return validarObligatorio(valor, etiqueta) ?? validarLongitudMax(valor, max, etiqueta);
}

export function validarSoloLetras(valor: string, etiqueta: string, max = 45): string | null {
  const error = validarTexto(valor, etiqueta, max);
  if (error) return error;
  const patron = new RegExp(`^[${LETRA}]+( [${LETRA}]+)*$`);
  return patron.test(limpiarEspacios(valor))
    ? null
    : `${etiqueta} solo puede contener letras y espacios`;
}

export function validarCorreo(valor: string, etiqueta = 'El correo'): string | null {
  const error = validarObligatorio(valor, etiqueta) ?? validarLongitudMax(valor, 45, etiqueta);
  if (error) return error;
  const patron = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
  return patron.test(normalizarCorreo(valor)) ? null : `${etiqueta} no tiene un formato válido`;
}

// Exactamente 10 dígitos numéricos.
export function validarTelefono(valor: string, etiqueta = 'El teléfono'): string | null {
  const t = valor.trim();
  if (t === '') return mensajeObligatorio(etiqueta);
  if (!/^\d+$/.test(t)) return `${etiqueta} solo puede contener números`;
  if (t.length < 10) return `${etiqueta} debe tener 10 dígitos (faltan ${10 - t.length})`;
  if (t.length > 10) return `${etiqueta} debe tener exactamente 10 dígitos`;
  return null;
}

// Algoritmo oficial (módulo 10): provincia 01-24 (o 30), tercer dígito menor a 6,
// coeficientes 2,1,2,1,2,1,2,1,2 y dígito verificador.
export function esCedulaEcuatorianaValida(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = Number(cedula.slice(0, 2));
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return false;
  if (Number(cedula[2]) >= 6) return false;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let producto = Number(cedula[i]) * coeficientes[i];
    if (producto > 9) producto -= 9;
    suma += producto;
  }
  const verificador = (10 - (suma % 10)) % 10;
  return verificador === Number(cedula[9]);
}

export function validarCedula(valor: string, etiqueta = 'La cédula'): string | null {
  const c = valor.trim();
  if (c === '') return `${etiqueta} es obligatoria`;
  if (!/^\d+$/.test(c)) return `${etiqueta} solo puede contener números`;
  if (c.length < 10) return `${etiqueta} debe tener 10 dígitos (faltan ${10 - c.length})`;
  if (c.length > 10) return `${etiqueta} debe tener exactamente 10 dígitos`;
  return esCedulaEcuatorianaValida(c) ? null : `${etiqueta} no es una cédula ecuatoriana válida`;
}

type OpcionesNumero = {
  min?: number;
  max?: number;
  minExclusivo?: boolean; // true: el valor debe ser MAYOR que min (no igual)
  maxDecimales?: number; // 0 = solo enteros. Por defecto 2
};

export function validarNumero(
  valor: string,
  etiqueta: string,
  { min, max, minExclusivo = false, maxDecimales = 2 }: OpcionesNumero = {}
): string | null {
  const t = valor.trim();
  if (t === '') return mensajeObligatorio(etiqueta);
  const patron = maxDecimales === 0 ? /^\d+$/ : /^\d+(\.\d+)?$/;
  if (!patron.test(t)) {
    return maxDecimales === 0
      ? `${etiqueta} debe ser un número entero`
      : `${etiqueta} debe ser un número válido`;
  }
  const decimales = t.split('.')[1]?.length ?? 0;
  if (decimales > maxDecimales) return `${etiqueta} admite máximo ${maxDecimales} decimales`;
  const n = Number(t);
  if (min !== undefined && (minExclusivo ? n <= min : n < min)) {
    return `${etiqueta} debe ser ${minExclusivo ? 'mayor que' : 'mayor o igual a'} ${min}`;
  }
  if (max !== undefined && n > max) return `${etiqueta} no puede ser mayor a ${max}`;
  return null;
}

// AAAA-MM-DD real. Con { noPasada: true } rechaza fechas anteriores a hoy.
export function validarFecha(
  valor: string,
  etiqueta: string,
  { noPasada = false }: { noPasada?: boolean } = {}
): string | null {
  const t = valor.trim();
  if (t === '') return `${etiqueta} es obligatoria`;
  if (!esFechaValida(t)) return `${etiqueta} debe tener el formato AAAA-MM-DD y ser una fecha real`;
  if (noPasada && esFechaPasada(t)) return `${etiqueta} no puede ser una fecha pasada`;
  return null;
}

// Quita los campos sin error: { cedula: 'msg', correo: null } -> { cedula: 'msg' }
export function juntarErrores<K extends string>(resultados: Record<K, string | null>): Errores<K> {
  const errores: Errores<K> = {};
  for (const campo of Object.keys(resultados) as K[]) {
    const mensaje = resultados[campo];
    if (mensaje) errores[campo] = mensaje;
  }
  return errores;
}