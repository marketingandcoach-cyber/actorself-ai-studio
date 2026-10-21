import React, { useState } from 'react';
import { Film, Play, Sparkles, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { ParticipantProfile, CustomizationConfig, GeneratedSceneResult } from '../types';
import { generateCinematicScene } from '../utils/cinematicEngine';

interface Screen6SceneGeneratorProps {
  participant: ParticipantProfile;
  config: CustomizationConfig;
  onSceneGenerated: (result: GeneratedSceneResult) => void;
  onBack: () => void;
}

export const Screen6SceneGenerator: React.FC<Screen6SceneGeneratorProps> = ({
  participant,
  config,
  onSceneGenerated,
  onBack,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressFraction, setProgressFraction] = useState<number>(0);
  const [currentPhaseText, setCurrentPhaseText] = useState<string>('Esperando inicio de renderizado...');
  const [error, setError] = useState<string | null>(null);

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setProgressFraction(0);
    setError(null);

    try {
      const { videoBlob, videoUrl, durationSec } = await generateCinematicScene(
        participant,
        config,
        (progress, phaseText) => {
          setProgressFraction(progress);
          setCurrentPhaseText(phaseText);
        }
      );

      const result: GeneratedSceneResult = {
        id: `scene-${Date.now()}`,
        videoBlobUrl: videoUrl,
        videoBlob,
        durationSec,
        timestamp: Date.now(),
        participantName: participant.name,
        style: config.style,
        ending: config.alternateEnding,
        resolution: '1920x1080 (16:9 Full HD)',
        fileSizeBytes: videoBlob.size,
      };

      onSceneGenerated(result);
    } catch (err: any) {
      console.error('Error generando escena cinemática:', err);
      setError(err.message || 'Ocurrió un error al procesar el video y audio en el navegador.');
      setIsGenerating(false);
    }
  };

  const narrativeBeats = [
    { sec: '0–1s', desc: 'Interior de la fragata Kepler-One y paneles holográficos activos.' },
    { sec: '1–2s', desc: 'Alarma crítica de estrella inestable y maniobra evasiva.' },
    { sec: '2–3s', desc: `Integración visual de ${participant.name.toUpperCase()} en el puesto de mando.` },
    { sec: '3–4s', desc: 'Sobrecarga luminosa estelar y cuenta regresiva hiperespacial.' },
    { sec: '4–5s', desc: 'Salto hiperespacial ejecutado y revelación del lema ACTORSELF.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest">
          <Film className="w-3.5 h-3.5" />
          <span>Etapa 6 · Generación Audiovisual Real</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Crea tu escena de 5 segundos
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          El motor de composición procesará fotograma a fotograma tu integración en la cabina espacial a 60 FPS con síntesis sonora cinematográfica.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Generation Console Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Título a Generar:</span>
            <h3 className="text-xl font-bold font-serif text-white">
              ACTORSELF: Última luz de Kepler
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sky-300">
              Estilo: {config.style === 'classic' ? 'Comandante Clásico' : 'Comandante Futurista'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
              Final: {config.alternateEnding === 'heroic' ? 'Heroico' : 'Señal Misteriosa'}
            </span>
          </div>
        </div>

        {/* Narrative Roadmap */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Secuencia Narrativa Oficial (5.0 Segundos)
          </span>

          <div className="space-y-2">
            {narrativeBeats.map((beat, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
              >
                <span className="font-mono text-sky-400 font-bold shrink-0 w-12">{beat.sec}</span>
                <span className="text-slate-200">{beat.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress or Trigger Area */}
        {isGenerating ? (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-sky-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>{currentPhaseText}</span>
              </span>
              <span className="text-slate-300 font-bold">
                {Math.round(progressFraction * 100)}%
              </span>
            </div>

            {/* Real Progress Bar (No fake percentages) */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${Math.min(100, Math.max(2, progressFraction * 100))}%` }}
              ></div>
            </div>

            <p className="text-[11px] font-mono text-slate-500 text-center">
              Renderizando fotogramas en navegador y sintetizando audio espacial...
            </p>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ajustar personalización previa</span>
            </button>

            <button
              onClick={handleStartGeneration}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-sky-950/60 hover:shadow-sky-500/20 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-3 group"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Crear mi escena de 5 segundos</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
