import React, { useEffect, useRef, useState } from 'react';
import { Download, Play, X, Volume2, Film } from 'lucide-react';
import type { StoryData } from '../types';

type Props = { story: StoryData; onClose: () => void; onStar: () => void };
const DURATION = 12;
const lines: Record<string, string[]> = {
  'kepler-last-light': ['EL UNIVERSO GUARDA SILENCIO', 'UNA ÚLTIMA ORDEN', 'EL DESTINO ESTÁ EN TUS MANOS'],
  'secret-of-the-fog': ['LA NIEBLA OCULTA UN SECRETO', 'ALGUIEN CONOCE LA VERDAD', 'ATRÉVETE A DESCUBRIRLA'],
  'neon-city-2099': ['LA CIUDAD NUNCA DUERME', 'LA PERSECUCIÓN HA COMENZADO', 'CAMBIA EL DESTINO'],
};
const accents: Record<string, string> = {
  'kepler-last-light': '#56d9ff', 'secret-of-the-fog': '#e9b97c', 'neon-city-2099': '#f16fd8'
};

export const CinematicPreview: React.FC<Props> = ({ story, onClose, onStar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const accent = accents[story.id] || '#56d9ff';

  useEffect(() => {
    const img = new Image();
    img.src = story.coverImage;
    img.onload = () => { imageRef.current = img; };
    return () => { imageRef.current = null; };
  }, [story.coverImage]);

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    startRef.current = performance.now();
    let lastProgress = 0;
    const draw = (now: number) => {
      const seconds = ((now - startRef.current) / 1000) % DURATION;
      const w = canvas.width, h = canvas.height;
      const img = imageRef.current;
      ctx.fillStyle = '#030813'; ctx.fillRect(0, 0, w, h);
      if (img) {
        const zoom = 1.06 + seconds * 0.012;
        const scale = Math.max(w / img.width, h / img.height) * zoom;
        const iw = img.width * scale, ih = img.height * scale;
        const dx = (w - iw) / 2 + Math.sin(seconds * 0.32) * 18;
        const dy = (h - ih) / 2 + Math.cos(seconds * 0.29) * 10;
        ctx.drawImage(img, dx, dy, iw, ih);
      }
      const shade = ctx.createLinearGradient(0, 0, 0, h);
      shade.addColorStop(0, 'rgba(0,0,12,.46)');
      shade.addColorStop(.46, 'rgba(0,0,0,.06)');
      shade.addColorStop(1, 'rgba(0,0,14,.87)');
      ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
      // Atmospheric motes and camera light streaks create moving original preview footage.
      for (let i = 0; i < 58; i++) {
        const x = ((i * 137.6 + seconds * (i % 4 + 1) * 17) % (w + 80)) - 40;
        const y = ((i * 97.3 + seconds * (i % 5 + 1) * 24) % (h + 60)) - 30;
        ctx.globalAlpha = .12 + .27 * Math.abs(Math.sin(seconds + i));
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x, y, (i % 3) + .6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (story.id === 'neon-city-2099') {
        ctx.strokeStyle = 'rgba(85,220,255,.15)'; ctx.lineWidth = 2;
        for (let i = 0; i < 25; i++) {
          const x = (i * 77 + seconds * 80) % w;
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 90, h); ctx.stroke();
        }
      } else if (story.id === 'secret-of-the-fog') {
        for (let i = 0; i < 4; i++) {
          const fog = ctx.createRadialGradient(w * (.2 + i * .2) + Math.sin(seconds + i) * 100, h * .8, 5, w * (.2 + i * .2), h * .8, w * .5);
          fog.addColorStop(0, 'rgba(205,216,224,.17)'); fog.addColorStop(1, 'rgba(205,216,224,0)');
          ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h);
        }
      } else {
        const pulse = .05 + .1 * Math.max(0, Math.sin(seconds * 3));
        ctx.fillStyle = 'rgba(60,180,255,' + pulse + ')'; ctx.fillRect(0, 0, w, h);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff'; ctx.font = 'bold 19px sans-serif';
      ctx.letterSpacing = '7px'; ctx.fillText('ACTORSELF  /  ORIGINAL CINEMATIC CONCEPT', w / 2, 52);
      const phrases = lines[story.id] || lines['kepler-last-light'];
      const index = Math.min(2, Math.floor(seconds / 4));
      const phase = seconds % 4;
      ctx.globalAlpha = Math.min(1, phase * 1.6, (4 - phase) * 1.6);
      ctx.shadowColor = '#000'; ctx.shadowBlur = 22;
      ctx.font = 'bold 52px Georgia, serif'; ctx.letterSpacing = '2px';
      ctx.fillText(phrases[index], w / 2, h * .76, w * .91);
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      ctx.fillStyle = accent; ctx.fillRect(w * .42, h * .81, w * .16, 3);
      ctx.fillStyle = '#dce7f3'; ctx.font = '22px sans-serif'; ctx.letterSpacing = '3px';
      ctx.fillText(story.title.toUpperCase(), w / 2, h * .89, w * .9);
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '17px sans-serif'; ctx.letterSpacing = '1px';
      ctx.fillText('PREVISUALIZACIÓN ANIMADA · NO ES METRAJE DE UNA PELÍCULA', w / 2, h - 26);
      ctx.fillStyle = accent; ctx.fillRect(0, h - 5, w * (seconds / DURATION), 5);
      if (Math.abs(seconds - lastProgress) > .1) { setProgress(seconds); lastProgress = seconds; }
      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [playing, story, accent]);

  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);

  const exportClip = () => {
    const canvas = canvasRef.current;
    if (!canvas || !('captureStream' in canvas) || typeof MediaRecorder === 'undefined') {
      setError('Este navegador no permite grabar WebM. Prueba Chrome o Edge.'); return;
    }
    const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
    if (!type) { setError('El navegador no admite exportación WebM.'); return; }
    setError(''); setVideoUrl(null); setRecording(true); setPlaying(true);
    const stream = canvas.captureStream(24);
    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 3200000 });
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.onerror = () => { setError('No se pudo grabar el video.'); setRecording(false); };
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type });
      if (blob.size > 1000) setVideoUrl(URL.createObjectURL(blob));
      else setError('No se pudo generar un archivo de video válido.');
      setRecording(false);
    };
    recorder.start();
    window.setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, DURATION * 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-3 sm:p-8" role="dialog" aria-modal="true" aria-label={'Tráiler de ' + story.title}>
      <div className="w-full max-w-5xl space-y-4">
        <div className="flex justify-between items-center gap-3">
          <div><div className="text-xs tracking-[.3em] uppercase text-sky-400 font-bold">ACTORSELF · Cinema Lab</div><h2 className="text-xl sm:text-2xl font-serif font-bold text-white">{story.title}</h2></div>
          <button onClick={onClose} aria-label="Cerrar" className="p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700"><X size={22}/></button>
        </div>
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
          <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-contain" aria-label="Previsualización cinematográfica animada"/>
          {!playing && <button onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white"><Play size={64}/></button>}
          <span className="absolute top-4 right-4 bg-black/70 border border-white/20 rounded-full px-3 py-1 text-[10px] sm:text-xs text-white tracking-widest">CONCEPTO ORIGINAL · {Math.ceil(DURATION - progress)}s</span>
        </div>
        <p className="text-xs text-slate-400">Vista previa cinematográfica animada creada con arte original, movimientos de cámara y efectos. No contiene escenas ni actores de películas comerciales. La exportación genera un video WebM en tu navegador.</p>
        {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => setPlaying(p => !p)} className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm text-white">{playing ? 'Pausar' : 'Reproducir'} <Play size={16}/></button>
          <button onClick={exportClip} disabled={recording} className="flex items-center gap-2 rounded-xl bg-sky-600 disabled:opacity-50 px-4 py-3 text-sm font-bold text-white"><Film size={16}/>{recording ? 'Grabando 12 segundos…' : 'Crear video de ejemplo'}</button>
          {videoUrl && <a href={videoUrl} download={'ACTORSELF_' + story.id + '_trailer.webm'} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"><Download size={16}/> Descargar WebM</a>}
          <button onClick={onStar} className="ml-auto rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Protagonizar esta historia →</button>
        </div>
      </div>
    </div>
  );
};
