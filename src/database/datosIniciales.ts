import type { SQLiteDatabase } from 'expo-sqlite';

// [código, nombre]. Códigos de provincia: numeración oficial 01-24.
const PROVINCIAS: [string, string][] = [
  ['01', 'Azuay'], ['02', 'Bolívar'], ['03', 'Cañar'], ['04', 'Carchi'],
  ['05', 'Cotopaxi'], ['06', 'Chimborazo'], ['07', 'El Oro'], ['08', 'Esmeraldas'],
  ['09', 'Guayas'], ['10', 'Imbabura'], ['11', 'Loja'], ['12', 'Los Ríos'],
  ['13', 'Manabí'], ['14', 'Morona Santiago'], ['15', 'Napo'], ['16', 'Pastaza'],
  ['17', 'Pichincha'], ['18', 'Tungurahua'], ['19', 'Zamora Chinchipe'],
  ['20', 'Galápagos'], ['21', 'Sucumbíos'], ['22', 'Orellana'],
  ['23', 'Santo Domingo de los Tsáchilas'], ['24', 'Santa Elena'],
];

// [código interno, nombre, código de la provincia]
const CIUDADES: [string, string, string][] = [
  ['CIU-001', 'Chone', '13'], ['CIU-002', 'Portoviejo', '13'],
  ['CIU-003', 'Manta', '13'], ['CIU-004', 'El Carmen', '13'],
  ['CIU-005', 'Guayaquil', '09'], ['CIU-006', 'Durán', '09'],
  ['CIU-007', 'Milagro', '09'], ['CIU-008', 'Quito', '17'],
  ['CIU-009', 'Cayambe', '17'], ['CIU-010', 'Cuenca', '01'],
  ['CIU-011', 'Loja', '11'], ['CIU-012', 'Ambato', '18'],
  ['CIU-013', 'Esmeraldas', '08'], ['CIU-014', 'Santo Domingo', '23'],
  ['CIU-015', 'Machala', '07'], ['CIU-016', 'Babahoyo', '12'],
  ['CIU-017', 'Riobamba', '06'], ['CIU-018', 'Ibarra', '10'],
  ['CIU-019', 'Latacunga', '05'],
];

// Tarifa general vigente: 15% (SRI). Verificar antes de entregar.
const IVAS: [string, number][] = [
  ['IVA 0%', 0],
  ['IVA 15%', 15],
];

// Debe ejecutarse dentro de una transacción (lo hace inicializarBaseDeDatos).
export function sembrarDatosIniciales(db: SQLiteDatabase): void {
  for (const [codigo, nombre] of PROVINCIAS) {
    db.runSync(
      'INSERT INTO t_provincia (prov_codigo, prov_nombres) VALUES (?, ?)',
      [codigo, nombre]
    );
  }
  for (const [codigo, nombre, codProvincia] of CIUDADES) {
    db.runSync(
      `INSERT INTO t_ciudad (ciu_codigo, ciud_nombre, prov_id)
       VALUES (?, ?, (SELECT prov_id FROM t_provincia WHERE prov_codigo = ?))`,
      [codigo, nombre, codProvincia]
    );
  }
  for (const [nombre, valor] of IVAS) {
    db.runSync('INSERT INTO t_iva (iva_nombre, iva_valor) VALUES (?, ?)', [nombre, valor]);
  }
}