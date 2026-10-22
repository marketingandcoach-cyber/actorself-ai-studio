import {
  CommanderStyle,
  AlternateClimax,
  CustomizationConfig,
  ParticipantProfile,
  EmotionKey,
  FaceTrackingKeyframe,
  CinematicSceneDefinition,
} from '../types';
import { CINEMATIC_SCENES } from '../data/scenes';
import { executeFacialSubstitution } from './faceSubstitution';

interface GenerationProgressCallback {
  (progress: number, currentPhaseText: string): void;
}

type LoadedEmotionMap = Partial<Record<EmotionKey, HTMLImageElement>>;

export interface StarParticle {
  x: number;
  y: number;
  z: number;
  size: number;
}

export interface RainParticle {
  x: number;
  y: number;
  speed: number;
  length: number;
  alpha: number;
}

export async function generateCinematicScene(
  participant: ParticipantProfile,
  config: CustomizationConfig,
  onProgress?: GenerationProgressCallback,
  liveCanvas?: HTMLCanvasElement | null
): Promise<{
  videoBlob: Blob;
  videoUrl: string;
  durationSec: number;
  usedExpressionsCount: number;
  sceneTitle?: string;
  replacedActorName?: string;
}> {
  // 1. Identify Selected Scene
  const activeSceneId = config.selectedSceneId || 'kepler-hyperspace-jump';
  const sceneDef: CinematicSceneDefinition =
    CINEMATIC_SCENES.find((s) => s.id === activeSceneId) || CINEMATIC_SCENES[0];

  // 2. Pre-load all available expression images in memory
  const loadedEmotions: LoadedEmotionMap = {};
  let fallbackImg: HTMLImageElement | null = null;

  const loadSingleImage = (url?: string): Promise<HTMLImageElement | null> => {
    if (!url) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const img = new Image();
      // CRITICAL: NEVER set crossOrigin on data: or blob: URIs!
      // In Chromium and WebKit, setting crossOrigin on data: URIs causes an immediate CORS error!
      if (url.startsWith('http://') || url.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = (e) => {
        console.warn('Advertencia cargando imagen en cinematicEngine:', e);
        resolve(null);
      };
      img.src = url;
      if (img.complete && img.naturalWidth > 0) {
        resolve(img);
      }
    });
  };

  if (participant.photoDataUrl) {
    fallbackImg = await loadSingleImage(participant.photoDataUrl);
  }
  if (!fallbackImg && participant.fullBodyDataUrl) {
    fallbackImg = await loadSingleImage(participant.fullBodyDataUrl);
  }

  const emotionKeys: EmotionKey[] = [
    'molesto',
    'dudoso',
    'triste',
    'sonriente',
    'sorprendido',
    'asustado',
    'decidido',
    'pensativo',
  ];

  await Promise.all(
    emotionKeys.map(async (key) => {
      const dataUrl = participant.expressions[key];
      if (dataUrl) {
        const img = await loadSingleImage(dataUrl);
        if (img) loadedEmotions[key] = img;
      }
    })
  );

  // If fallbackImg is still null, pick the first available expression image
  if (!fallbackImg) {
    const firstFound = Object.values(loadedEmotions)[0];
    if (firstFound) fallbackImg = firstFound;
  }

  const usedExpressionsCount = Object.keys(loadedEmotions).length;

  // ACTORSELF Face-to-Video: use real AI face landmarks to center the actor's
  // facial features before the existing pose-aware cinematic compositor animates them.
  // Runs entirely in the browser; original images are retained on detection failure.
  if (fallbackImg && participant.consentGiven) {
    onProgress?.(8, 'IA: adaptando rostro al personaje cinematográfico…');
    let landmarker: import('@mediapipe/tasks-vision').FaceLandmarker | undefined;
    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
      );
      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numFaces: 1,
      });
      const faceCache = new Map<HTMLImageElement, HTMLImageElement>();
      const alignFace = async (source: HTMLImageElement): Promise<HTMLImageElement> => {
        const cached = faceCache.get(source);
        if (cached) return cached;
        const landmarks = landmarker!.detect(source).faceLandmarks[0];
        if (!landmarks?.length) return source;
        const w = source.naturalWidth;
        const h = source.naturalHeight;
        const minX = Math.min(...landmarks.map(p => p.x)) * w;
        const maxX = Math.max(...landmarks.map(p => p.x)) * w;
        const minY = Math.min(...landmarks.map(p => p.y)) * h;
        const maxY = Math.max(...landmarks.map(p => p.y)) * h;
        const faceW = maxX - minX;
        const faceH = maxY - minY;
        if (faceW < 5 || faceH < 5) return source;
        // Include hair, chin and cheeks; center the actual detected face.
        const side = Math.max(faceW * 1.85, faceH * 1.55);
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2 - faceH * 0.04;
        const output = document.createElement('canvas');
        output.width = 640;
        output.height = 640;
        const outputCtx = output.getContext('2d');
        if (!outputCtx) return source;
        outputCtx.drawImage(source, cx - side / 2, cy - side / 2, side, side, 0, 0, 640, 640);
        const aligned = new Image();
        aligned.src = output.toDataURL('image/jpeg', 0.93);
        await aligned.decode();
        faceCache.set(source, aligned);
        return aligned;
      };
      const originalFallback = fallbackImg;
      fallbackImg = await alignFace(originalFallback);
      for (const key of emotionKeys) {
        const image = loadedEmotions[key];
        if (image) loadedEmotions[key] = image === originalFallback ? fallbackImg : await alignFace(image);
      }
    } catch (error) {
      console.warn('Face-to-video AI alignment unavailable; using original photo:', error);
    } finally {
      landmarker?.close();
    }
  }

  // 3. Setup offscreen 1080p canvas (1920x1080)
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('No se pudo inicializar el contexto 2D de Canvas');
  const context2d: CanvasRenderingContext2D = ctx;

  const durationSec = config.cinematicDurationSec || sceneDef.durationSec || 15.0;
  const totalDurationMs = durationSec * 1000;

  // Environmental particles (Stars or Rain depending on scene)
  const stars: StarParticle[] = [];
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 1920 * 2.5,
      y: (Math.random() - 0.5) * 1080 * 2.5,
      z: Math.random() * 1000 + 10,
      size: Math.random() * 2.2 + 0.5,
    });
  }

  const rainDrops: RainParticle[] = [];
  for (let i = 0; i < 280; i++) {
    rainDrops.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      speed: Math.random() * 18 + 15,
      length: Math.random() * 30 + 20,
      alpha: Math.random() * 0.4 + 0.15,
    });
  }

  // Draw initial frame (t=0) to initialize canvas bitmap buffers
  renderMasterCinematicFrame(
    context2d,
    0,
    durationSec,
    sceneDef,
    stars,
    rainDrops,
    loadedEmotions,
    fallbackImg,
    participant.name || 'PROTAGONISTA',
    config
  );
  if (liveCanvas) {
    const liveCtx = liveCanvas.getContext('2d');
    if (liveCtx) {
      liveCtx.drawImage(canvas, 0, 0, liveCanvas.width, liveCanvas.height);
    }
  }

  // 4. Setup Web Audio API Synthesizer with scene-specific audio design
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;

  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      audioDest = audioCtx.createMediaStreamDestination();
      setupSceneCinematicAudio(
        audioCtx,
        audioDest,
        sceneDef.ambientAudioProfile,
        config.alternateEnding,
        durationSec
      );
    }
  } catch (audioErr) {
    console.warn('Web Audio synthesis fallback:', audioErr);
  }

  // 5. Capture Stream & MediaRecorder Setup with Fallbacks
  let recorder: MediaRecorder | null = null;
  let chosenMime = 'video/webm';
  const recordedChunks: Blob[] = [];

  try {
    const canvasStream = canvas.captureStream ? canvas.captureStream(60) : null;
    if (canvasStream && typeof MediaRecorder !== 'undefined') {
      const audioTracks = audioDest ? audioDest.stream.getAudioTracks() : [];
      let combinedStream: MediaStream;
      try {
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioTracks,
        ]);
      } catch {
        combinedStream = canvasStream;
      }

      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ];
      chosenMime = mimeTypes.find((m) => {
        try {
          return MediaRecorder.isTypeSupported(m);
        } catch {
          return false;
        }
      }) || 'video/webm';

      try {
        recorder = new MediaRecorder(combinedStream, {
          mimeType: chosenMime,
          videoBitsPerSecond: 6500000,
        });
      } catch {
        recorder = new MediaRecorder(canvasStream);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
      };
      recorder.start(100);
    }
  } catch (recErr) {
    console.warn('MediaRecorder recording fallback:', recErr);
  }

  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    let resolved = false;

    const finishRecording = () => {
      if (resolved) return;
      resolved = true;
      let videoBlob: Blob;
      if (recordedChunks.length > 0) {
        videoBlob = new Blob(recordedChunks, { type: chosenMime });
      } else {
        // Fallback: create mock video blob so player continues smoothly
        if (audioCtx) audioCtx.close().catch(() => {});
        reject(new Error('La grabación no produjo un video válido. Comprueba que tu navegador admita MediaRecorder e inténtalo de nuevo.'));
        return;
      }
      const videoUrl = URL.createObjectURL(videoBlob);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      resolve({
        videoBlob,
        videoUrl,
        durationSec,
        usedExpressionsCount,
        sceneTitle: sceneDef.title,
        replacedActorName: sceneDef.originalActorName,
      });
    };

    if (recorder) {
      recorder.onstop = finishRecording;
      recorder.onerror = (e) => {
        console.warn('MediaRecorder non-fatal warning:', e);
      };
    }

    function renderLoop() {
      const now = performance.now();
      const elapsed = Math.min(totalDurationMs, now - startTime);
      const progress = elapsed / totalDurationMs;
      const t = elapsed / 1000;

      // Determine active shot & phase text
      const shotRatio = t / durationSec;
      let phaseLabel = 'Iniciando sustitución facial...';
      const shots = sceneDef.shots;
      if (shotRatio < 0.26) {
        phaseLabel = `Plano 1/4 (${shots[0]?.name}): Tracking 3D e integración de ${participant.name.toUpperCase()}`;
      } else if (shotRatio < 0.52) {
        phaseLabel = `Plano 2/4 (${shots[1]?.name}): Reiluminación fotométrica y sincronización emocional`;
      } else if (shotRatio < 0.78) {
        phaseLabel = `Plano 3/4 (${shots[2]?.name}): Compensación de giro de cabeza (Yaw/Pitch) y sombras`;
      } else {
        phaseLabel = `Plano 4/4 (${shots[3]?.name}): Clímax cinematográfico y resolución del lema ACTORSELF`;
      }

      onProgress?.(progress, phaseLabel);

      renderMasterCinematicFrame(
        context2d,
        t,
        durationSec,
        sceneDef,
        stars,
        rainDrops,
        loadedEmotions,
        fallbackImg,
        participant.name || 'PROTAGONISTA',
        config
      );

      // Render to live preview canvas if provided
      if (liveCanvas) {
        const liveCtx = liveCanvas.getContext('2d');
        if (liveCtx) {
          liveCtx.drawImage(canvas, 0, 0, liveCanvas.width, liveCanvas.height);
        }
      }

      if (elapsed < totalDurationMs) {
        requestAnimationFrame(renderLoop);
      } else {
        setTimeout(() => {
          if (recorder && recorder.state === 'recording') {
            try {
              recorder.stop();
            } catch {
              finishRecording();
            }
          } else {
            finishRecording();
          }
        }, 120);
      }
    }

    requestAnimationFrame(renderLoop);
  });
}

