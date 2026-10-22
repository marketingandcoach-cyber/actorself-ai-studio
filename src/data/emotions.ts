import { EmotionGuide } from '../types';

export const EMOTION_GUIDES: EmotionGuide[] = [
  // CORE 4 ACTOR PRO EMOTIONS
  {
    key: 'molesto',
    label: 'Molesto / Tensión',
    category: 'core',
    instruction: 'Frunce el ceño con firmeza y aprieta la mandíbula como si la nave recibiera una sacudida imprevista.',
    narrativeUse: 'Segundo 1–2: Alerta crítica de radiación estelar.',
  },
  {
    key: 'dudoso',
    label: 'Dudoso / Cálculo',
    category: 'core',
    instruction: 'Inclina ligeramente la mirada y entrecierra los ojos calculando si el salto hiperespacial soportará el calor.',
    narrativeUse: 'Segundo 2–3: Evaluación de la trayectoria de escape.',
  },
  {
    key: 'triste',
    label: 'Triste / Despedida',
    category: 'core',
    instruction: 'Expresión melancólica contemplando la estrella Kepler apagándose antes de abandonar el sector.',
    narrativeUse: 'Segundo 3–4: Clímax térmico y cuenta regresiva final.',
  },
  {
    key: 'sonriente',
    label: 'Sonriente / Triunfo',
    category: 'core',
    instruction: 'Sonrisa auténtica de alivio y orgullo de comandante tras haber ejecutado el salto y salvado la misión.',
    narrativeUse: 'Segundo 4–5: Salto completado y revelación del lema ACTORSELF.',
  },

  // STUDIO MODE 4 ADVANCED EMOTIONS
  {
    key: 'sorprendido',
    label: 'Sorprendido',
    category: 'studio',
    instruction: 'Abre los ojos con asombro súbito ante la detonación lumínica de la llamarada estelar.',
    narrativeUse: 'Detalle de impacto en la cúpula frontal.',
  },
  {
    key: 'asustado',
    label: 'Alerta Extrema / Asustado',
    category: 'studio',
    instruction: 'Mirada en tensión máxima cuando el indicador de calor llega al 99%.',
    narrativeUse: 'Transición de riesgo máximo antes del salto.',
  },
  {
    key: 'decidido',
    label: 'Decidido / Mando',
    category: 'studio',
    instruction: 'Mirada inquebrantable de liderazgo dando la orden definitiva de ignición hiperespacial.',
    narrativeUse: 'Comando de ignición de propulsores de subespacio.',
  },
  {
    key: 'pensativo',
    label: 'Pensativo / Estrategia',
    category: 'studio',
    instruction: 'Mirada reflexiva analizando la telemetría holográfica de la consola.',
    narrativeUse: 'Fase de preparación inicial de sistemas.',
  },
];
