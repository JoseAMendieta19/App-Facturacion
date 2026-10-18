import * as SQLite from 'expo-sqlite';
import { ESQUEMA_SQL } from './esquema';
import { sembrarDatosIniciales } from './datosIniciales';

const NOMBRE_BD = 'facturacion.db';
const VERSION_ESQUEMA = 1; // súbela si algún día cambias las tablas

// Única conexión de toda la app. Solo los modelos deben importar `db`.
export const db = SQLite.openDatabaseSync(NOMBRE_BD);

export function inicializarBaseDeDatos(): void {
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;'); // no se puede cambiar dentro de una transacción

  const fila = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  if ((fila?.user_version ?? 0) >= VERSION_ESQUEMA) return; // ya estaba creada

  // Todo o nada: si algo falla, no queda una base a medias.
  db.withTransactionSync(() => {
    db.execSync(ESQUEMA_SQL);
    sembrarDatosIniciales(db);
    db.execSync(`PRAGMA user_version = ${VERSION_ESQUEMA};`);
  });
}