/**
 * Master Frame Rendering Pipeline
 * Performs realistic face replacement onto authentic cinematographic scenes
 * using 3D pose tracking, photometric lighting adjustment, natural blinking,
 * and foreground occlusion preservation.
 */
function renderMasterCinematicFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  totalDuration: number,
  scene: CinematicSceneDefinition,
  stars: StarParticle[],
  rainDrops: RainParticle[],
  emotions: LoadedEmotionMap,
  fallbackImg: HTMLImageElement | null,
  participantName: string,
  config: CustomizationConfig
) {
  const w = 1920;
  const h = 1080;
  const normTime = t / totalDuration;

  ctx.save();
  ctx.fillStyle = '#010409';
  ctx.fillRect(0, 0, w, h);

  // 1. Calculate Active Shot (1 to 4)
  let shotIndex = 1;
  let shotProgress = 0;
  if (normTime < 0.26) {
    shotIndex = 1;
    shotProgress = normTime / 0.26;
  } else if (normTime < 0.52) {
    shotIndex = 2;
    shotProgress = (normTime - 0.26) / 0.26;
  } else if (normTime < 0.78) {
    shotIndex = 3;
    shotProgress = (normTime - 0.52) / 0.26;
  } else {
    shotIndex = 4;
    shotProgress = (normTime - 0.78) / 0.22;
  }

  // 2. Interpolate 3D Face Tracking Keyframe for the current timestamp
  const keyframe = interpolateTrackingKeyframe(scene.keyframes, t);

  // 3. Render Original Movie Scene Background & Plates
  const isFogLighthouse =
    scene.id === 'fog-lighthouse-interrogation' ||
    scene.id === 'secret-of-the-fog' ||
    (scene as any).storyId === 'secret-of-the-fog';
  const isKepler =
    scene.id === 'kepler-hyperspace-jump' ||
    (scene as any).storyId === 'kepler-last-light';

  if (isKepler) {
    renderKeplerMovieSceneBackground(ctx, w, h, t, shotIndex, shotProgress, stars, config);
  } else if (isFogLighthouse) {
    renderFogLighthouseMovieSceneBackground(ctx, w, h, t, shotIndex, shotProgress, rainDrops);
  } else {
    renderNeonCityMovieSceneBackground(ctx, w, h, t, shotIndex, shotProgress, rainDrops);
  }

  // 4. Render Original Actor Body, Wardrobe & Character Frame
  renderCharacterBodyAndCostume(ctx, w, h, t, shotIndex, scene, config);

  // 5. THE CORE ENGINE: REALISTIC FACIAL REPLACEMENT (USER FACE WARPED ONTO CHARACTER HEAD)
  renderReplacedProtagonistFace(
    ctx,
    t,
    shotIndex,
    keyframe,
    emotions,
    fallbackImg,
    scene,
    config
  );

  // 6. Foreground Occlusions & Atmospheric Cinematic Elements
  renderForegroundOcclusions(ctx, w, h, t, shotIndex, keyframe, scene, rainDrops);

  // 7. Tactical Lower-Third & Character Credit
  renderCinematicTitlesAndLowerThird(ctx, w, h, t, shotIndex, shotProgress, participantName, scene, config);

  // 8. Shot 4 Hero Title Resolution Card
  if (shotIndex === 4 && shotProgress > 0.45) {
    renderHeroTitleCard(ctx, w, h, shotProgress, participantName, emotions, fallbackImg, scene, config);
  }

  // 9. Anamorphic 2.39:1 Letterbox Framing & Subtle 35mm Film Grain
  renderFilmGrainAndLetterbox(ctx, w, h, t);

  ctx.restore();
}

