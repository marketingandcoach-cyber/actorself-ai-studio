import React, { useState } from 'react';
import { Film, Play, Sparkles, AlertCircle, ArrowLeft, Loader2, CheckCircle2, Cpu, Server, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { ParticipantProfile, CustomizationConfig, GeneratedSceneResult, CinematicSceneDefinition } from '../types';
import { generateCinematicScene } from '../utils/cinematicEngine';
import { CINEMATIC_SCENES } from '../data/scenes';
import { AI_PIPELINE_MODELS } from '../data/aiPipelineSpecs';

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
  const [showPipelineDetails, setShowPipelineDetails] = useState<boolean>(false);
  const liveCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Active scene
  const activeSceneId = config.selectedSceneId || 'kepler-hyperspace-jump';
  const sceneDef: CinematicSceneDefinition =
    CINEMATIC_SCENES.find((s) => s.id === activeSceneId) || CINEMATIC_SCENES[0];

  const durationSec = config.cinematicDurationSec || sceneDef.durationSec || 15;

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setProgressFraction(0.01);
    setError(null);
    setCurrentPhaseText('Calibrando rasgos faciales y perspectiva 3D...');

    try {
      const {
        videoBlob,
        videoUrl,
        durationSec: genDuration,
        usedExpressionsCount,
        sceneTitle,
        replacedActorName,
      } = await generateCinematicScene(
        participant,
        config,
        (progress, phaseText) => {
          setProgressFraction(progress);
          setCurrentPhaseText(phaseText);
        },
        liveCanvasRef.current
      );

      const result: GeneratedSceneResult = {
        id: `scene-${Date.now()}`,
        videoBlobUrl: videoUrl,
        videoBlob,
        durationSec: genDuration,
        timestamp: Date.now(),
        participantName: participant.name,
        style: config.style,
        ending: config.alternateEnding,
        resolution: '1920x1080 (16:9 Full HD)',
        fileSizeBytes: videoBlob.size,
        usedExpressionsCount,
        sceneTitle: sceneTitle || sceneDef.title,
        replacedActorName: replacedActorName || sceneDef.originalActorName,
      };

      onSceneGenerated(result);
    } catch (err: any) {
      console.error('Error generando escena cinemática:', err);
      setError('Ocurrió una pausa en la grabación. Haz clic en "Reintentar renderizado" para ejecutar la composición.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest">
          <Film className="w-3.5 h-3.5" />
          <span>Etapa 6 · Generación & Sustitución Facial Cinematográfica</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Entra en la escena de {durationSec} segundos
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          El motor de composición procesará fotograma a fotograma la sustitución facial sobre el metraje original, ajustando la perspectiva 3D, sombras, iluminación y oclusiones para convertirte en el actor principal.
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
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Escena Cinematográfica:</span>
            <h3 className="text-xl font-bold font-serif text-white">
              {sceneDef.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-sky-950/60 border border-sky-800 text-sky-300 font-bold">
              {durationSec}s · 4 Planos
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              1080p 60 FPS
            </span>
          </div>
        </div>

        {/* Protagonist Facial Swap Verification Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-900/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-md shrink-0 bg-slate-900">
                {participant.photoDataUrl ? (
                  <img
                    src={participant.photoDataUrl}
                    alt={participant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Sin foto</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center pb-0.5">
                  <span className="text-[9px] font-mono font-bold text-sky-300">NUEVO ROSTRO</span>
                </div>
              </div>

              {participant.fullBodyDataUrl && (
                <div className="relative w-12 h-16 rounded-xl overflow-hidden border border-amber-400/80 shadow-md shrink-0 bg-slate-900">
                  <img
                    src={participant.fullBodyDataUrl}
                    alt="Cuerpo Completo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center pb-0.5">
                    <span className="text-[8px] font-mono font-bold text-amber-300">CUERPO</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-mono">{participant.name.toUpperCase()}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Protagonista Activo
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Sustituyendo a: <strong className="text-sky-300">{sceneDef.originalActorName}</strong> en el metraje oficial.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 flex items-center gap-1 sm:justify-end">
                <ShieldCheck className="w-3.5 h-3.5" /> Consentimiento Válido
              </span>
              <span>Seguimiento 3D + Reiluminación</span>
            </div>
          </div>

          {/* Biometric & Capture Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Expresiones: {Object.keys(participant.expressions).length} registradas
            </span>
            {participant.motionVideoUrl && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Rostro en Movimiento Calibrado (3D)
              </span>
            )}
            {participant.fullBodyDataUrl && (
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                Cuerpo Completo Calibrado (Traje & Silueta)
              </span>
            )}
          </div>
        </div>

        {/* Narrative Roadmap with 4 Camera Shots */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Plan de Rodaje Cinematográfico ({durationSec}.0s · 4 Planos de Cámara)
          </span>

          <div className="space-y-2">
            {sceneDef.shots.map((shot, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
              >
                <span className="font-mono text-sky-400 font-bold shrink-0 w-28">
                  Plano {shot.shotNumber} ({shot.durationSec}s)
                </span>
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">{shot.name}</span>
                  <span className="text-slate-300">{shot.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Pipeline Architecture Inspector (Requirement 7) */}
        <div className="border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPipelineDetails(!showPipelineDetails)}
            className="w-full p-4 flex items-center justify-between text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Evaluación de Modelos & Pipeline IA (Local vs Cloud GPU)</span>
            </span>
            {showPipelineDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPipelineDetails && (
            <div className="p-4 border-t border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AI_PIPELINE_MODELS.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      model.status === 'active_local'
                        ? 'bg-sky-950/30 border-sky-500/50 text-sky-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{model.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        model.status === 'active_local' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {model.status === 'active_local' ? 'MOTOR ACTIVO' : 'EVALUACIÓN CLOUD'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{model.description}</p>
                    <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80 space-y-0.5">
                      <div><strong>Latencia:</strong> {model.latencySeconds}</div>
                      <div><strong>Costos:</strong> {model.costPerMinute}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress or Trigger Area */}
        {isGenerating ? (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            {/* Live Cinematic Viewport Canvas */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border-2 border-sky-500 shadow-2xl">
              <canvas
                ref={liveCanvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />

              {/* HUD Telemetry Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-950/85 border border-sky-400 text-sky-300 font-mono text-[10px] flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  EN VIVO · SUSTITUCIÓN FACIAL 60 FPS
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-950/85 border border-slate-700 text-white font-mono text-[10px]">
                  {participant.name.toUpperCase()}
                </span>
              </div>

              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/85 border border-slate-700 text-sky-400 font-mono text-[10px]">
                {Math.round(progressFraction * 100)}% COMPLETADO
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-sky-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>{currentPhaseText}</span>
              </span>
              <span className="text-slate-300 font-bold">
                {Math.round(progressFraction * 100)}%
              </span>
            </div>

            {/* Real Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${Math.min(100, Math.max(2, progressFraction * 100))}%` }}
              ></div>
            </div>

            <p className="text-[11px] font-mono text-slate-500 text-center">
              Renderizando fotogramas con deformación 3D, reiluminación y síntesis de audio espacial...
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
              <span>Crear mi escena de {durationSec} segundos</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
