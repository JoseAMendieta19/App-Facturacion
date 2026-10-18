import { useMemo } from 'react';
import { type Opcion, SelectorBuscable } from './SelectorBuscable';

export type ProvinciaOpcion = { id: number; nombre: string };
export type CiudadOpcion = { id: number; nombre: string; provinciaId: number };

type Props = {
  provincias: ProvinciaOpcion[];
  ciudades: CiudadOpcion[]; // todas; este componente muestra solo las de la provincia elegida
  provinciaId: number | null;
  ciudadId: number | null;
  onCambiar: (provinciaId: number | null, ciudadId: number | null) => void;
  errorProvincia?: string;
  errorCiudad?: string;
};

// Provincia y ciudad en cascada. No consulta la base: recibe las listas ya cargadas por la vista.
export function SelectorProvinciaCiudad({
  provincias,
  ciudades,
  provinciaId,
  ciudadId,
  onCambiar,
  errorProvincia,
  errorCiudad,
}: Props) {
  const opcionesProvincia = useMemo<Opcion[]>(
    () => provincias.map((p) => ({ id: p.id, texto: p.nombre })),
    [provincias]
  );

  const opcionesCiudad = useMemo<Opcion[]>(
    () =>
      ciudades
        .filter((c) => c.provinciaId === provinciaId)
        .map((c) => ({ id: c.id, texto: c.nombre })),
    [ciudades, provinciaId]
  );

  function alElegirProvincia(id: number) {
    if (id === provinciaId) return; // misma provincia: se conserva la ciudad
    onCambiar(id, null); // otra provincia: la ciudad anterior ya no corresponde
  }

  return (
    <>
      <SelectorBuscable
        etiqueta="Provincia"
        obligatorio
        opciones={opcionesProvincia}
        valorId={provinciaId}
        onSeleccionar={alElegirProvincia}
        placeholder="Seleccione una provincia"
        error={errorProvincia}
      />
      <SelectorBuscable
        etiqueta="Ciudad"
        obligatorio
        opciones={opcionesCiudad}
        valorId={ciudadId}
        onSeleccionar={(id) => onCambiar(provinciaId, id)}
        placeholder="Seleccione una ciudad"
        deshabilitado={provinciaId === null}
        mensajeDeshabilitado="Primero elija una provincia"
        mensajeVacio="Esta provincia no tiene ciudades registradas"
        error={errorCiudad}
      />
    </>
  );
}