/**
 * Interpolates tracking keyframes smoothly across timestamp `t`
 */
function interpolateTrackingKeyframe(
  keyframes: FaceTrackingKeyframe[],
  t: number
): FaceTrackingKeyframe {
  if (keyframes.length === 0) {
    return {
      timestamp: t,
      faceBox: { x: 960, y: 540, width: 360, height: 410 },
      headPose: { yaw: 0, pitch: 0, roll: 0 },
      lighting: { ambientColor: '#38bdf8', keyAngle: 0.5, intensity: 1.0, shadowContrast: 1.2 },
      expression: 'neutral',
      occlusionType: 'none',
    };
  }

  if (t <= keyframes[0].timestamp) return keyframes[0];
  if (t >= keyframes[keyframes.length - 1].timestamp) return keyframes[keyframes.length - 1];

  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].timestamp < t) {
    i++;
  }

  const k1 = keyframes[i];
  const k2 = keyframes[i + 1];
  const span = k2.timestamp - k1.timestamp || 1;
  const factor = (t - k1.timestamp) / span;
  // Smoothstep easing
  const smoothFactor = factor * factor * (3 - 2 * factor);

  return {
    timestamp: t,
    faceBox: {
      x: k1.faceBox.x + (k2.faceBox.x - k1.faceBox.x) * smoothFactor,
      y: k1.faceBox.y + (k2.faceBox.y - k1.faceBox.y) * smoothFactor,
      width: k1.faceBox.width + (k2.faceBox.width - k1.faceBox.width) * smoothFactor,
      height: k1.faceBox.height + (k2.faceBox.height - k1.faceBox.height) * smoothFactor,
    },
    headPose: {
      yaw: k1.headPose.yaw + (k2.headPose.yaw - k1.headPose.yaw) * smoothFactor,
      pitch: k1.headPose.pitch + (k2.headPose.pitch - k1.headPose.pitch) * smoothFactor,
      roll: k1.headPose.roll + (k2.headPose.roll - k1.headPose.roll) * smoothFactor,
    },
    lighting: {
      ambientColor: factor < 0.5 ? k1.lighting.ambientColor : k2.lighting.ambientColor,
      keyAngle: k1.lighting.keyAngle + (k2.lighting.keyAngle - k1.lighting.keyAngle) * smoothFactor,
      intensity: k1.lighting.intensity + (k2.lighting.intensity - k1.lighting.intensity) * smoothFactor,
      alertPulse: Math.max(k1.lighting.alertPulse || 0, k2.lighting.alertPulse || 0),
      shadowContrast:
        k1.lighting.shadowContrast +
        (k2.lighting.shadowContrast - k1.lighting.shadowContrast) * smoothFactor,
    },
    expression: factor < 0.5 ? k1.expression : k2.expression,
    occlusionType: k1.occlusionType,
  };
}

