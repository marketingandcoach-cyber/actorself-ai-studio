import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * Face-to-video studio: user-supplied portrait + licensed video.
 * Real MediaPipe landmark inference on both inputs; per-frame canvas compositing.
 * This is 2D face transfer, not a photorealistic neural deepfake.
 */
export function FaceToVideoStudio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portraitRef = useRef<HTMLImageElement | null>(null);
  const videoUrlRef = useRef<string | null>(null);
  const rafRef = useRef<number>(0);
  const detectorRef = useRef<FaceLandmarker | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [videoReady, setVideoReady] = useState(false);
  const [portraitReady, setPortraitReady] = useState(false);
  const [consent, setConsent] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('Carga tu foto y un video autorizado para comenzar.');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    detectorRef.current?.close();
    recorderRef.current?.state === 'recording' && recorderRef.current.stop();
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
  }, []);

  const loadPortrait = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage('Selecciona una imagen válida.'); return; }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      portraitRef.current = image;
      setPortraitReady(true);
      URL.revokeObjectURL(url);
      setMessage('Fotografía preparada.');
    };
    image.onerror = () => { URL.revokeObjectURL(url); setMessage('No se pudo abrir la foto.'); };
    image.src = url;
  };

  const loadVideo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) { setMessage('Selecciona un archivo de video.'); return; }
    const video = videoRef.current;
    if (!video) return;
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = URL.createObjectURL(file);
    video.src = videoUrlRef.current;
    video.load();
    setVideoReady(false);
    setMessage('Cargando video…');
  };

  const run = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const portrait = portraitRef.current;
    if (!video || !canvas || !portrait || !videoReady || !consent || working) return;
    setWorking(true);
    setMessage('Descargando modelo facial gratuito…');
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResultUrl(null);
    let sourceDetector: FaceLandmarker | null = null;
    try {
      const fileset = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
      const modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
      const baseOptions = { modelAssetPath, delegate: 'CPU' as const };
      sourceDetector = await FaceLandmarker.createFromOptions(fileset, { baseOptions, runningMode: 'IMAGE', numFaces: 1 });
      const source = sourceDetector.detect(portrait).faceLandmarks[0];
      if (!source) throw new Error('No se detectó un rostro en la fotografía.');
      const targetDetector = await FaceLandmarker.createFromOptions(fileset, { baseOptions, runningMode: 'VIDEO', numFaces: 1 });
      detectorRef.current = targetDetector;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No se pudo abrir Canvas.');
      canvas.width = Math.min(video.videoWidth, 1280);
      canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
      if (!canvas.captureStream || typeof MediaRecorder === 'undefined') throw new Error('Tu navegador no permite grabar video desde Canvas.');
      const stream = canvas.captureStream(30);
      const mime = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t));
      if (!mime) throw new Error('No hay un formato de video grabable en este navegador.');
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onerror = () => setMessage('Error durante la grabación.');
      recorder.onstop = () => {
        if (chunksRef.current.length) {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          const url = URL.createObjectURL(blob);
          resultUrlRef.current = url;
          setResultUrl(url);
          setMessage(detectedFrames ? 'Video generado con transferencia facial en ' + drawnFrames + ' fotogramas. Descarga el resultado.' : 'El video se exportó, pero no se detectó ningún rostro en la escena. Prueba un video con el rostro visible y bien iluminado.');
        } else setMessage('No se generó un video válido.');
        setWorking(false);
        detectorRef.current?.close();
        detectorRef.current = null;
        stream.getTracks().forEach(track => track.stop());
      };

      const bounds = (points: typeof source) => {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
      };
      const sourceBounds = bounds(source);
      const srcCx = (sourceBounds.x + sourceBounds.w / 2) * portrait.naturalWidth;
      const srcCy = (sourceBounds.y + sourceBounds.h / 2) * portrait.naturalHeight;
      const srcW = sourceBounds.w * portrait.naturalWidth * 1.22;
      const srcH = sourceBounds.h * portrait.naturalHeight * 1.24;
      let lastTimestamp = -1;
      let lastFace: typeof source | null = null;
      let detectedFrames = 0;
      let drawnFrames = 0;
      const frame = () => {
        if (video.paused || video.ended) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const timeMs = video.currentTime * 1000;
        if (timeMs > lastTimestamp) {
          lastTimestamp = timeMs;
          lastFace = targetDetector.detectForVideo(video, timeMs).faceLandmarks[0] || null;
          if (lastFace) detectedFrames++;
        }
        const detected = lastFace;
        if (detected) {
            drawnFrames++;
            const box = bounds(detected);
            const cx = (box.x + box.w / 2) * canvas.width;
            const cy = (box.y + box.h / 2) * canvas.height;
            const w = box.w * canvas.width * 1.2;
            const h = box.h * canvas.height * 1.2;
            // Eyes define target head tilt, preserving the scene's head motion.
            const eyeA = detected[33], eyeB = detected[263];
            const angle = Math.atan2((eyeB.y - eyeA.y) * canvas.height, (eyeB.x - eyeA.x) * canvas.width);
            context.save();
            context.translate(cx, cy);
            context.rotate(angle);
            context.beginPath();
            context.ellipse(0, 0, w * 0.47, h * 0.49, 0, 0, Math.PI * 2);
            context.clip();
            context.drawImage(portrait, srcCx - srcW / 2, srcCy - srcH / 2, srcW, srcH, -w / 2, -h / 2, w, h);
            context.restore();
          }
        rafRef.current = requestAnimationFrame(frame);
      };
      video.currentTime = 0;
      await new Promise<void>(resolve => {
        if (video.readyState >= 2 && video.currentTime === 0) resolve();
        else video.addEventListener('seeked', () => resolve(), { once: true });
      });
      recorder.start(250);
      await video.play();
      setMessage('IA detectando rostros y transfiriéndolos al video, fotograma a fotograma…');
      frame();
      video.addEventListener('ended', () => {
        cancelAnimationFrame(rafRef.current);
        if (recorder.state === 'recording') recorder.stop();
      }, { once: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo procesar el video.');
      setWorking(false);
      detectorRef.current?.close();
      detectorRef.current = null;
    } finally {
      sourceDetector?.close();
    }
  };

  return <section className="mx-auto max-w-5xl p-5 sm:p-8 rounded-3xl border border-sky-800 bg-slate-900 space-y-4">
    <h2 className="text-2xl font-bold text-sky-300">Face-to-Video · IA gratuita</h2>
    <p className="text-sm text-slate-300">Transfiere tu rostro a un video autorizado con seguimiento facial de MediaPipe. Funciona localmente, sin AWS. Es una composición 2D experimental, no un deepfake fotorrealista.</p>
    <div className="grid sm:grid-cols-2 gap-3">
      <label className="text-sm">1. Tu fotografía<input className="block mt-2 w-full text-xs" type="file" accept="image/*" onChange={e => loadPortrait(e.target.files?.[0])}/></label>
      <label className="text-sm">2. Video de la escena<input className="block mt-2 w-full text-xs" type="file" accept="video/*" onChange={e => loadVideo(e.target.files?.[0])}/></label>
    </div>
    <video ref={videoRef} className="w-full max-h-64 rounded-lg bg-black" controls playsInline onLoadedMetadata={() => {setVideoReady(true);setMessage('Video listo.');}}/>
    <label className="flex gap-2 items-start text-xs"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/> Confirmo que tengo consentimiento para usar el rostro y autorización para transformar este video.</label>
    <button className="rounded-xl px-5 py-3 bg-sky-600 disabled:opacity-40 font-semibold" disabled={!portraitReady || !videoReady || !consent || working} onClick={run}>{working ? 'Procesando video…' : 'Transferir rostro al video con IA'}</button>
    <p role="status" className="text-sm text-sky-200">{message}</p>
    <canvas ref={canvasRef} className="w-full rounded-xl bg-black" />
    {resultUrl && <div className="space-y-2"><video className="w-full" src={resultUrl} controls playsInline/><a href={resultUrl} download="actorself-face-to-video.webm" className="inline-block rounded-xl px-5 py-3 bg-emerald-700 font-semibold">Descargar video generado</a></div>}
  </section>;
}
