import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Film, Lock, Sparkles } from 'lucide-react';
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
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest">
          <Film className="w-3.5 h-3.5" />
          <span>Etapa 2 · Catálogo de Experiencias</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Selecciona una historia cinematográfica
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          Explora los títulos elegibles para personalización audiovisual. Para esta demostración, la escena original de 5 segundos te llevará a los confines de la galaxia.
        </p>
      </div>

      {/* Featured Primary Story: Kepler Last Light */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/80 border-2 border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left: Poster / Cover Image */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-video lg:aspect-[4/3] bg-slate-950 border border-slate-800 shadow-xl">
          <img
            src={selectedStory.coverImage}
            alt={selectedStory.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-sky-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider font-mono shadow-lg">
              {selectedStory.badge}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{selectedStory.durationLabel}</span>
            </span>
            <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80">
              Formato 16:9 Full HD
            </span>
          </div>
        </div>

        {/* Right: Metadata & Synopsis */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              {selectedStory.genre}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
              {selectedStory.title}
            </h3>
            <p className="text-sm font-medium text-sky-200 italic">
              "{selectedStory.tagline}"
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {selectedStory.synopsis}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-mono text-slate-500 uppercase block text-[10px]">Ambientación:</span>
            <span>{selectedStory.setting}</span>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onProceed}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-950/50 transition-all cursor-pointer flex items-center gap-2 group/btn"
            >
              <span>Elegir esta historia</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Lista para personalización inmediata</span>
            </span>
          </div>
        </div>
      </div>

      {/* Future Stories Catalog (Teaser for Prime Video vision) */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-base font-bold text-white font-serif flex items-center gap-2">
            <span>Próximas historias en el ecosistema</span>
            <span className="text-[11px] font-mono font-normal text-slate-500">(Futuras expansiones de catálogo)</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stories.filter(s => !s.isAvailable).map(story => (
            <div
              key={story.id}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3 opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover filter grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-slate-300 text-xs font-mono border border-slate-700">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{story.badge}</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{story.genre}</span>
                <h5 className="text-base font-bold text-white font-serif">{story.title}</h5>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{story.synopsis}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
