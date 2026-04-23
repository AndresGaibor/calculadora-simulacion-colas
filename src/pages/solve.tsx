import { NewExercisePage } from "./new-exercise";

// Ruta de compatibilidad para /solve.
// Reutiliza el flujo principal de cálculo para no duplicar lógica.
export function SolvePage() {
  return <NewExercisePage />;
}

export default SolvePage;
