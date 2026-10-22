import React from 'react';
import { ArrowRight, ArrowLeft, Shield, Users, User, Check, Sparkles, Lock } from 'lucide-react';
import { StoryData, CharacterRole } from '../types';

interface Screen3RoleSelectProps {
  story: StoryData;
  selectedRole: CharacterRole;
  onSelectRole: (role: CharacterRole) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const Screen3RoleSelect: React.FC<Screen3RoleSelectProps> = ({
  story,
  selectedRole,
  onSelectRole,
  onProceed,
  onBack,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest">
          <User className="w-3.5 h-3.5" />
          <span>Etapa 3 · Selección de Personaje</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Elige el papel que deseas interpretar
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          En <em>{story.title}</em>, asumirás el mando de la cabina. Tu rostro y decisiones quedarán grabados en la historia.
        </p>
      </div>

      {/* Main Role Selection Card (Fully Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Available Lead Role */}
        <div
          onClick={onProceed}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onProceed();
            }
          }}
          className="md:col-span-8 bg-slate-900 hover:bg-slate-900/90 border-2 border-sky-500 hover:border-sky-400 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden cursor-pointer transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider text-sky-400 uppercase font-bold">
                  {selectedRole.type}
                </span>
                <h3 className="text-2xl font-bold font-serif text-white group-hover:text-sky-300 transition-colors">
                  {selectedRole.name}
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Disponible para ti</span>
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <p className="leading-relaxed">
              {selectedRole.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Rango a Bordo:</span>
                <span className="font-semibold text-white">{selectedRole.rank}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Impacto en la Escena:</span>
                <span className="font-semibold text-sky-300">Aparición central en cabina</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onProceed();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-950/50 transition-all cursor-pointer flex items-center gap-2 group/btn active:scale-95"
            >
              <span>Convertirme en protagonista y continuar</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Duración: 5.0 segundos · 16:9
            </span>
          </div>
        </div>

        {/* Future Multiplayer / Co-op Teaser Slot (Section 8 Architecture) */}
        <div className="md:col-span-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4 opacity-80">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Users className="w-4 h-4" />
            <span>Modo Multijugador Familiar</span>
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300">Oficial de Navegación</span>
              <span className="text-[10px] font-mono flex items-center gap-1 text-slate-500">
                <Lock className="w-3 h-3" /> Invitado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              En la versión autorizada, podrás invitar a un familiar o amigo con su propia cuenta Prime a ocupar el segundo puesto en el puente.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300">Jefe de Ingeniería</span>
              <span className="text-[10px] font-mono flex items-center gap-1 text-slate-500">
                <Lock className="w-3 h-3" /> Invitado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Slot de co-protagonismo reservado para participación multi-usuario con consentimiento independiente.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar a selección de historia</span>
        </button>
      </div>
    </div>
  );
};
