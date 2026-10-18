import { useRoute } from '@react-navigation/native';
import { EstadoVacio } from '../components/EstadoVacio';
import { Pantalla } from '../styles/componentes';

// Pantalla provisional: se reemplaza por la real en el paso que corresponda a cada módulo.
export function EnConstruccion() {
  const ruta = useRoute();
  return (
    <Pantalla>
      <EstadoVacio icono="construct-outline" mensaje={`Pantalla "${ruta.name}" en construcción`} />
    </Pantalla>
  );
}