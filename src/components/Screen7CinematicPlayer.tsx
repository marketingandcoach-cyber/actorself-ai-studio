import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Film,
  CheckCircle2,
  Tv,
  Share2,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { GeneratedSceneResult, StoryData } from '../types';

interface Screen7CinematicPlayerProps {
  result: GeneratedSceneResult;
  story: StoryData;
  onGenerateAnother: () => void;
  onReturnToCatalog: () => void;
  onOpenArchitecture: () => void;
}

export const Screen7CinematicPlayer: React.FC<Screen7CinematicPlayerProps> = ({
  result,
  story,
  onGenerateAnother,
  onReturnToCatalog,
  onOpenArchitecture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const fileSizeMb = (result.fileSizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-sky-950/30 to-slate-900 border border-emerald-500/40 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-serif">
              ¡Escena Cinematográfica Generada con Éxito!
            </h3>
            <p className="text-xs text-slate-300">
              Comandante <strong>{result.participantName.toUpperCase()}</strong> integrado en el puente de mando de Kepler-One.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400 font-bold">
          5.0 Segundos · 60 FPS
        </span>
      </div>

      {/* Main Video Player Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl">
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-slate-800 shadow-2xl group">
          <video
            ref={videoRef}
            src={result.videoBlobUrl}
            controls
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={result.videoBlobUrl}
              download={`ACTORSELF_${result.participantName.replace(/\s+/g, '_')}_Kepler.webm`}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar video (.webm)</span>
            </a>

            <button
              onClick={onGenerateAnother}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Generar otra versión</span>
            </button>
          </div>

          <button
            onClick={onReturnToCatalog}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
          >
            Regresar al catálogo
          </button>
        </div>

        {/* Technical Scene Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Resolución / Aspecto:</span>
            <span className="font-bold text-white font-mono">1920x1080 (16:9)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Duración Exacta:</span>
            <span className="font-bold text-sky-300 font-mono">5.0 segundos</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Estilo Aplicado:</span>
            <span className="font-bold text-amber-300">
              {result.style === 'classic' ? 'Comandante Clásico' : 'Comandante Futurista'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Peso del Video:</span>
            <span className="font-bold text-white font-mono">{fileSizeMb} MB</span>
          </div>
        </div>
      </div>

      {/* Commercial Vision & Hackathon Information Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-base font-bold text-white font-serif flex items-center gap-2">
            <Tv className="w-5 h-5 text-sky-400" />
            <span>Visión Comercial para el Ecosistema Amazon Prime Video & Fire TV</span>
          </h4>
          <button
            onClick={onOpenArchitecture}
            className="text-xs text-sky-400 hover:text-sky-300 font-mono underline cursor-pointer"
          >
            Ver Dossier Técnico
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white font-mono block">1. Modelo de Acceso Prime</span>
            <p className="text-slate-400 leading-relaxed">
              El creador y los invitados deben poseer una membresía Prime activa y derechos sobre el título para visualizar la película completa personalizada.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white font-mono block">2. Tráiler Promocional</span>
            <p className="text-slate-400 leading-relaxed">
              Los usuarios externos pueden disfrutar del clip promocional de su participación sin acceder a la película completa sin licencia.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white font-mono block">3. Integración Fire TV</span>
            <p className="text-slate-400 leading-relaxed">
              Preparación de la escena desde la app móvil o web y reproducción posterior en televisor mediante la app nativa para Fire TV y comandos Alexa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
