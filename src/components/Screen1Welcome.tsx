import React, { useState, useRef, useEffect } from 'react';
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
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);
  const [previewTime, setPreviewTime] = useState<number>(0);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const handleLaunchStory = (story: StoryData) => {
    if (onSelectStoryAndStart) {
      onSelectStoryAndStart(story);
    } else {
      onStart();
    }
  };

  // Live Canvas simulation inside Preview Modal
  useEffect(() => {
    if (!previewStory) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      const now = performance.now();
      const elapsed = ((now - startTime) / 1000) % 15.0;
      setPreviewTime(elapsed);

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Clear
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      if (previewStory.id === 'kepler-last-light') {
        // Starfield simulation
        for (let i = 0; i < 90; i++) {
          const sx = ((i * 1234.5 + elapsed * 70) % w);
          const sy = ((i * 876.5) % h);
          ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : '#ffffff';
          ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
        }

        // Dying star glow
        const starGrad = ctx.createRadialGradient(w - 220, cy - 60, 20, w - 220, cy - 60, 260);
        starGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        starGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.6)');
        starGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = starGrad;
        ctx.beginPath();
        ctx.arc(w - 220, cy - 60, 260, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit HUD
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(60, 60, 220, 90);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('KEPLER-452 // ORBITAL', 75, 88);
        ctx.fillText(`TIME: ${elapsed.toFixed(1)}s / 15.0s`, 75, 112);

        // Pilot in space flight seat
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(cx - 110, cy - 60, 220, 260, [40, 40, 10, 10]);
        ctx.fill();

        // Helmet Visor
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, 70, 75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, 62, 66, 0, 0, Math.PI * 2);
        ctx.fill();

        // Reflected face glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cx - 15, cy - 40, 40, 15, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (previewStory.id === 'secret-of-the-fog') {
        // Nordic Noir lighthouse interior
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#1c1917');
        bgGrad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Arched window overlooking stormy sea
        const winX = w - 320;
        const winY = 40;
        const winW = 260;
        const winH = 340;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, [100, 100, 8, 8]);
        ctx.clip();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(winX, winY, winW, winH);

        // Lighthouse beam rotating
        const beamX = winX + winW / 2 + Math.cos(elapsed * 1.5) * 200;
        const beamY = winY + 80 + Math.sin(elapsed * 1.5) * 120;
        const beamGrad = ctx.createRadialGradient(winX + winW / 2, winY + 80, 5, beamX, beamY, 240);
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
        beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(winX, winY, winW, winH);
        ctx.restore();

        // Window frame
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, [100, 100, 8, 8]);
        ctx.stroke();

        // Detective Trench Coat Silhouette
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(cx - 180, h);
        ctx.quadraticCurveTo(cx - 120, cy + 20, cx - 60, cy);
        ctx.lineTo(cx + 60, cy);
        ctx.quadraticCurveTo(cx + 120, cy + 20, cx + 180, h);
        ctx.closePath();
        ctx.fill();

        // Warm flickering lamp
        const flicker = Math.sin(elapsed * 8) * 0.1 + 0.3;
        ctx.fillStyle = `rgba(245, 158, 11, ${flicker})`;
        ctx.beginPath();
        ctx.arc(140, cy, 180, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cyberpunk 2099 rooftop
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#090514');
        skyGrad.addColorStop(1, '#020617');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Skyscrapers
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(40, 100, 140, h - 100);
        ctx.fillRect(200, 60, 160, h - 60);
        ctx.fillRect(w - 280, 80, 180, h - 80);

        // Holographic neon billboards
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('NEO-SHINJUKU', 60, 160);
        ctx.fillStyle = '#ec4899';
        ctx.fillText('ACTORSELF', w - 260, 140);

        // Cyberpunk character silhouette
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(cx - 160, h);
        ctx.quadraticCurveTo(cx - 100, cy + 10, cx - 50, cy - 10);
        ctx.lineTo(cx + 50, cy - 10);
        ctx.quadraticCurveTo(cx + 100, cy + 10, cx + 160, h);
        ctx.closePath();
        ctx.fill();

        // Neon optic collar
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy - 5);
        ctx.lineTo(cx - 25, cy + 50);
        ctx.stroke();

        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(cx + 50, cy - 5);
        ctx.lineTo(cx + 25, cy + 50);
        ctx.stroke();

        // Rain
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.4)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 40; r++) {
          const rx = (r * 73 + elapsed * 150) % w;
          const ry = (r * 91 + elapsed * 300) % h;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 8, ry + 22);
          ctx.stroke();
        }
      }

      // Anamorphic Letterbox Bars
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, 35);
      ctx.fillRect(0, h - 35, w, 35);

      // Timecode
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`00:00:${Math.floor(elapsed).toString().padStart(2, '0')}:24`, 25, 24);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText('PREVIEW AUTORIZADO // ACTORSELF ENGINE', w - 280, 24);

      if (isRunning) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [previewStory]);

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
                        src={`${import.meta.env.BASE_URL}${story.id === "kepler-last-light" ? "WhatsApp%20Video%202026-10-23%20at%204.26.34%20PM.mp4" : story.id === "secret-of-the-fog" ? "WhatsApp%20Video%202026-10-23%20at%204.26.37%20PM.mp4" : "WhatsApp%20Video%202026-10-23%20at%204.26.39%20PM.mp4"}`}
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
                  Vista Previa Cinemática en Vivo
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

            {/* Canvas Video Viewport */}
            <div className="relative aspect-video bg-black mx-5 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <canvas
                ref={previewCanvasRef}
                width={854}
                height={480}
                className="w-full h-full object-contain"
              />

              <div className="absolute top-4 left-4">
                <span className="bg-slate-950/80 px-2.5 py-1 rounded text-[11px] font-mono text-sky-300 border border-slate-800">
                  {previewStory.genre} · {previewTime.toFixed(1)}s / 15.0s
                </span>
              </div>
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