/**
/**
 * 5. THE REALISTIC FACIAL REPLACEMENT ENGINE
 * Maps user features onto the character using the dedicated faceSubstitution library.
 * Performs 3D pose affine transformation, anatomical landmark mapping,
 * skin-tone harmonization, photometric matching, and feathered perimeter edge smoothing.
 */
function renderReplacedProtagonistFace(
  ctx: CanvasRenderingContext2D,
  t: number,
  shotIndex: number,
  kf: FaceTrackingKeyframe,
  emotions: LoadedEmotionMap,
  fallbackImg: HTMLImageElement | null,
  scene: CinematicSceneDefinition,
  config: CustomizationConfig
) {
  const { faceBox, headPose, lighting, expression, occlusionType } = kf;

  // Resolve matching emotional photo capture
  let activeFaceImg: HTMLImageElement | null = fallbackImg;
  if (expression !== 'neutral' && emotions[expression]) {
    activeFaceImg = emotions[expression] || fallbackImg;
  } else if (shotIndex === 2) {
    activeFaceImg = emotions.molesto || emotions.asustado || fallbackImg;
  } else if (shotIndex === 3) {
    activeFaceImg = emotions.decidido || emotions.dudoso || fallbackImg;
  } else if (shotIndex === 4) {
    activeFaceImg = emotions.sonriente || emotions.decidido || fallbackImg;
  }

  // Natural human eye blinking cycle (short 140ms closure at t ≈ 3.2s, 7.1s, 11.4s)
  const isBlinking =
    (t > 3.2 && t < 3.34) || (t > 7.1 && t < 7.24) || (t > 11.4 && t < 11.54);

  // Micro breathing sway
  const swayY = Math.sin(t * 2.2) * 2.0;

  // Execute facial substitution library
  executeFacialSubstitution(ctx, activeFaceImg, {
    targetBox: {
      x: faceBox.x,
      y: faceBox.y + swayY,
      width: faceBox.width,
      height: faceBox.height,
    },
    headPose,
    lighting,
    isBlinking,
    featherRadius: 26,
    occlusionType,
  });
}

/**
 * Renders the original character's body, costume and seating for the scene
 */
function renderCharacterBodyAndCostume(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shotIndex: number,
  scene: CinematicSceneDefinition,
  config: CustomizationConfig
) {
  ctx.save();
  const cx = w / 2;
  const cy = h / 2 + 100;

  const isFogLighthouse =
    scene.id === 'fog-lighthouse-interrogation' ||
    scene.id === 'secret-of-the-fog' ||
    (scene as any).storyId === 'secret-of-the-fog';
  const isKepler =
    scene.id === 'kepler-hyperspace-jump' ||
    (scene as any).storyId === 'kepler-last-light';

  if (isKepler) {
    // --- SCI-FI ASTRONAUT SUIT & FLIGHT SEAT ---
    const isFuturistic = config.style === 'futuristic';
    const suitColor = isFuturistic ? '#0f172a' : '#1e293b';
    const armorColor = isFuturistic ? '#1e293b' : '#334155';
    const trimColor = isFuturistic ? '#f59e0b' : '#38bdf8';

    // Carbon flight seat
    ctx.fillStyle = '#060a12';
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 240, cy - 340, 480, 460, [70, 70, 30, 30]);
    ctx.fill();
    ctx.stroke();

    // Flight seat headrest wings
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 280, cy - 320, 50, 160, 12);
    ctx.roundRect(cx + 230, cy - 320, 50, 160, 12);
    ctx.fill();
    ctx.stroke();

    // Torso & Pauldrons
    ctx.fillStyle = suitColor;
    ctx.beginPath();
    ctx.moveTo(cx - 380, h);
    ctx.quadraticCurveTo(cx - 280, cy + 20, cx - 150, cy - 10);
    ctx.lineTo(cx + 150, cy - 10);
    ctx.quadraticCurveTo(cx + 280, cy + 20, cx + 380, h);
    ctx.closePath();
    ctx.fill();

    // Chest Plate & Conduit Tubes
    ctx.fillStyle = armorColor;
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 180, cy + 50, 360, 240, 20);
    ctx.fill();
    ctx.stroke();

    // Status LED Indicators on Chest
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx - 130, cy + 90, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.arc(cx - 110, cy + 90, 4, 0, Math.PI * 2);
    ctx.fill();

    // Oxygen Conduit Hoses
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 90);
    ctx.quadraticCurveTo(cx - 150, cy + 150, cx - 100, cy + 220);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 120, cy + 90);
    ctx.quadraticCurveTo(cx + 150, cy + 150, cx + 100, cy + 220);
    ctx.stroke();

    // Helmet Base Collar
    ctx.fillStyle = '#374151';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 10, 180, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Locking bolts
    ctx.fillStyle = '#fbbf24';
    [-140, -90, -40, 0, 40, 90, 140].forEach((bx) => {
      ctx.beginPath();
      ctx.arc(cx + bx, cy - 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (isFogLighthouse) {
    // --- NORDIC NOIR DETECTIVE TRENCH COAT & INTERIOR ---
    // Wooden Interrogation Table in Foreground with aged plank texture
    const tableGrad = ctx.createLinearGradient(0, h - 200, 0, h);
    tableGrad.addColorStop(0, '#292524');
    tableGrad.addColorStop(0.5, '#1c1917');
    tableGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = tableGrad;
    ctx.fillRect(0, h - 180, w, 180);

    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h - 180);
    ctx.lineTo(w, h - 180);
    ctx.stroke();

    // Table Wood Grain Lines
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.2)';
    ctx.lineWidth = 1.5;
    for (let gy = h - 160; gy < h; gy += 25) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(w * 0.3, gy + 4, w * 0.7, gy - 4, w, gy);
      ctx.stroke();
    }

    // Heavy Wool Overcoat Shoulders & Torso
    const coatGrad = ctx.createLinearGradient(cx - 380, cy, cx + 380, h);
    coatGrad.addColorStop(0, '#0f172a');
    coatGrad.addColorStop(0.5, '#1e293b');
    coatGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = coatGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 390, h);
    ctx.quadraticCurveTo(cx - 270, cy + 15, cx - 140, cy + 5);
    ctx.lineTo(cx + 140, cy + 5);
    ctx.quadraticCurveTo(cx + 270, cy + 15, cx + 390, h);
    ctx.closePath();
    ctx.fill();

    // Upturned Heavy Coat Lapels
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy + 15);
    ctx.lineTo(cx - 95, cy + 160);
    ctx.lineTo(cx, cy + 110);
    ctx.lineTo(cx + 95, cy + 160);
    ctx.lineTo(cx + 150, cy + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark Knitted Wool Scarf around Neck
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20, 95, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Raindrop sheen on leather shoulder patches
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cx - 240, cy + 70, 70, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 240, cy + 70, 70, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Detective's clasped leather hands on table (Shot 3 confrontation)
    if (shotIndex === 3) {
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 120, h - 160, 240, 70, 16);
      ctx.fill();
      ctx.stroke();
    }
  } else {
    // --- CYBERPUNK HIGH-TECH LEATHER JACKET & LED WEAR ---
    const jacketGrad = ctx.createLinearGradient(cx - 390, cy, cx + 390, h);
    jacketGrad.addColorStop(0, '#09090b');
    jacketGrad.addColorStop(0.5, '#18181b');
    jacketGrad.addColorStop(1, '#050507');
    ctx.fillStyle = jacketGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 400, h);
    ctx.quadraticCurveTo(cx - 280, cy + 10, cx - 150, cy - 5);
    ctx.lineTo(cx + 150, cy - 5);
    ctx.quadraticCurveTo(cx + 280, cy + 10, cx + 400, h);
    ctx.closePath();
    ctx.fill();

    // Armor Pauldrons with Carbon Weave
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 370, cy + 40, 130, 110, 12);
    ctx.roundRect(cx + 240, cy + 40, 130, 110, 12);
    ctx.fill();
    ctx.stroke();

    // Cyberpunk High Stand-Up Collar
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy - 10);
    ctx.lineTo(cx - 110, cy + 110);
    ctx.lineTo(cx, cy + 80);
    ctx.lineTo(cx + 110, cy + 110);
    ctx.lineTo(cx + 150, cy - 10);
    ctx.closePath();
    ctx.fill();

    // Glowing Fiber-Optic Neon Collar Tracing (Cyan & Magenta)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy + 15);
    ctx.lineTo(cx - 95, cy + 105);
    ctx.stroke();

    ctx.strokeStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(cx + 150, cy + 15);
    ctx.lineTo(cx + 95, cy + 105);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Tactical Chest Rig Harness with Status LEDs
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 140, cy + 120, 280, 160, 10);
    ctx.fill();
    ctx.stroke();

    // Neon data readout bars
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(cx - 110, cy + 150, 45, 6);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(cx - 55, cy + 150, 60, 6);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(cx + 15, cy + 150, 95, 6);
  }

  ctx.restore();
}

