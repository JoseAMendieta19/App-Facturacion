import { useRef, useState } from 'react';

// Evita guardar dos veces: mientras una tarea está en curso se ignoran los toques nuevos
// y `guardando` vale true (para desactivar el botón y mostrar el indicador).
export function useGuardando() {
  const [guardando, setGuardando] = useState(false);
  const enCurso = useRef(false); // bloquea al instante, antes de que React redibuje

  async function ejecutar(tarea: () => void | Promise<void>): Promise<void> {
    if (enCurso.current) return;
    enCurso.current = true;
    setGuardando(true);
    try {
      // Cede un instante para que la pantalla pinte el botón desactivado.
      await new Promise<void>((resolver) => setTimeout(resolver, 0));
      await tarea();
    } finally {
      enCurso.current = false;
      setGuardando(false);
    }
  }

  return { guardando, ejecutar };
}