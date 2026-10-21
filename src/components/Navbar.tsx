import React from 'react';
import { Film, Sparkles, BookOpen, ChevronRight, ShieldCheck, Tv } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigateStep(1)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-950/40 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight font-sans text-white">
                ACTORSELF
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                Enter the Story
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Prototipo Interactivo · Hackatón Amazon
            </p>
          </div>
        </div>

        {/* Stepper Dots / Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs">
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <React.Fragment key={label}>
                {idx > 0 && (
                  <span className="text-slate-600 text-[10px] px-0.5">·</span>
                )}
                <button
                  onClick={() => onNavigateStep(stepNum)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                      : isCompleted
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-sky-400 animate-ping' : isCompleted ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                  <span>{label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Action button: Arquitectura & Dossier Técnico */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Visión Prime Video & Fire TV</span>
            <span className="sm:hidden">Dossier</span>
          </button>
        </div>
      </div>
    </header>
  );
};