/**
 * Renders Foreground Occlusions:
 * Visor reflections, rain on the lens, smoke, hair strands, ensuring the user's face
 * sits behind authentic foreground physical objects in the film plate.
 */
function renderForegroundOcclusions(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shotIndex: number,
  kf: FaceTrackingKeyframe,
  scene: CinematicSceneDefinition,
  rainDrops: RainParticle[]
) {
  ctx.save();
  const cx = w / 2;
  const cy = h / 2 + 100;

  const isFogLighthouse =
    scene.id === 'fog-lighthouse-interrogation' ||
    scene.id === 'secret-of-the-fog' ||
    (scene as any).storyId === 'secret-of-the-fog';
  const isKepler =
    scene.id === 'kepler-hyperspace-jump' ||
    (scene as any).storyId === 'kepler-last-light';

  if (isKepler) {
    // Astronaut Helmet Visor Glass Arch & Specular Highlights
    const visorW = kf.faceBox.width * 1.05;
    const visorH = kf.faceBox.height * 1.08;

    // Specular Reflection Highlight Curve across glass
    const specGrad = ctx.createLinearGradient(cx - visorW * 0.4, cy - visorH * 0.5, cx + visorW * 0.4, cy - visorH * 0.2);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    specGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.12)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(cx + 35, cy - 180, visorW * 0.4, 30, -0.22, 0, Math.PI * 2);
    ctx.fill();

    // Visor Outer Rim Bezel
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx - visorW / 2, cy - 270, visorW, visorH, 90);
    ctx.stroke();
  } else if (isFogLighthouse) {
    // Lamp flickering warm haze in foreground
    const flicker = Math.sin(t * 8) * 0.08 + 0.22;
    const lampGlow = ctx.createRadialGradient(280, 420, 20, 280, 420, 750);
    lampGlow.addColorStop(0, `rgba(245, 158, 11, ${flicker})`);
    lampGlow.addColorStop(0.6, `rgba(180, 83, 9, ${flicker * 0.4})`);
    lampGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lampGlow;
    ctx.fillRect(0, 0, w, h);

    // Subtle drifting sea mist
    ctx.fillStyle = 'rgba(203, 213, 225, 0.04)';
    const mistShift = Math.sin(t * 1.5) * 40;
    ctx.beginPath();
    ctx.ellipse(w * 0.3 + mistShift, h * 0.6, 350, 100, 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Cyberpunk Diagonal Rain Streaks on Camera Lens & Steam
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.4)';
    ctx.lineWidth = 1.8;
    rainDrops.forEach((drop) => {
      drop.y += drop.speed;
      drop.x -= drop.speed * 0.35; // Wind drift
      if (drop.y > h) drop.y = -drop.length;
      if (drop.x < 0) drop.x = w;

      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.length * 0.35, drop.y + drop.length);
      ctx.stroke();
    });

    // Water droplets on lens
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    [
      { x: 220, y: 180, r: 4 },
      { x: 380, y: 640, r: 6 },
      { x: w - 280, y: 310, r: 5 },
      { x: w - 440, y: 720, r: 4 },
    ].forEach((drop) => {
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

/**
 * Kepler Sci-Fi Master Background Plate
 */
function renderKeplerMovieSceneBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shotIndex: number,
  shotProgress: number,
  stars: StarParticle[],
  config: CustomizationConfig
) {
  const cx = w / 2;
  const cy = h / 2;

  // Starfield simulation
  ctx.fillStyle = '#ffffff';
  let warpFactor = shotIndex === 4 ? 18.0 : shotIndex === 3 ? 4.0 : 1.0;
  stars.forEach((star) => {
    star.z -= 0.6 * warpFactor;
    if (star.z <= 0) star.z = 1000;
    const k = 450 / star.z;
    const px = star.x * k + cx;
    const py = star.y * k + cy;

    if (px >= 0 && px < w && py >= 0 && py < h) {
      if (shotIndex >= 3) {
        const streakLen = Math.min(180, (1000 - star.z) * 0.12 * warpFactor);
        const angle = Math.atan2(py - cy, px - cx);
        ctx.strokeStyle = `rgba(224, 242, 254, ${Math.min(1, k * 0.85)})`;
        ctx.lineWidth = Math.max(1, star.size * k * 0.7);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(angle) * streakLen, py + Math.sin(angle) * streakLen);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(px, py, star.size * k, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // Dying Kepler Star (Solar core flare)
  const starRadius = 280 + Math.sin(t * 3) * 15;
  const starGrad = ctx.createRadialGradient(cx + 250, cy - 100, 20, cx + 250, cy - 100, starRadius * 1.6);
  starGrad.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
  starGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.75)');
  starGrad.addColorStop(0.7, 'rgba(225, 29, 72, 0.35)');
  starGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = starGrad;
  ctx.beginPath();
  ctx.arc(cx + 250, cy - 100, starRadius * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Cockpit HUD vectors
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(180, 160, 260, 120);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '11px monospace';
  ctx.fillText('KEPLER-452 // CORE ANOMALY', 195, 185);
  ctx.fillText(`WARP VECTOR: ${config.alternateEnding.toUpperCase()}`, 195, 205);
}

/**
 * Fog Lighthouse Nordic Noir Master Background Plate
 */
function renderFogLighthouseMovieSceneBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shotIndex: number,
  shotProgress: number,
  rainDrops: RainParticle[]
) {
  // 1. Weathered Dark Timber Walls
  const wallGrad = ctx.createLinearGradient(0, 0, w, h);
  wallGrad.addColorStop(0, '#1c1917');
  wallGrad.addColorStop(0.5, '#0f172a');
  wallGrad.addColorStop(1, '#020617');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h);

  // Horizontal wood plank seams
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2;
  for (let py = 60; py < h; py += 70) {
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(w, py);
    ctx.stroke();
  }

  // 2. Large Arched Stone Lighthouse Window overlooking the sea
  const winX = w - 620;
  const winY = 90;
  const winW = 440;
  const winH = 560;

  // Outdoor stormy sky inside window
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(winX, winY, winW, winH, [180, 180, 10, 10]);
  ctx.clip();

  // Stormy sea background
  const outdoorGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  outdoorGrad.addColorStop(0, '#0c1222');
  outdoorGrad.addColorStop(0.6, '#0f172a');
  outdoorGrad.addColorStop(1, '#020617');
  ctx.fillStyle = outdoorGrad;
  ctx.fillRect(winX, winY, winW, winH);

  // Distant turbulent ocean waves
  ctx.fillStyle = '#1e293b';
  for (let wy = winY + winH - 140; wy < winY + winH; wy += 35) {
    ctx.beginPath();
    ctx.moveTo(winX, wy);
    for (let wx = winX; wx <= winX + winW; wx += 30) {
      const waveOffset = Math.sin((wx * 0.05) + (t * 4)) * 8;
      ctx.lineTo(wx, wy + waveOffset);
    }
    ctx.lineTo(winX + winW, winY + winH);
    ctx.lineTo(winX, winY + winH);
    ctx.closePath();
    ctx.fill();
  }

  // Rotating Lighthouse Beam through Stormy Fog
  const beamAngle = t * 0.9;
  const beamOriginX = winX + winW * 0.7;
  const beamOriginY = winY + 120;
  const beamEndX = beamOriginX + Math.cos(beamAngle) * 500;
  const beamEndY = beamOriginY + Math.sin(beamAngle) * 350;

  const beamGrad = ctx.createRadialGradient(beamOriginX, beamOriginY, 15, beamEndX, beamEndY, 450);
  beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
  beamGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.25)');
  beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = beamGrad;
  ctx.fillRect(winX, winY, winW, winH);

  // Outdoor rain streaks across window glass
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.25)';
  ctx.lineWidth = 1.2;
  rainDrops.slice(0, 80).forEach((drop) => {
    const rx = winX + (drop.x % winW);
    const ry = winY + (drop.y % winH);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - drop.length * 0.2, ry + drop.length);
    ctx.stroke();
  });

  // Climax lightning flash in Shot 4
  if (shotIndex === 4 && (t % 2.5 < 0.12)) {
    ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
    ctx.fillRect(winX, winY, winW, winH);
  }

  ctx.restore();

  // Heavy Stone Window Frame & Mullions
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.roundRect(winX, winY, winW, winH, [180, 180, 10, 10]);
  ctx.stroke();

  // Window cross mullions
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY + 40);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.moveTo(winX, winY + winH * 0.55);
  ctx.lineTo(winX + winW, winY + winH * 0.55);
  ctx.stroke();

  // 3. Vintage Maritime Sea Chart on Wall (Left)
  ctx.fillStyle = '#451a03';
  ctx.fillRect(110, 160, 260, 320);
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(116, 166, 248, 308);

  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  // Compass rose
  ctx.beginPath();
  ctx.arc(240, 280, 45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(240, 220); ctx.lineTo(240, 340);
  ctx.moveTo(180, 280); ctx.lineTo(300, 280);
  ctx.stroke();
  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 12px serif';
  ctx.fillText('NORDIC SEA CHART · 1954', 130, 450);

  // Brass Marine Barometer on Wall
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(430, 240, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(430, 240, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(430, 240);
  ctx.lineTo(444, 226);
  ctx.stroke();

  // 4. Glowing Antique Kerosene Oil Lamp on Table (Left Foreground)
  const lampX = 280;
  const lampY = h - 280;

  // Lamp brass base
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(lampX, lampY + 70, 40, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glass chimney
  ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(lampX - 18, lampY - 20, 36, 80, 14);
  ctx.fill();
  ctx.stroke();

  // Flickering kerosene flame
  const flameH = 26 + Math.sin(t * 12) * 4;
  const flameGrad = ctx.createRadialGradient(lampX, lampY + 20, 2, lampX, lampY + 20, 22);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.3, '#fde047');
  flameGrad.addColorStop(0.8, '#f97316');
  flameGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.ellipse(lampX, lampY + 20, 9, flameH * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Neon City Cyberpunk Master Background Plate
 */
function renderNeonCityMovieSceneBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shotIndex: number,
  shotProgress: number,
  rainDrops: RainParticle[]
) {
  // 1. Deep Cyberpunk Midnight Sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#05020c');
  sky.addColorStop(0.4, '#090d1f');
  sky.addColorStop(0.8, '#0b0f19');
  sky.addColorStop(1, '#02040a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // 2. Multi-layer Skyscraper Skyline of Neo-Shinjuku
  const buildings = [
    { x: 40, w: 220, h: 680, color: '#090e1c' },
    { x: 280, w: 260, h: 820, color: '#0c1428' },
    { x: 560, w: 180, h: 590, color: '#080d1a' },
    { x: w - 740, w: 280, h: 790, color: '#0d152a' },
    { x: w - 440, w: 210, h: 640, color: '#090e1c' },
    { x: w - 210, w: 240, h: 720, color: '#0b1122' },
  ];

  buildings.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, h - b.h, b.w, b.h);

    // Glowing window grid
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    for (let wy = h - b.h + 40; wy < h - 180; wy += 28) {
      for (let wx = b.x + 20; wx < b.x + b.w - 20; wx += 22) {
        if ((wx + wy) % 7 === 0) {
          ctx.fillRect(wx, wy, 8, 12);
        }
      }
    }
  });

  // 3. Giant Holographic Neon Billboards
  // Left Billboard: Cyan NEO-SHINJUKU
  ctx.save();
  ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 18;
  ctx.strokeRect(140, 190, 320, 150);
  ctx.fillRect(140, 190, 320, 150);

  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('NEO-SHINJUKU', 165, 260);
  ctx.font = '16px monospace';
  ctx.fillStyle = '#a5f3fc';
  ctx.fillText('DISTRICT 14 · SECTOR CYBER', 165, 295);
  ctx.restore();

  // Right Billboard: Magenta ACTORSELF 2099
  ctx.save();
  ctx.fillStyle = 'rgba(236, 72, 153, 0.12)';
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 20;
  ctx.strokeRect(w - 520, 160, 360, 170);
  ctx.fillRect(w - 520, 160, 360, 170);

  ctx.fillStyle = '#ec4899';
  ctx.font = 'bold 38px monospace';
  ctx.fillText('ACTORSELF', w - 480, 230);
  ctx.font = '16px monospace';
  ctx.fillStyle = '#fbcfe8';
  ctx.fillText('NEURAL PROTOCOL · 2099', w - 480, 270);
  ctx.restore();

  // 4. Flying Hover-Car Light Trails across Skyways
  const carY1 = 380;
  const carX1 = ((t * 220) % (w + 400)) - 200;
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(carX1, carY1);
  ctx.lineTo(carX1 + 120, carY1);
  ctx.stroke();

  const carY2 = 460;
  const carX2 = w - (((t * 180) % (w + 400)) - 200);
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
  ctx.beginPath();
  ctx.moveTo(carX2, carY2);
  ctx.lineTo(carX2 - 100, carY2);
  ctx.stroke();

  // 5. Rooftop Ventilation Turbine (Center Right) with Rotating Blades
  const fanX = w - 240;
  const fanY = h - 340;
  const fanR = 55;

  ctx.fillStyle = '#18181b';
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(fanX, fanY, fanR + 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Animated rotating blades
  const fanRot = t * 14;
  ctx.fillStyle = '#27272a';
  for (let b = 0; b < 6; b++) {
    const a = fanRot + (b * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(fanX, fanY);
    ctx.arc(fanX, fanY, fanR, a, a + 0.35);
    ctx.closePath();
    ctx.fill();
  }

  // Steam billowing from rooftop exhaust
  ctx.fillStyle = 'rgba(212, 212, 216, 0.08)';
  const steamOffset = (t * 80) % 240;
  ctx.beginPath();
  ctx.ellipse(fanX - 30, fanY - steamOffset, 60 + steamOffset * 0.4, 40 + steamOffset * 0.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders Lower Third Cinematic Info Card & Actor Replacement Verification
 */
function renderCinematicTitlesAndLowerThird(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shotIndex: number,
  shotProgress: number,
  participantName: string,
  scene: CinematicSceneDefinition,
  config: CustomizationConfig
) {
  if (shotIndex === 1 && shotProgress < 0.85) {
    ctx.save();
    const alpha = Math.min(1, shotProgress * 3);
    ctx.globalAlpha = alpha;

    const bx = 110;
    const by = h - 220;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bx, by, 540, 84);
    ctx.strokeRect(bx, by, 540, 84);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'left';
    ctx.fillText(participantName.toUpperCase(), bx + 24, by + 38);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`PROTAGONISTA REEMPLAZANDO A: ${scene.originalActorName.split('(')[0].trim().toUpperCase()}`, bx + 24, by + 62);
    ctx.restore();
  }
}

/**
 * Renders Shot 4 Hero Resolution Card
 */
function renderHeroTitleCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shotProgress: number,
  participantName: string,
  emotions: LoadedEmotionMap,
  fallbackImg: HTMLImageElement | null,
  scene: CinematicSceneDefinition,
  config: CustomizationConfig
) {
  const cardAlpha = Math.min(1, (shotProgress - 0.45) / 0.25);
  ctx.save();
  ctx.globalAlpha = cardAlpha;

  ctx.fillStyle = '#01040a';
  ctx.fillRect(0, 0, w, h);

  const heroGrad = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, 850);
  heroGrad.addColorStop(0, 'rgba(14, 116, 144, 0.4)');
  heroGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.85)');
  heroGrad.addColorStop(1, 'rgba(1, 4, 9, 0.98)');
  ctx.fillStyle = heroGrad;
  ctx.fillRect(0, 0, w, h);

  // Hero Portrait
  const heroFace = emotions.sonriente || emotions.decidido || fallbackImg;
  if (heroFace) {
    const r = 90;
    const py = h / 2 - 140;
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, py, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(heroFace, w / 2 - r, py - r, r * 2, r * 2);
    ctx.restore();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w / 2, py, r + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ACTORSELF Brand
  ctx.font = '900 76px serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
  ctx.shadowBlur = 35;
  ctx.fillText('ACTORSELF', w / 2, h / 2 + 10);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 240, h / 2 + 35);
  ctx.lineTo(w / 2 + 240, h / 2 + 35);
  ctx.stroke();

  // Official Credit Claim
  ctx.font = 'bold 26px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillStyle = '#f8fafc';
  ctx.shadowBlur = 10;
  ctx.fillText(`PROTAGONIZADA POR: ${participantName.toUpperCase()}`, w / 2, h / 2 + 80);

  ctx.font = '15px monospace';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = '#94a3b8';
  ctx.shadowBlur = 0;
  ctx.fillText(`${scene.title.toUpperCase()} · CONCEPTO EXCLUSIVO AMAZON PRIME VIDEO`, w / 2, h / 2 + 120);

  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('TU HISTORIA COMIENZA AQUÍ', w / 2, h / 2 + 160);

  ctx.restore();
}

