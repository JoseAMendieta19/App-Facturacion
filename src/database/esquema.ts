// Esquema SQL de las 9 tablas. Nombres y columnas exactamente como el diagrama.
// Las restricciones UNIQUE / NOT NULL / CHECK son una red de seguridad extra.
export const ESQUEMA_SQL = `
CREATE TABLE IF NOT EXISTS t_provincia (
  prov_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  prov_codigo  TEXT NOT NULL UNIQUE,
  prov_nombres TEXT NOT NULL COLLATE NOCASE UNIQUE
);

CREATE TABLE IF NOT EXISTS t_ciudad (
  ciud_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  ciu_codigo  TEXT NOT NULL UNIQUE,
  ciud_nombre TEXT NOT NULL,
  prov_id     INTEGER NOT NULL,
  FOREIGN KEY (prov_id) REFERENCES t_provincia (prov_id) ON DELETE RESTRICT,
  UNIQUE (prov_id, ciud_nombre COLLATE NOCASE)
);

CREATE TABLE IF NOT EXISTS t_proveedor (
  provee_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  provee_codigo    TEXT NOT NULL UNIQUE,
  provee_nombre    TEXT NOT NULL COLLATE NOCASE UNIQUE,
  provee_telefono  TEXT NOT NULL,
  prov_id          INTEGER NOT NULL,
  ciud_id          INTEGER NOT NULL,
  provee_direccion TEXT NOT NULL,
  FOREIGN KEY (prov_id) REFERENCES t_provincia (prov_id) ON DELETE RESTRICT,
  FOREIGN KEY (ciud_id) REFERENCES t_ciudad (ciud_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS t_vendedor (
  vend_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  vend_codigo   TEXT NOT NULL UNIQUE,
  vend_nombre   TEXT NOT NULL,
  vend_correo   TEXT NOT NULL UNIQUE,
  vend_telefono TEXT NOT NULL,
  prov_id       INTEGER NOT NULL,
  ciud_id       INTEGER NOT NULL,
  FOREIGN KEY (prov_id) REFERENCES t_provincia (prov_id) ON DELETE RESTRICT,
  FOREIGN KEY (ciud_id) REFERENCES t_ciudad (ciud_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS t_cliente (
  cli_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  cli_cedula    TEXT NOT NULL UNIQUE,
  cli_nombres   TEXT NOT NULL,
  cli_correo    TEXT NOT NULL UNIQUE,
  cli_telefono  TEXT NOT NULL,
  cli_direccion TEXT NOT NULL,
  ciud_id       INTEGER NOT NULL,
  prov_id       INTEGER NOT NULL,
  FOREIGN KEY (ciud_id) REFERENCES t_ciudad (ciud_id) ON DELETE RESTRICT,
  FOREIGN KEY (prov_id) REFERENCES t_provincia (prov_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS t_iva (
  iva_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  iva_nombre TEXT NOT NULL COLLATE NOCASE UNIQUE,
  iva_valor  REAL NOT NULL UNIQUE CHECK (iva_valor >= 0 AND iva_valor <= 100)
);

CREATE TABLE IF NOT EXISTS t_productos (
  produc_id          INTEGER PRIMARY KEY AUTOINCREMENT,
  produc_serie       TEXT NOT NULL UNIQUE,
  produc_nombre      TEXT NOT NULL,
  produc_cantidad    REAL NOT NULL CHECK (produc_cantidad >= 0),
  provee_id          INTEGER NOT NULL,
  produc_fecha_venci TEXT NOT NULL,
  produc_precio      REAL NOT NULL CHECK (produc_precio > 0),
  FOREIGN KEY (provee_id) REFERENCES t_proveedor (provee_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS t_factura (
  fac_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  fac_numero    TEXT NOT NULL UNIQUE,
  fac_fecha     TEXT NOT NULL,
  cli_id        INTEGER NOT NULL,
  vend_id       INTEGER NOT NULL,
  fac_subtotal  REAL NOT NULL CHECK (fac_subtotal >= 0),
  iva_id        INTEGER NOT NULL,
  fac_descuento REAL NOT NULL DEFAULT 0 CHECK (fac_descuento >= 0),
  fac_total     REAL NOT NULL CHECK (fac_total >= 0),
  FOREIGN KEY (cli_id)  REFERENCES t_cliente (cli_id)   ON DELETE RESTRICT,
  FOREIGN KEY (vend_id) REFERENCES t_vendedor (vend_id) ON DELETE RESTRICT,
  FOREIGN KEY (iva_id)  REFERENCES t_iva (iva_id)       ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS t_detalle_factura (
  det_fac_id              INTEGER PRIMARY KEY AUTOINCREMENT,
  fac_id                  INTEGER NOT NULL,
  produc_id               INTEGER NOT NULL,
  det_fac_cant            REAL NOT NULL CHECK (det_fac_cant > 0),
  det_fac_precio_unitario REAL NOT NULL CHECK (det_fac_precio_unitario >= 0),
  det_fac_total           REAL NOT NULL CHECK (det_fac_total >= 0),
  FOREIGN KEY (fac_id)    REFERENCES t_factura (fac_id)      ON DELETE RESTRICT,
  FOREIGN KEY (produc_id) REFERENCES t_productos (produc_id) ON DELETE RESTRICT
);
`;