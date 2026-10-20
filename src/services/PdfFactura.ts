import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// A4 en puntos (1 punto = 1/72 de pulgada).
const ANCHO_A4 = 595;
const ALTO_A4 = 842;

export async function compartirDisponible(): Promise<boolean> {
  return Sharing.isAvailableAsync();
}

// Convierte el HTML en un archivo PDF llamado "FAC-000001.pdf" y devuelve su ubicación.
// El archivo que crea expo-print queda en una carpeta que Expo Go no deja leer ni compartir
// ("Not allowed to read file"). Por eso se pide el contenido en base64 y se escribe una copia
// en la carpeta de caché de la app, que sí está permitida.
export async function crearPdf(html: string, nombreArchivo: string): Promise<string> {
  const { base64 } = await Print.printToFileAsync({
    html,
    width: ANCHO_A4,
    height: ALTO_A4,
    base64: true,
  });
  if (!base64) throw new Error('No se obtuvo el contenido del PDF');

  const archivo = new File(Paths.cache, `${nombreArchivo}.pdf`);
  if (archivo.exists) archivo.delete();
  archivo.create();
  archivo.write(base64, { encoding: 'base64' });
  return archivo.uri;
}

// Abre el menú de compartir del teléfono (guardar, WhatsApp, correo...).
export async function compartirPdf(uri: string, titulo: string): Promise<void> {
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf', // iPhone
    dialogTitle: titulo, // Android
  });
}

// Abre la vista previa del PDF del sistema (desde ahí se puede ver, imprimir o guardar como PDF).
export async function abrirVistaPrevia(html: string): Promise<void> {
  await Print.printAsync({ html, width: ANCHO_A4, height: ALTO_A4 });
}