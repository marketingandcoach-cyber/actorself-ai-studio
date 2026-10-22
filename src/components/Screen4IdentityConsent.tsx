import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Check,
  Eye,
  Sparkles,
  Video,
  Square,
  Play,
  RotateCcw,
  Sliders,
  Award,
  Layers,
  HelpCircle,
  Info,
  Timer,
  Scan,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { ParticipantProfile, EmotionKey, TalentProfile } from '../types';
import { EMOTION_GUIDES } from '../data/emotions';
import defaultMateoPortrait from '../assets/images/protagonist_male_face_1792681375296.jpg';
import defaultElenaPortrait from '../assets/images/protagonist_actor_face_1792681360904.jpg';

interface Screen4IdentityConsentProps {
  participant: ParticipantProfile;
  onUpdateParticipant: (updated: Partial<ParticipantProfile>) => void;
  onProceed: () => void;
  onBack: () => void;
}

type CameraCaptureMode = 'standard' | 'motion' | 'fullbody';

export const Screen4IdentityConsent: React.FC<Screen4IdentityConsentProps> = ({
  participant,
  onUpdateParticipant,
  onProceed,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emotionFileInputRef = useRef<HTMLInputElement | null>(null);
  const fullBodyFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  // Camera & Mode State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [activeCaptureMode, setActiveCaptureMode] = useState<CameraCaptureMode>('standard');
  const [activeCapturingEmotion, setActiveCapturingEmotion] = useState<EmotionKey | 'main'>('main');

  // Motion Capture State
  const [isCapturingMotion, setIsCapturingMotion] = useState<boolean>(false);
  const [motionPhase, setMotionPhase] = useState<number>(0); // 0: Centro, 1: Izquierda, 2: Derecha, 3: Gesto
  const [motionProgress, setMotionProgress] = useState<number>(0);
  const motionFramesRef = useRef<{ phase: number; dataUrl: string }[]>([]);

  // Full-body Countdown State
  const [bodyCountdown, setBodyCountdown] = useState<number | null>(null);

  // Talent Sample Video State
  const [isRecordingSample, setIsRecordingSample] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // UI State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedEmotionTab, setSelectedEmotionTab] = useState<EmotionKey>('molesto');
  const [showTalentDrawer, setShowTalentDrawer] = useState<boolean>(false);

  // Stop camera tracks cleanly on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Timer for sample video recording (5–10s)
  useEffect(() => {
    let interval: any = null;
    if (isRecordingSample) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 9) {
            stopVideoRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingSample]);

  // Full Body Countdown handler
  useEffect(() => {
    let timer: any = null;
    if (bodyCountdown !== null && bodyCountdown > 0) {
      timer = setTimeout(() => {
        setBodyCountdown(bodyCountdown - 1);
      }, 1000);
    } else if (bodyCountdown === 0) {
      captureFullBody();
      setBodyCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [bodyCountdown]);

  // Start camera with specified mode
  const startCamera = async (mode: CameraCaptureMode = 'standard', emotionTarget: EmotionKey | 'main' = 'main') => {
    try {
      setActiveCaptureMode(mode);
      setActiveCapturingEmotion(emotionTarget);
      setValidationError(null);

      // Desired resolution
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: mode === 'fullbody' ? 1280 : 1280 },
          height: { ideal: mode === 'fullbody' ? 720 : 720 },
          facingMode: 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 60);
    } catch (err: any) {
      console.warn('Error accediendo a cámara:', err);
      setValidationError('No se pudo acceder a la cámara. Comprueba los permisos de tu navegador o utiliza la opción de subir fotografías.');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsRecordingSample(false);
    setIsCapturingMotion(false);
    setBodyCountdown(null);
  };

  // 1. Capture Static Square Snapshot (standard mode)
  const captureSnapshot = (target: EmotionKey | 'main') => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = videoRef.current.videoWidth || 600;
    const vh = videoRef.current.videoHeight || 600;
    const minDim = Math.min(vw, vh);
    const sx = (vw - minDim) / 2;
    const sy = (vh - minDim) / 2;

    // Draw mirrored image to match user preview
    ctx.translate(600, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, sx, sy, minDim, minDim, 0, 0, 600, 600);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    if (target === 'main') {
      onUpdateParticipant({
        photoDataUrl: dataUrl,
        captureMode: 'standard',
        expressions: {
          ...participant.expressions,
          molesto: participant.expressions.molesto || dataUrl,
        },
      });
    } else {
      onUpdateParticipant({
        photoDataUrl: participant.photoDataUrl || dataUrl,
        expressions: {
          ...participant.expressions,
          [target]: dataUrl,
        },
      });
    }

    stopCamera();
    setValidationError(null);
  };

  // 2. Motion Face Capture Flow (Multi-angle 3D burst over 4 seconds)
  const startMotionCapture = () => {
    if (!videoRef.current || !cameraStream) return;

    setIsCapturingMotion(true);
    setMotionPhase(0);
    setMotionProgress(0);
    motionFramesRef.current = [];
    videoChunksRef.current = [];

    // Optional silent video recorder for motion preview loop
    let motionRecorder: MediaRecorder | null = null;
    const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    const chosenMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    try {
      if (chosenMime) {
        motionRecorder = new MediaRecorder(cameraStream, { mimeType: chosenMime });
        motionRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) videoChunksRef.current.push(e.data);
        };
        motionRecorder.start(100);
      }
    } catch (e) {
      console.warn('Motion recorder fallback:', e);
    }

    const duration = 4000; // 4 seconds total
    const startTime = Date.now();

    // Helper to grab instantaneous frame
    const grabFrame = (phaseIdx: number) => {
      if (!videoRef.current) return;
      const c = document.createElement('canvas');
      c.width = 600;
      c.height = 600;
      const cx = c.getContext('2d');
      if (!cx) return;

      const vw = videoRef.current.videoWidth || 600;
      const vh = videoRef.current.videoHeight || 600;
      const minDim = Math.min(vw, vh);
      const sx = (vw - minDim) / 2;
      const sy = (vh - minDim) / 2;

      cx.translate(600, 0);
      cx.scale(-1, 1);
      cx.drawImage(videoRef.current, sx, sy, minDim, minDim, 0, 0, 600, 600);
      const frameUrl = c.toDataURL('image/jpeg', 0.9);
      motionFramesRef.current.push({ phase: phaseIdx, dataUrl: frameUrl });
    };

    // Grab first frame (Center)
    setTimeout(() => grabFrame(0), 400);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = Math.min(100, Math.round((elapsed / duration) * 100));
      setMotionProgress(prog);

      if (elapsed >= 1000 && elapsed < 2000) {
        setMotionPhase(1); // Left turn
      } else if (elapsed >= 2000 && elapsed < 3000) {
        setMotionPhase(2); // Right turn
      } else if (elapsed >= 3000) {
        setMotionPhase(3); // Peak expression
      }

      // Grab snapshots at phase transitions
      if (elapsed >= 1400 && motionFramesRef.current.length === 1) {
        grabFrame(1);
      }
      if (elapsed >= 2400 && motionFramesRef.current.length === 2) {
        grabFrame(2);
      }
      if (elapsed >= 3400 && motionFramesRef.current.length === 3) {
        grabFrame(3);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        if (motionRecorder && motionRecorder.state !== 'inactive') {
          motionRecorder.onstop = () => {
            const blob = new Blob(videoChunksRef.current, { type: chosenMime || 'video/webm' });
            const motionVideoUrl = URL.createObjectURL(blob);
            finalizeMotionCapture(motionVideoUrl);
          };
          motionRecorder.stop();
        } else {
          finalizeMotionCapture();
        }
      }
    }, 80);
  };

  const finalizeMotionCapture = (motionUrl?: string) => {
    setIsCapturingMotion(false);

    const frames = motionFramesRef.current;
    const centerFrame = frames.find((f) => f.phase === 0)?.dataUrl || frames[0]?.dataUrl;
    const leftFrame = frames.find((f) => f.phase === 1)?.dataUrl || centerFrame;
    const rightFrame = frames.find((f) => f.phase === 2)?.dataUrl || centerFrame;
    const climaxFrame = frames.find((f) => f.phase === 3)?.dataUrl || centerFrame;

    if (centerFrame) {
      onUpdateParticipant({
        photoDataUrl: centerFrame,
        motionVideoUrl: motionUrl || participant.motionVideoUrl,
        captureMode: 'motion',
        expressions: {
          ...participant.expressions,
          decidido: centerFrame,
          molesto: leftFrame || centerFrame,
          dudoso: rightFrame || centerFrame,
          sonriente: climaxFrame || centerFrame,
        },
      });
    }

    stopCamera();
    setValidationError(null);
  };

  // 3. Full Body Capture Flow
  const startFullBodyCountdown = (seconds: number = 3) => {
    setBodyCountdown(seconds);
  };

  const captureFullBody = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    // Portrait frame 720x960 (3:4 ratio)
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = videoRef.current.videoWidth || 1280;
    const vh = videoRef.current.videoHeight || 720;

    // Crop center vertical slice
    const targetAspect = 720 / 960;
    let sw = vh * targetAspect;
    let sh = vh;
    if (sw > vw) {
      sw = vw;
      sh = vw / targetAspect;
    }
    const sx = (vw - sw) / 2;
    const sy = (vh - sh) / 2;

    ctx.translate(720, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, sx, sy, sw, sh, 0, 0, 720, 960);
    const fullBodyUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Also extract head crop if main photo is empty
    let mainPhoto = participant.photoDataUrl;
    if (!mainPhoto) {
      const headCanvas = document.createElement('canvas');
      headCanvas.width = 400;
      headCanvas.height = 400;
      const hctx = headCanvas.getContext('2d');
      if (hctx) {
        // Upper 35% of the body frame contains the face
        hctx.drawImage(canvas, 160, 40, 400, 400, 0, 0, 400, 400);
        mainPhoto = headCanvas.toDataURL('image/jpeg', 0.9);
      }
    }

    onUpdateParticipant({
      fullBodyDataUrl: fullBodyUrl,
      photoDataUrl: mainPhoto || fullBodyUrl,
      captureMode: 'fullbody',
      expressions: {
        ...participant.expressions,
        molesto: participant.expressions.molesto || mainPhoto || fullBodyUrl,
      },
    });

    stopCamera();
    setValidationError(null);
  };

  // Start 5-10s video recording (silent talent sample)
  const startVideoRecording = () => {
    if (!cameraStream) return;
    videoChunksRef.current = [];
    const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    const chosenMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    try {
      const recorder = new MediaRecorder(cameraStream, chosenMime ? { mimeType: chosenMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: chosenMime || 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        onUpdateParticipant({
          talent: {
            ...participant.talent,
            videoSampleUrl: videoUrl,
            videoSampleDurationSec: recordingSeconds || 5,
          },
        });
      };

      recorder.start(250);
      setIsRecordingSample(true);
      setRecordingSeconds(0);
    } catch (e: any) {
      console.warn('MediaRecorder error:', e);
      setValidationError('No se pudo inicializar la grabación de muestra en este navegador.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingSample(false);
  };

  // Handle local file uploads (JPG/PNG/WebP <= 5MB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: EmotionKey | 'main' | 'fullbody') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      setValidationError('Formato no compatible. Por favor sube archivos JPG, PNG o WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('El archivo excede el límite máximo de 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'fullbody') {
        onUpdateParticipant({
          fullBodyDataUrl: dataUrl,
          photoDataUrl: participant.photoDataUrl || dataUrl,
          captureMode: 'fullbody',
        });
      } else if (target === 'main') {
        onUpdateParticipant({
          photoDataUrl: dataUrl,
          captureMode: 'standard',
          expressions: {
            ...participant.expressions,
            molesto: participant.expressions.molesto || dataUrl,
          },
        });
      } else {
        onUpdateParticipant({
          photoDataUrl: participant.photoDataUrl || dataUrl,
          expressions: {
            ...participant.expressions,
            [target]: dataUrl,
          },
        });
      }
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  // Strict Privacy: purge all photos, motion clip, body plate and revoke consent
  const handleRevokeAndClearAll = () => {
    stopCamera();
    if (participant.talent.videoSampleUrl) {
      URL.revokeObjectURL(participant.talent.videoSampleUrl);
    }
    if (participant.motionVideoUrl) {
      URL.revokeObjectURL(participant.motionVideoUrl);
    }
    onUpdateParticipant({
      photoDataUrl: '',
      fullBodyDataUrl: undefined,
      motionVideoUrl: undefined,
      captureMode: undefined,
      consentGiven: false,
      consentTimestamp: undefined,
      expressions: {},
      talent: {
        ...participant.talent,
        videoSampleUrl: undefined,
        talentConsentGiven: false,
      },
    });
    setValidationError(null);
  };

  // Delete individual items
  const deleteEmotion = (key: EmotionKey) => {
    const nextExpressions = { ...participant.expressions };
    delete nextExpressions[key];
    onUpdateParticipant({ expressions: nextExpressions });
  };

  const deleteFullBody = () => {
    onUpdateParticipant({ fullBodyDataUrl: undefined });
  };

  const deleteMotionVideo = () => {
    if (participant.motionVideoUrl) {
      URL.revokeObjectURL(participant.motionVideoUrl);
    }
    onUpdateParticipant({ motionVideoUrl: undefined });
  };

  // Validation before proceeding to Screen 5
  const handleContinue = () => {
    if (!participant.name.trim()) {
      setValidationError('Por favor introduce tu nombre de Comandante.');
      return;
    }
    if (!participant.photoDataUrl && !participant.fullBodyDataUrl && Object.keys(participant.expressions).length === 0) {
      setValidationError('Es necesario capturar o subir al menos una fotografía de rostro o cuerpo para integrarte en la cabina.');
      return;
    }
    if (!participant.consentGiven) {
      setValidationError('Debes marcar la casilla de consentimiento expreso para la composición de la escena.');
      return;
    }

    stopCamera();
    setValidationError(null);
    onProceed();
  };

  const activeGuides = participant.studioMode
    ? EMOTION_GUIDES
    : EMOTION_GUIDES.filter((g) => g.category === 'core');

  const capturedCount = Object.keys(participant.expressions).length;
  const currentEmotionGuide = EMOTION_GUIDES.find((g) => g.key === selectedEmotionTab) || EMOTION_GUIDES[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Etapa 4 · ACTOR PRO · Captura Facial & Corporal</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
            Captura de Identidad & Movimiento
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateParticipant({ studioMode: !participant.studioMode })}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                participant.studioMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Modo Studio: {participant.studioMode ? '8 Emociones (Activado)' : '4 Emociones Core'}
            </button>
            <button
              onClick={() => setShowTalentDrawer(!showTalentDrawer)}
              className="px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-700/60 text-indigo-300 text-xs font-medium hover:bg-indigo-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>ACTORSELF Talent</span>
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl">
          Activa tu cámara para registrar tu <strong>rostro fijo</strong>, escanear tu <strong>rostro en movimiento multi-ángulo</strong> o capturar tu <strong>cuerpo completo</strong> para calibrar el traje y la postura del protagonista en la escena.
        </p>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-3 shadow-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Capture Engine & Controls (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
          {/* Participant Name */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Nombre de Protagonista (Grabado en traje e insignia)
            </label>
            <input
              type="text"
              value={participant.name}
              onChange={(e) => onUpdateParticipant({ name: e.target.value })}
              placeholder="Ej. Mateo Rivera o Comandante Vance"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:border-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Quick Demo Protagonist Presets */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/50 via-slate-950 to-indigo-950/50 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-sky-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Retratos Oficiales de Demostración (Prueba Rápida 1 Clic)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">1080p Listo</span>
            </div>
            <p className="text-xs text-slate-400">
              ¿No tienes cámara o foto a mano? Selecciona un protagonista prediseñado de alta fidelidad para probar de inmediato la sustitución facial en la escena:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  onUpdateParticipant({
                    name: 'Mateo Rivera',
                    photoDataUrl: defaultMateoPortrait,
                    consentGiven: true,
                    consentTimestamp: Date.now(),
                    expressions: {
                      molesto: defaultMateoPortrait,
                      decidido: defaultMateoPortrait,
                      dudoso: defaultMateoPortrait,
                      sonriente: defaultMateoPortrait,
                      asustado: defaultMateoPortrait,
                      triste: defaultMateoPortrait,
                      sorprendido: defaultMateoPortrait,
                      pensativo: defaultMateoPortrait,
                    },
                  });
                  setValidationError(null);
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-sky-500/40 hover:border-sky-400 transition-all text-left cursor-pointer group"
              >
                <img
                  src={defaultMateoPortrait}
                  alt="Mateo Rivera"
                  className="w-12 h-12 rounded-lg object-cover border border-sky-400/80 shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white group-hover:text-sky-300">Comandante Mateo Rivera</div>
                  <div className="text-[10px] font-mono text-slate-400">Astronauta · Traje Táctico AESA</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateParticipant({
                    name: 'Elena Vance',
                    photoDataUrl: defaultElenaPortrait,
                    consentGiven: true,
                    consentTimestamp: Date.now(),
                    expressions: {
                      molesto: defaultElenaPortrait,
                      decidido: defaultElenaPortrait,
                      dudoso: defaultElenaPortrait,
                      sonriente: defaultElenaPortrait,
                      asustado: defaultElenaPortrait,
                      triste: defaultElenaPortrait,
                      sorprendido: defaultElenaPortrait,
                      pensativo: defaultElenaPortrait,
                    },
                  });
                  setValidationError(null);
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-indigo-500/40 hover:border-indigo-400 transition-all text-left cursor-pointer group"
              >
                <img
                  src={defaultElenaPortrait}
                  alt="Elena Vance"
                  className="w-12 h-12 rounded-lg object-cover border border-indigo-400/80 shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300">Comandante Elena Vance</div>
                  <div className="text-[10px] font-mono text-slate-400">Oficial de Vuelo · Alianza Aurora</div>
                </div>
              </button>
            </div>
          </div>

          {/* Camera Mode Selection Switcher */}
          <div className="space-y-3 border-t border-slate-800 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Modalidad de Captura de Cámara</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                100% en memoria local
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Option 1: Rostro Fijo */}
              <button
                type="button"
                onClick={() => {
                  setActiveCaptureMode('standard');
                  if (!isCameraActive) startCamera('standard', selectedEmotionTab);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  activeCaptureMode === 'standard' && isCameraActive
                    ? 'bg-sky-950/60 border-sky-400 shadow-lg ring-1 ring-sky-400/50'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">Rostro Fijo</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Foto frontal y expresiones clave
                </p>
              </button>

              {/* Option 2: Rostro en Movimiento */}
              <button
                type="button"
                onClick={() => {
                  setActiveCaptureMode('motion');
                  if (!isCameraActive) startCamera('motion');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  activeCaptureMode === 'motion' && isCameraActive
                    ? 'bg-sky-950/60 border-sky-400 shadow-lg ring-1 ring-sky-400/50'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Scan className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">En Movimiento</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Escaneo 3D multi-ángulo 4 seg
                </p>
                {participant.motionVideoUrl && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>

              {/* Option 3: Cuerpo Completo */}
              <button
                type="button"
                onClick={() => {
                  setActiveCaptureMode('fullbody');
                  if (!isCameraActive) startCamera('fullbody');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  activeCaptureMode === 'fullbody' && isCameraActive
                    ? 'bg-sky-950/60 border-sky-400 shadow-lg ring-1 ring-sky-400/50'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Cuerpo Entero</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Silueta para traje & postura
                </p>
                {participant.fullBodyDataUrl && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Active Camera Viewfinder */}
          {isCameraActive ? (
            <div className="p-4 rounded-3xl bg-black border-2 border-sky-500 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-sky-400 font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span>
                    Cámara en vivo:{' '}
                    {activeCaptureMode === 'standard' && `Capturando "${activeCapturingEmotion}"`}
                    {activeCaptureMode === 'motion' && 'Escaneo facial en movimiento'}
                    {activeCaptureMode === 'fullbody' && 'Calibración de cuerpo completo'}
                  </span>
                </span>
                <button
                  onClick={stopCamera}
                  className="text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
                >
                  Detener cámara
                </button>
              </div>

              {/* Viewfinder Window */}
              <div className="relative aspect-video max-w-[500px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* HUD Overlay: MODE 1 (Standard Face) */}
                {activeCaptureMode === 'standard' && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-48 h-56 rounded-[50%] border-2 border-dashed border-sky-400/80 relative flex items-center justify-center">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-sky-300 absolute -top-1 -left-1"></div>
                      <div className="w-4 h-4 border-t-2 border-r-2 border-sky-300 absolute -top-1 -right-1"></div>
                      <div className="w-4 h-4 border-b-2 border-l-2 border-sky-300 absolute -bottom-1 -left-1"></div>
                      <div className="w-4 h-4 border-b-2 border-r-2 border-sky-300 absolute -bottom-1 -right-1"></div>
                      <span className="text-[9px] font-mono text-sky-300/80 bg-slate-950/70 px-2 py-0.5 rounded">
                        ALINEACIÓN FACIAL
                      </span>
                    </div>
                  </div>
                )}

                {/* HUD Overlay: MODE 2 (Rostro en Movimiento) */}
                {activeCaptureMode === 'motion' && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 bg-gradient-to-t from-black/70 via-transparent to-black/60">
                    <div className="flex items-center gap-2 bg-slate-950/80 border border-sky-500/60 px-3 py-1 rounded-full text-sky-300 text-[11px] font-mono">
                      <Scan className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                      <span>
                        {motionPhase === 0 && '1. Mira de frente al centro'}
                        {motionPhase === 1 && '2. Gira suavemente a la izquierda (-15°)'}
                        {motionPhase === 2 && '3. Gira suavemente a la derecha (+15°)'}
                        {motionPhase === 3 && '4. Haz un gesto intenso (Sonrisa / Alerta)'}
                      </span>
                    </div>

                    {/* Central Target with Motion Compass */}
                    <div className="w-44 h-52 rounded-[45%] border-2 border-sky-400/90 relative flex items-center justify-center">
                      <div
                        className={`absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-sky-400 transition-all ${
                          motionPhase === 1 ? 'bg-sky-400 scale-125' : 'bg-transparent'
                        }`}
                      ></div>
                      <div
                        className={`absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-sky-400 transition-all ${
                          motionPhase === 2 ? 'bg-sky-400 scale-125' : 'bg-transparent'
                        }`}
                      ></div>
                      <span className="text-[10px] font-mono text-sky-200 bg-slate-950/80 px-2.5 py-1 rounded-full">
                        {isCapturingMotion ? `Capturando ${motionProgress}%` : 'Listo para iniciar'}
                      </span>
                    </div>

                    {/* Motion Progress Bar */}
                    {isCapturingMotion && (
                      <div className="w-full max-w-xs bg-slate-900/90 h-2 rounded-full overflow-hidden border border-sky-500/50">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-100"
                          style={{ width: `${motionProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {/* HUD Overlay: MODE 3 (Cuerpo Completo) */}
                {activeCaptureMode === 'fullbody' && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-2 bg-gradient-to-t from-black/60 via-transparent to-black/60">
                    {/* Humanoid Hologram Silhouette */}
                    <div className="relative w-44 h-64 border border-dashed border-amber-400/80 rounded-3xl flex flex-col items-center justify-between p-2">
                      <div className="w-14 h-16 rounded-[45%] border border-amber-300/80 mt-1 flex items-center justify-center">
                        <span className="text-[8px] font-mono text-amber-300">Cabeza</span>
                      </div>
                      <div className="w-32 h-28 border border-amber-300/60 rounded-xl flex items-center justify-center">
                        <span className="text-[9px] font-mono text-amber-200">Torso & Traje</span>
                      </div>
                      <div className="w-20 h-14 border-t border-amber-300/50 flex items-center justify-center">
                        <span className="text-[8px] font-mono text-amber-300/70">Piernas</span>
                      </div>
                    </div>

                    {/* Countdown Overlay */}
                    {bodyCountdown !== null && (
                      <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center">
                        <span className="text-7xl font-extrabold text-amber-400 font-mono animate-bounce">
                          {bodyCountdown === 0 ? '¡Listo!' : bodyCountdown}
                        </span>
                        <span className="text-xs font-mono text-slate-300 mt-2">
                          Colócate dentro de la silueta
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sample Recording Badge */}
                {isRecordingSample && (
                  <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono text-xs px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                    <Square className="w-2.5 h-2.5 fill-white" />
                    <span>REC MUESTRA {recordingSeconds}s / 10s</span>
                  </div>
                )}
              </div>

              {/* Viewfinder Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {activeCaptureMode === 'standard' && (
                  <button
                    onClick={() => captureSnapshot(activeCapturingEmotion)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar Rostro Fijo</span>
                  </button>
                )}

                {activeCaptureMode === 'motion' && (
                  <button
                    disabled={isCapturingMotion}
                    onClick={startMotionCapture}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <Scan className="w-4 h-4" />
                    <span>
                      {isCapturingMotion ? 'Escaneando movimiento...' : 'Iniciar Escaneo de Movimiento (4s)'}
                    </span>
                  </button>
                )}

                {activeCaptureMode === 'fullbody' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startFullBodyCountdown(3)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      <Timer className="w-4 h-4" />
                      <span>Capturar Cuerpo (3s Temporizador)</span>
                    </button>
                    <button
                      onClick={() => startFullBodyCountdown(5)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-medium cursor-pointer"
                    >
                      5s
                    </button>
                    <button
                      onClick={captureFullBody}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-medium cursor-pointer"
                    >
                      Instantáneo
                    </button>
                  </div>
                )}

                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs cursor-pointer"
                >
                  Cerrar cámara
                </button>
              </div>
            </div>
          ) : (
            /* Button to Activate Camera if not active */
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-950 to-indigo-950/40 border border-sky-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-mono font-bold text-sky-400 flex items-center justify-center sm:justify-start gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Cámara Web Lista para Activarse</span>
                </span>
                <p className="text-xs text-slate-400">
                  Elige captura fija, escaneo de rostro en movimiento o silueta de cuerpo entero.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => startCamera(activeCaptureMode, selectedEmotionTab)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activar Cámara</span>
                </button>
              </div>
            </div>
          )}

          {/* Actor Pro Emotion Carousel / Tabs */}
          <div className="space-y-3 border-t border-slate-800 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audición de Expresiones ({capturedCount}/{activeGuides.length} capturadas)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Guía de actuación
              </span>
            </div>

            {/* Emotion Tab Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeGuides.map((guide) => {
                const hasPhoto = !!participant.expressions[guide.key];
                const isSelected = selectedEmotionTab === guide.key;

                return (
                  <button
                    key={guide.key}
                    type="button"
                    onClick={() => {
                      setSelectedEmotionTab(guide.key);
                      if (isCameraActive) {
                        setActiveCapturingEmotion(guide.key);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 shadow-md ring-1 ring-sky-400/40'
                        : hasPhoto
                        ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold capitalize ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                        {guide.key}
                      </span>
                      {hasPhoto && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">
                      {guide.category === 'core' ? 'Core' : 'Studio'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Emotion Directive Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-mono uppercase text-sky-400 font-bold block">
                    Instrucción para Protagonista: {currentEmotionGuide.label}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    "{currentEmotionGuide.instruction}"
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                  {currentEmotionGuide.narrativeUse}
                </span>
              </div>

              {/* Active Emotion Photo Preview or Action Buttons */}
              {participant.expressions[selectedEmotionTab] ? (
                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black border border-emerald-500 shadow-md">
                      <img
                        src={participant.expressions[selectedEmotionTab]}
                        alt={selectedEmotionTab}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block capitalize">
                        {selectedEmotionTab} capturado
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Conectado a la sincronización facial
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startCamera('standard', selectedEmotionTab)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Repetir captura con cámara"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEmotion(selectedEmotionTab)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer"
                      title="Eliminar expresión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => startCamera('standard', selectedEmotionTab)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activar cámara para "{selectedEmotionTab}"</span>
                  </button>

                  <button
                    onClick={() => emotionFileInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir archivo (≤ 5MB)</span>
                  </button>
                </div>
              )}
            </div>

            <input
              ref={emotionFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileUpload(e, selectedEmotionTab)}
              className="hidden"
            />
            <input
              ref={fullBodyFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileUpload(e, 'fullbody')}
              className="hidden"
            />
          </div>

          {/* Mandatory Privacy & Facial Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={participant.consentGiven}
                onChange={(e) =>
                  onUpdateParticipant({
                    consentGiven: e.target.checked,
                    consentTimestamp: e.target.checked ? Date.now() : undefined,
                  })
                }
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-0.5">Consentimiento expreso obligatorio:</strong>
                Autorizo el uso de mis expresiones faciales y captura corporal exclusivamente en la memoria de sesión del navegador para componer la escena cinematográfica. Entiendo que las imágenes no se transmiten a servidores externos, no se guardan en almacenamiento permanente ni constituyen autenticación biométrica legal.
              </span>
            </label>

            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
              <span className="text-slate-500 font-mono">Control de privacidad del usuario</span>
              <button
                type="button"
                onClick={handleRevokeAndClearAll}
                className="text-rose-400 hover:text-rose-300 font-medium underline cursor-pointer"
              >
                Eliminar todo y revocar consentimiento
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Expression Mosaic, Motion Clip & Full Body Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Facial Expression Mosaic Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                Mosaico de Expresiones ({capturedCount} Activas)
              </span>
              <span className="text-[10px] font-mono text-sky-400">ACTOR PRO HUD</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {['molesto', 'dudoso', 'triste', 'sonriente'].map((key) => {
                const emotionKey = key as EmotionKey;
                const img = participant.expressions[emotionKey] || participant.photoDataUrl;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedEmotionTab(emotionKey)}
                    className="rounded-2xl bg-slate-950 border border-slate-800 p-2.5 space-y-1.5 cursor-pointer hover:border-slate-700 transition-colors"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                      {img ? (
                        <img src={img} alt={key} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-[10px] font-mono">
                          <User className="w-6 h-6 mb-1" />
                          <span>Sin captura</span>
                        </div>
                      )}
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono capitalize text-slate-300">
                        {key}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate text-center">
                      {key === 'molesto' && 'Alerta / Tensión'}
                      {key === 'dudoso' && 'Cálculo táctico'}
                      {key === 'triste' && 'Momento dramático'}
                      {key === 'sonriente' && 'Resolución heroica'}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              * Si no capturas todas las expresiones, el motor adaptará automáticamente la iluminación sobre tu foto principal para cada momento de la escena.
            </p>
          </div>

          {/* Rostro en Movimiento Preview Card */}
          {participant.motionVideoUrl && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Rostro en Movimiento Calibrado</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Multi-Ángulo 3D
                </span>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 relative">
                <video
                  src={participant.motionVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Secuencia dinámica en memoria
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => startCamera('motion')}
                  className="text-sky-400 hover:text-sky-300 font-mono text-[11px] cursor-pointer"
                >
                  Repetir escaneo
                </button>
                <button
                  onClick={deleteMotionVideo}
                  className="text-rose-400 hover:text-rose-300 font-mono text-[11px] cursor-pointer"
                >
                  Eliminar clip
                </button>
              </div>
            </div>
          )}

          {/* Cuerpo Completo Preview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Calibración de Cuerpo Entero</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                {participant.fullBodyDataUrl ? 'Calibrado' : 'Opcional'}
              </span>
            </div>

            {participant.fullBodyDataUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[3/4] max-h-56 mx-auto rounded-xl overflow-hidden bg-black border border-amber-500/50 shadow-md">
                  <img
                    src={participant.fullBodyDataUrl}
                    alt="Cuerpo Completo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Silueta lista
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => startCamera('fullbody')}
                    className="text-sky-400 hover:text-sky-300 font-mono text-[11px] cursor-pointer"
                  >
                    Repetir captura
                  </button>
                  <button
                    onClick={deleteFullBody}
                    className="text-rose-400 hover:text-rose-300 font-mono text-[11px] cursor-pointer"
                  >
                    Eliminar cuerpo completo
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5 text-center">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Permite que el motor adapte el vestuario cinematográfico y proporciones anatómicas según tu silueta y postura real.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => startCamera('fullbody')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Activar cámara corporal</span>
                  </button>
                  <button
                    onClick={() => fullBodyFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Subir foto cuerpo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTORSELF TALENT Mini-Portfolio */}
          {showTalentDrawer && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white font-serif">ACTORSELF Talent</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Portafolio Privado
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nombre Artístico / Stage Name</label>
                  <input
                    type="text"
                    value={participant.talent.stageName}
                    onChange={(e) =>
                      onUpdateParticipant({
                        talent: { ...participant.talent, stageName: e.target.value },
                      })
                    }
                    placeholder="Ej. Mateo Rivera"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {participant.talent.videoSampleUrl && (
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-medium block">Muestra de Video (Silent Selfie 5–10s)</span>
                    <video
                      src={participant.talent.videoSampleUrl}
                      controls
                      className="w-full aspect-video rounded-xl bg-black border border-slate-800"
                    />
                  </div>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={participant.talent.actingInterest}
                    onChange={(e) =>
                      onUpdateParticipant({
                        talent: { ...participant.talent, actingInterest: e.target.checked },
                      })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    Tengo interés en participar en futuras oportunidades de audiciones o proyectos cinematográficos interactivos autorizados.
                  </span>
                </label>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-500 space-y-1">
                  <span className="font-bold text-slate-400 block">Aviso de Privacidad Talent:</span>
                  <p>
                    Este portafolio es estrictamente privado y local. No se publican candidaturas ni se envían datos a agencias externas. La conexión con productoras forma parte de la visión comercial futura de ACTORSELF.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar</span>
        </button>

        <button
          onClick={handleContinue}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Continuar a personalización</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
