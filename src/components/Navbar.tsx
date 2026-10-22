import React from 'react';
import { ArrowRight, Film, Tv } from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  onNavigateStep: (step: number) => void;
  onOpenArchitecture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigateStep,
  onOpenArchitecture,
}) => {
  const stepLabels = [
    'Inicio',
    'Historia',
    'Personaje',
    'Identidad',
    'Estilo',
    'Generación',
    'Resultado'
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element, whitespace-nowrap) */}
        <div
          onClick={() => onNavigateStep(1)}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400 via-indigo-500 to-sky-300 flex items-center justify-center shadow-md shadow-sky-950/50 group-hover:scale-105 transition-transform">
            <Film className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-lg tracking-tight font-sans text-white whitespace-nowrap">
            ACTORSELF
          </span>
        </div>

        {/* Zone 2: Navigation Links or Stepper Breadcrumbs */}
        {currentStep === 1 ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a
              href="#peliculas"
              className="hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              Películas
            </a>
            <a
              href="#como-funciona"
              className="hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              Cómo Funciona
            </a>
            <a
              href="#tecnologia"
              className="hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              Tecnología & IA
            </a>
            <button
              onClick={onOpenArchitecture}
              className="hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Dossier Prime Video
            </button>
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-1.5 text-xs">
            {stepLabels.map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;

              return (
                <React.Fragment key={label}>
                  {idx > 0 && <span className="text-slate-600 text-[10px] px-0.5">·</span>}
                  <button
                    onClick={() => onNavigateStep(stepNum)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                        : isCompleted
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-sky-400 animate-ping' : isCompleted ? 'bg-emerald-400' : 'bg-slate-700'
                      }`}
                    ></span>
                    <span>{label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentStep === 1 ? (
            <button
              onClick={() => onNavigateStep(2)}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-sky-300 hover:from-sky-300 hover:to-white rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 group"
            >
              <span>Entrar en la Historia</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateStep(1)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Inicio
              </button>
              <button
                onClick={onOpenArchitecture}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Prime Video</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
