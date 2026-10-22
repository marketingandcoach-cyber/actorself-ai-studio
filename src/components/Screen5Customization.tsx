import React from 'react';
import { Sliders, ArrowRight, ArrowLeft, Shield, Sparkles, Check, Compass, Radio } from 'lucide-react';
import { CustomizationConfig, CommanderStyle, AlternateClimax } from '../types';

interface Screen5CustomizationProps {
  config: CustomizationConfig;
  onUpdateConfig: (updated: Partial<CustomizationConfig>) => void;
  onProceed: () => void;
  onBack: () => void;
  participantName: string;
}

export const Screen5Customization: React.FC<Screen5CustomizationProps> = ({
  config,
  onUpdateConfig,
  onProceed,
  onBack,
  participantName,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest">
          <Sliders className="w-3.5 h-3.5" />
          <span>Etapa 5 · Personalización Estética & Narrativa</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Define el estilo de tu Comandante
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          Elige el traje, la atmósfera de la cabina y la ruta del salto espacial. Estas selecciones cambiarán perceptiblemente el resultado del video.
        </p>
      </div>

      {/* Style Choices Grid */}
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
            1. Selección de Estilo de Uniforme & Cabina
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Style 1: Comandante Clásico */}
            <div
              onClick={() => onUpdateConfig({ style: 'classic', lightingTone: 'cyan_deep' })}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 relative overflow-hidden ${
                config.style === 'classic'
                  ? 'bg-slate-900 border-sky-400 shadow-xl shadow-sky-950/40 ring-1 ring-sky-400/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold">
                    I
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-serif">Comandante Clásico</h3>
                    <span className="text-[11px] font-mono text-sky-300">Ciencia Ficción Clásica & Elegante</span>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  config.style === 'classic'
                    ? 'bg-sky-500 border-sky-400 text-slate-950'
                    : 'border-slate-700'
                }`}>
                  {config.style === 'classic' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-700"></span>
                  <span><strong>Traje:</strong> Uniforme de vuelo azul marino imperial con bordes cromados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                  <span><strong>Cabina:</strong> Hologramas cian de alta definición y paneles cristalinos</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Inspirado en la exploración espacial sobria e institucional. La iluminación resalta las estrellas y la serenidad del oficial al mando.
              </p>
            </div>

            {/* Style 2: Comandante Futurista */}
            <div
              onClick={() => onUpdateConfig({ style: 'futuristic', lightingTone: 'amber_hazard' })}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 relative overflow-hidden ${
                config.style === 'futuristic'
                  ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-950/40 ring-1 ring-amber-400/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    II
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-serif">Comandante Futurista</h3>
                    <span className="text-[11px] font-mono text-amber-300">Cybertech & Blindaje Táctico</span>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  config.style === 'futuristic'
                    ? 'bg-amber-500 border-amber-400 text-slate-950'
                    : 'border-slate-700'
                }`}>
                  {config.style === 'futuristic' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600"></span>
                  <span><strong>Traje:</strong> Exotraje de titanio y fibra de carbono con collarín blindado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span><strong>Cabina:</strong> Telemetría holográfica ámbar neón y HUD de combate neural</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Estilo de supervivencia extrema y alta tecnología. Anillos de telemetría neural giratorios que proyectan datos biométricos directamente en la visión del comandante.
              </p>
            </div>
          </div>
        </div>

        {/* Alternate Climax Route (Section 9 Prompt Requirements) */}
        <div className="pt-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
            2. Ruta Narrativa del Salto (Escena Alternativa)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onUpdateConfig({ alternateEnding: 'heroic' })}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                config.alternateEnding === 'heroic'
                  ? 'bg-sky-950/40 border-sky-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-sky-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" /> Final Heroico
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Escape Estable
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                El salto se ejecuta con precisión milimétrica hacia las coordenadas de reunión de la flota colonial.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onUpdateConfig({ alternateEnding: 'mystery' })}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                config.alternateEnding === 'mystery'
                  ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4" /> Final Misterioso
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Señal Desconocida
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                En el microsegundo antes del salto, el sensor capta una señal de radio desconocida en la frecuencia de 1420 MHz.
              </p>
            </button>
          </div>
        </div>

        {/* Duration Selection (15s Extended vs 5s Rapid) */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
            3. Duración de la Escena & Montaje de Planos
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onUpdateConfig({ cinematicDurationSec: 15 })}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                (config.cinematicDurationSec || 15) === 15
                  ? 'bg-sky-950/40 border-sky-400 text-white shadow-md ring-1 ring-sky-400/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" /> 15 Segundos (Recomendado)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                  4 Planos Cinematográficos
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Secuencia completa estilo superproducción: Plano medio de cabina, primer plano dramático del rostro ante la alarma, ángulo táctico de aceleración y salto hiperespacial con letrero estelar.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onUpdateConfig({ cinematicDurationSec: 5 })}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                config.cinematicDurationSec === 5
                  ? 'bg-amber-950/40 border-amber-400 text-white shadow-md ring-1 ring-amber-400/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                  5 Segundos
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Demo Rápida
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Demostración condensada para revisiones veloces. Conserva la integración facial en el traje espacial en un corte dinámico de 5 segundos.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar</span>
        </button>

        <button
          onClick={onProceed}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Ir al Generador de Escena</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