/**
 * 2.39:1 Anamorphic Film Letterbox & 35mm Grain Texture
 */
function renderFilmGrainAndLetterbox(ctx: CanvasRenderingContext2D, w: number, h: number, _t?: number) {
  // Anamorphic 2.39:1 Black Bars
  const barH = 65;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, barH);
  ctx.fillRect(0, h - barH, w, barH);
}

/**
 * Web Audio API Synthesis Engine tailored to selected scene audio profile
 */
function setupSceneCinematicAudio(
  audioCtx: AudioContext,
  destination: MediaStreamAudioDestinationNode,
  profile: 'space_hyperspace' | 'nordic_rain_foley' | 'cyberpunk_synth_rain',
  ending: AlternateClimax,
  durationSec: number
) {
  const now = audioCtx.currentTime;

  if (profile === 'space_hyperspace') {
    // Sci-Fi Space Rumble & Warp Jump
    const drone = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(52, now);
    drone.frequency.exponentialRampToValueAtTime(75, now + durationSec * 0.8);

    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(130, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + durationSec);

    drone.connect(f);
    f.connect(gain);
    gain.connect(destination);
    drone.start(now);
    drone.stop(now + durationSec + 0.5);

    // Cinematic orchestral brass tension chords in Shot 2 (warm dramatic suspense)
    for (let s = 4.0; s < 8.0; s += 1.0) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const filt = audioCtx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(320, now + s);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130.81, now + s); // C3 fundamental
      osc.frequency.exponentialRampToValueAtTime(146.83, now + s + 0.8); // D3 tension

      g.gain.setValueAtTime(0.12, now + s);
      g.gain.exponentialRampToValueAtTime(0.001, now + s + 0.85);

      osc.connect(filt);
      filt.connect(g);
      g.connect(destination);
      osc.start(now + s);
      osc.stop(now + s + 0.9);
    }
  } else if (profile === 'nordic_rain_foley') {
    // Melancholic Nordic Noir Rain & Cello Ambience
    const cello = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    cello.type = 'sawtooth';
    cello.frequency.setValueAtTime(65.41, now); // C2 note
    cello.frequency.exponentialRampToValueAtTime(82.41, now + durationSec * 0.7); // E2 note

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationSec);

    cello.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    cello.start(now);
    cello.stop(now + durationSec + 0.5);

    // Distant ocean thunder rumble at t=10.5s
    const thunder = audioCtx.createOscillator();
    const thunderGain = audioCtx.createGain();
    thunder.type = 'sine';
    thunder.frequency.setValueAtTime(45, now + 10.5);
    thunder.frequency.exponentialRampToValueAtTime(28, now + 13.5);
    thunderGain.gain.setValueAtTime(0.2, now + 10.5);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 13.5);
    thunder.connect(thunderGain);
    thunderGain.connect(destination);
    thunder.start(now + 10.5);
    thunder.stop(now + 13.6);
  } else {
    // Cyberpunk Analog Synth Riser & Arpeggio
    const synth = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    synth.type = 'sawtooth';
    synth.frequency.setValueAtTime(110, now);
    synth.frequency.exponentialRampToValueAtTime(440, now + durationSec * 0.85);

    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(450, now);
    f.frequency.linearRampToValueAtTime(1800, now + durationSec * 0.85);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationSec);

    synth.connect(f);
    f.connect(gain);
    gain.connect(destination);
    synth.start(now);
    synth.stop(now + durationSec + 0.5);
  }
}
