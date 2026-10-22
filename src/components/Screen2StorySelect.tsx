import React, { useState } from 'react';
import { CinematicPreview } from './CinematicPreview';
import { ArrowRight, CheckCircle2, Clock, Film, Sparkles, Play, Shield, Compass, Zap } from 'lucide-react';
import { StoryData } from '../types';

interface Screen2StorySelectProps {
  stories: StoryData[];
  selectedStory: StoryData;
  onSelectStory: (story: StoryData) => void;
  onProceed: () => void;
}

export const Screen2StorySelect: React.FC<Screen2StorySelectProps> = ({
  stories,
  selectedStory,
  onSelectStory,
  onProceed,
}) => {
  const [previewStory, setPreviewStory] = useState<StoryData | null>(null);
  const handleSelectStory = (story: StoryData) => {
    onSelectStory(story);
    onProceed();
  };

  const getStoryIcon = (id: string) => {
    if (id === 'kepler-last-light') return <Shield className="w-5 h-5 text-sky-400" />;
    if (id === 'secret-of-the-fog') return <Compass className="w-5 h-5 text-amber-400" />;
    return <Zap className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest">
          <Film className="w-3.5 h-3.5" />
          <span>Etapa 2 · Catálogo de Películas & Escenas Autorizadas</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Elige la película autorizada que deseas protagonizar
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          Selecciona una escena existente de nuestro catálogo cinematográfico. El motor de sustitución facial integrará tus rasgos en el cuerpo y movimiento del actor original.
        </p>
      </div>

      {/* Stories Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story) => {
          const isSelected = selectedStory.id === story.id;
          const leadRole = story.roles[0];

          return (
            <div
              key={story.id}
              onClick={() => handleSelectStory(story)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectStory(story);
                }
              }}
              className={`rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group relative p-5 space-y-4 shadow-xl ${
                isSelected
                  ? 'bg-slate-900 border-sky-400 ring-2 ring-sky-400/40 shadow-sky-950/50 scale-[1.01]'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-3">
                {/* Cover Image & Badges */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950/90 text-sky-300 font-mono text-[10px] uppercase font-bold border border-sky-500/40 shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>{story.badge}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>{story.durationLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Genre & Title */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
                    {getStoryIcon(story.id)}
                    <span>{story.genre}</span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-white group-hover:text-sky-300 transition-colors mt-1">
                    {story.title}
                  </h3>
                  <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                    "{story.tagline}"
                  </p>
                </div>

                {/* Synopsis */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {story.synopsis}
                </p>

                {/* Protagonist to Replace info */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Actor a Sustituir:</span>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{leadRole.rank}</span>
                  </div>
                  <span className="text-[11px] text-sky-300 font-mono block">Rol: {leadRole.name}</span>
                </div>
              </div>

              <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewStory(story); }} className="w-full flex items-center justify-center gap-2 rounded-xl border border-sky-500/50 bg-sky-500/10 py-3 text-xs font-bold uppercase tracking-wider text-sky-200 hover:bg-sky-500/20"><Play size={15} /> Ver tráiler cinematográfico</button>
              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectStory(story);
                  }}
                  className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800 hover:bg-sky-600 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSelected ? 'Historia Seleccionada · Entrar' : 'Protagonizar esta Escena'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewStory && <CinematicPreview story={previewStory} onClose={() => setPreviewStory(null)} onStar={() => { handleSelectStory(previewStory); setPreviewStory(null); }} />}
      {/* Bottom Info Banner */}
      <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            Cada título cuenta con secuencias cinematográficas originales con datos de seguimiento facial 3D, calibración de iluminación y máscaras de oclusión.
          </span>
        </div>
      </div>
    </div>
  );
};
