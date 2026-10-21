import React from 'react';
import { ArrowRight, Film, Sparkles, Shield, Tv, Users, Play, Star } from 'lucide-react';

interface Screen1WelcomeProps {
  onStart: () => void;
  onOpenArchitecture: () => void;
}

export const Screen1Welcome: React.FC<Screen1WelcomeProps> = ({
  onStart,
  onOpenArchitecture,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-center items-center px-4 sm:px-6 py-12 overflow-hidden bg-slate-950">
      {/* Background Holographic Glow & Starfield Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-sky-600/15 via-indigo-600/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Top Tag & Identity */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xl backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium">Prototipo Funcional Oficial</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400 font-mono">Hackatón Amazon</span>
        </div>

        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white font-serif leading-[1.1]">
            ¿Y si el próximo <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300">
              protagonista fueras tú?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Ya no solamente miras la película. Ahora puedes formar parte de ella.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-normal">
            ACTORSELF transforma al espectador tradicional en participante visual de historias cinematográficas de alta producción, integrando tu rostro y decisiones en escenas memorables.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-950/50 hover:shadow-sky-500/20 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-3 group"
          >
            <span>Entrar en la historia</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenArchitecture}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-white font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Tv className="w-4 h-4 text-sky-400" />
            <span>Visión Comercial Prime Video</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 space-y-2 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Escena Original de 5 Segundos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generación real de video cinematográfico en 16:9 Full HD con la misión <em>Última luz de Kepler</em>.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 space-y-2 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Privacidad y Consentimiento</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uso estricto bajo autorización explícita. No se almacenan fotografías biométricas permanentemente.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 space-y-2 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Ecosistema Prime Video & Fire TV</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arquitectura concebida para una futura integración en streaming autorizado, multijugador y Alexa.
            </p>
          </div>
        </div>

        {/* Disclaimer Note */}
        <p className="text-[11px] text-slate-500 font-mono pt-4">
          * Demostración funcional original. No implementa ni simula acceso no autorizado a películas comerciales ni cuentas de Prime Video.
        </p>
      </div>
    </div>
  );
};
