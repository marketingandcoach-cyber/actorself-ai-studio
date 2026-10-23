import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  Sparkles,
  Shield,
  Tv,
  Film,
  Camera,
  Layers,
  Volume2,
  X,
  Compass,
  Zap,
  CheckCircle2,
  Lock,
  Pause
} from 'lucide-react';
import { STORIES } from '../data/stories';
import { StoryData, CinematicSceneDefinition } from '../types';
import { CINEMATIC_SCENES } from '../data/scenes';

interface Screen1WelcomeProps {
  onStart: () => void;
  onOpenArchitecture: () => void;
  onSelectStoryAndStart?: (story: StoryData) => void;
}

export const Screen1Welcome: React.FC<Screen1WelcomeProps> = ({
  onStart,
  onOpenArchitecture,
  onSelectStoryAndStart,
}) => {
  // Preview Modal state
  const [previewStory, setPreviewStory] = useState<StoryData | null>(null);

  const handleLaunchStory = (story: StoryData) => {
    if (onSelectStoryAndStart) {
      onSelectStoryAndStart(story);
    } else {
      onStart();
    }
  };

  const previewVideoPath = (story: StoryData) => {
    if (story.id === 'kepler-last-light') return 'ACTORSELF_PORTADA_KEPLER.mp4';
    if (story.id === 'secret-of-the-fog') return 'ACTORSELF_PORTADA_NIEBLA.mp4';
    return 'ACTORSELF_PORTADA_NEON2099.mp4';
  };

  const getGenreIcon = (id: string) => {
    if (id === 'kepler-last-light') return <Shield className="w-4 h-4 text-sky-400" />;
    if (id === 'secret-of-the-fog') return <Compass className="w-4 h-4 text-amber-400" />;
    return <Zap className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] bg-[#030712] text-slate-100 overflow-x-hidden">
      {/* Background Radial Glow Atmosphere (Lovable Cinematic Aesthetics) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-sky-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:36px_36px] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 space-y-24">
        {/* ================= HERO DECISION BLOCK ================= */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Tagline kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xl backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-white">Tecnología de Inserción Cinematográfica</span>
            <span className="text-slate-600">·</span>
            <span className="text-sky-400 font-mono">Hackatón Amazon</span>
          </div>

          {/* Marquee Headline */}
          <div className="space-y-5">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white font-sans leading-[1.08] [text-wrap:balance]">
              Conviértete en el protagonista de tus{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300">
                películas favoritas
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
              Sustituye al actor original por tu propio rostro en escenas cinematográficas en alta definición, con seguimiento facial 3D, reiluminación fotométrica y renderizado en tiempo real.
            </p>
          </div>

          {/* Primary Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-xl shadow-sky-500/20 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 group whitespace-nowrap"
            >
              <span>Entrar en la Historia</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>

            <button
              onClick={onOpenArchitecture}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 whitespace-nowrap"
            >
              <Tv className="w-4 h-4 text-sky-400" />
              <span>Visión Prime Video & Fire TV</span>
            </button>
          </div>

          {/* Trust & Proof Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>3 Mini-Películas 100% Funcionales</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>15s Full HD 1080p a 60 FPS</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Privacidad Biométrica en el Navegador</span>
            </div>
          </div>
        </section>

        {/* ================= HIGH-IMPACT HERO BANNER ================= */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900/60 aspect-[21/9]">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={`${import.meta.env.BASE_URL}videos/ultima-evacuacion.mp4`}
            poster={new URL("../assets/images/actorself_hero_cinematic_1792679203790.jpg", import.meta.url).href}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="ACTORSELF: Última evacuación, escena cinematográfica de supervivencia"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-sky-400 uppercase tracking-widest block font-bold">
                ESCENA CONCEPTUAL · SUPERVIVENCIA
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Última evacuación: sobrevive a una ciudad en emergencia
              </h2>
            </div>
            <button
              onClick={onStart}
              className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-sky-400 fill-current" />
              <span>Probar Prototipo Ahora</span>
            </button>
          </div>
        </div>

        {/* ================= SECTION 2: MINI-FILMS SHOWCASE ================= */}
        <section id="peliculas" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
                Catálogo de Mini-Películas
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Elige la película autorizada que deseas protagonizar
              </h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Todas las mini-películas cuentan con un prototipo funcional con audio foley espacial, iluminación cinemática y datos de sustitución facial.
              </p>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              3 Historias Disponibles · 15 Segundos c/u
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STORIES.map((story) => {
              const leadRole = story.roles[0];
              return (
                <div
                  key={story.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden group shadow-xl"
                >
                  <div className="space-y-4 p-5">
                    {/* Poster Cover */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-800">
                      <video
                        src={`${import.meta.env.BASE_URL}${story.id === "kepler-last-light" ? "scenes/ACTORSELF_PORTADA_KEPLER.mp4" : story.id === "secret-of-the-fog" ? "scenes/ACTORSELF_PORTADA_NIEBLA.mp4" : "scenes/ACTORSELF_PORTADA_NEON2099.mp4"}`}
                        poster={story.coverImage}
                        aria-label={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        muted loop playsInline preload="none"
                        onMouseEnter={e => { e.currentTarget.play().catch(() => {}); }}
                        onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                        onClick={e => { if (e.currentTarget.paused) e.currentTarget.play().catch(() => {}); else e.currentTarget.pause(); }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                        <span className="bg-slate-900/90 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-800">
                          {story.durationLabel.split('·')[0]}
                        </span>
                        <span className="text-sky-300 text-[11px] font-mono">
                          1080p 60 FPS
                        </span>
                      </div>
                    </div>

                    {/* Metadata Header */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                        {getGenreIcon(story.id)}
                        <span>{story.genre}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                        "{story.tagline}"
                      </p>
                    </div>

                    {/* Synopsis */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {story.synopsis}
                    </p>

                    {/* Actor replacement note */}
                    <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Actor Original en Metraje:</span>
                      <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{leadRole.rank}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewStory(story)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 text-sky-400 fill-current" />
                      <span>Vista Previa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunchStory(story)}
                      className="py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
                    >
                      <span>Protagonizar</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 3: HOW IT WORKS ================= */}
        <section id="como-funciona" className="space-y-10 scroll-mt-24">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
              Flujo de Inserción
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cómo ACTORSELF te convierte en el protagonista
            </h2>
            <p className="text-sm text-slate-400">
              Un pipeline en 4 etapas ejecutado directamente en tu navegador que respeta el metraje cinematográfico original.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <span className="text-2xl font-extrabold text-sky-400 font-mono block">01</span>
              <h3 className="text-base font-bold text-white">Selección de Película</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Escoge entre Kepler-452 (Sci-Fi), El Secreto de la Niebla (Nordic Noir) o Ciudad Neón 2099 (Cyberpunk).
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <span className="text-2xl font-extrabold text-sky-400 font-mono block">02</span>
              <h3 className="text-base font-bold text-white">Captura o Cámara Web</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Carga tu foto o activa la cámara web en vivo para capturar ángulos dinámicos y expresiones emocionales.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <span className="text-2xl font-extrabold text-sky-400 font-mono block">03</span>
              <h3 className="text-base font-bold text-white">Alineación & Reiluminación</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                La biblioteca de sustitución mapea tus rasgos sobre el rostro del actor original, armonizando tonos de piel y sombras.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <span className="text-2xl font-extrabold text-sky-400 font-mono block">04</span>
              <h3 className="text-base font-bold text-white">Escena Final 1080p</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reproduce tu escena completa de 15 segundos con audio foley espacial sintetizado y descárgala en Full HD.
              </p>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: PRIVACY & TECHNOLOGY ================= */}
        <section id="tecnologia" className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-12 space-y-8 scroll-mt-24">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
              <Lock className="w-4 h-4" />
              <span>Garantía de Privacidad Biométrica</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tus fotos nunca salen de tu dispositivo
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              ACTORSELF procesa cada fotograma exclusivamente en la memoria volátil de tu navegador (HTML5 Canvas y WebGL). Al cerrar la pestaña o pulsar "Purgar Memoria", tus datos se destruyen de inmediato.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-800">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-white">Cero Retención en la Nube</h4>
              <p className="text-xs text-slate-400">Sin bases de datos de rostros ni almacenamiento permanente de identidad.</p>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-white">Metraje Autorizado</h4>
              <p className="text-xs text-slate-400">Escenas licenciadas y preparadas con seguimiento 3D para el concurso.</p>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-white">Audio Sintetizado con Web Audio</h4>
              <p className="text-xs text-slate-400">Diseño sonoro procedural generado en tiempo real con osciladores y filtros.</p>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA BLOCK ================= */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¿Listo para ocupar el lugar del actor principal?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Prueba la experiencia ahora mismo y descubre el futuro de la interactividad cinematográfica en Prime Video.
          </p>
          <div className="pt-2">
            <button
              onClick={onStart}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-xl shadow-sky-500/20 transition-all cursor-pointer inline-flex items-center gap-2.5"
            >
              <span>Comenzar Experiencia</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </section>
      </div>

      {/* ================= INTERACTIVE PREVIEW MODAL ================= */}
      {previewStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400 block font-bold">
                  Vista Previa Cinematográfica
                </span>
                <h3 className="text-lg font-bold text-white font-serif">
                  {previewStory.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewStory(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real cinematic video preview */}
            <div className="relative aspect-video bg-black mx-5 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <video
                key={previewStory.id}
                src={`${import.meta.env.BASE_URL}scenes/${previewVideoPath(previewStory)}`}
                poster={previewStory.coverImage}
                className="w-full h-full object-contain"
                autoPlay
                controls
                playsInline
                preload="auto"
                aria-label={`Vista previa de ${previewStory.title}`}
              />
            </div>

            {/* Details & Direct Action */}
            <div className="p-5 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                <span>Actor original en escena: </span>
                <strong className="text-white">{previewStory.roles[0]?.rank}</strong>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setPreviewStory(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    const st = previewStory;
                    setPreviewStory(null);
                    handleLaunchStory(st);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <span>Protagonizar Esta Película</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
