import React, { useState, useRef } from 'react';
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
  Eye
} from 'lucide-react';
import { ParticipantProfile } from '../types';

interface Screen4IdentityConsentProps {
  participant: ParticipantProfile;
  onUpdateParticipant: (updated: Partial<ParticipantProfile>) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const Screen4IdentityConsent: React.FC<Screen4IdentityConsentProps> = ({
  participant,
  onUpdateParticipant,
  onProceed,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      setValidationError('Por favor selecciona una imagen válida en formato JPG, PNG o WebP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationError('La imagen no debe superar los 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateParticipant({
        photoDataUrl: event.target?.result as string,
      });
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  // Live Camera Snapshot Flow
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 720, height: 720, facingMode: 'user' },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setValidationError(null);
    } catch (err: any) {
      console.warn('Error accediendo a cámara:', err);
      setValidationError('No se pudo acceder a la cámara web. Puedes subir una foto desde tus archivos.');
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, 600, 600);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    onUpdateParticipant({ photoDataUrl: dataUrl });
    setValidationError(null);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const removePhoto = () => {
    stopCamera();
    onUpdateParticipant({ photoDataUrl: '' });
  };

  // Validation check before proceeding
  const handleContinue = () => {
    if (!participant.name.trim()) {
      setValidationError('Por favor introduce tu nombre o el nombre que lucirá en la placa del Comandante.');
      return;
    }
    if (!participant.photoDataUrl) {
      setValidationError('Es necesario subir o capturar una fotografía de tu rostro para integrarte en la cabina.');
      return;
    }
    if (!participant.consentGiven) {
      setValidationError('Debes autorizar expresamente el uso de tu imagen para continuar con la demostración.');
      return;
    }

    setValidationError(null);
    onProceed();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Etapa 4 · Identidad Visual & Consentimiento</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Sube tu rostro y define tu identidad
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          Tu fotografía se compondrá dentro del visor y uniforme espacial del Comandante de la fragata Kepler-One.
        </p>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Name and Photo Input (7 cols) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Nombre del Participante (Aparece en la placa de cabina)
            </label>
            <input
              type="text"
              value={participant.name}
              onChange={(e) => onUpdateParticipant({ name: e.target.value })}
              placeholder="Ej. Mateo Rivera o Elena Vance"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-sky-500 focus:outline-hidden transition-colors"
            />
          </div>

          {/* Photo Upload Area */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Fotografía de Rostro (JPG, PNG o WebP)
            </label>

            {isCameraActive ? (
              /* Live Camera Capture Box */
              <div className="space-y-3">
                <div className="relative aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-sky-500 shadow-xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-dashed border-sky-400/80"></div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={captureSnapshot}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                  >
                    Capturar Rostro
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : participant.photoDataUrl ? (
              /* Selected Photo Preview */
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-sky-500/60 shadow-md">
                    <img
                      src={participant.photoDataUrl}
                      alt="Rostro seleccionado"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Fotografía cargada</span>
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" /> Lista para integración en cabina
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Cambiar fotografía"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={removePhoto}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer"
                    title="Eliminar fotografía"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Upload / Camera Choice */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border-2 border-dashed border-slate-800 hover:border-sky-500/50 flex flex-col items-center justify-center gap-2.5 text-center transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Subir desde dispositivo</span>
                    <span className="text-[10px] text-slate-500">JPG, PNG o WebP (hasta 10MB)</span>
                  </div>
                </button>

                <button
                  onClick={startCamera}
                  className="p-6 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2.5 text-center transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Tomar foto con cámara</span>
                    <span className="text-[10px] text-slate-500">Captura instantánea de rostro</span>
                  </div>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Mandatory Explicit Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={participant.consentGiven}
                onChange={(e) =>
                  onUpdateParticipant({
                    consentGiven: e.target.checked,
                    consentTimestamp: e.target.checked ? Date.now() : undefined,
                  })
                }
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950 cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-0.5">Autorización expresa y obligatoria:</strong>
                Autorizo expresamente el uso de mi fotografía única y exclusivamente para generar esta demostración interactiva de ACTORSELF. Entiendo que mi fotografía se procesa de forma segura en mi navegador y no se conserva permanentemente en servidores biométricos externos.
              </span>
            </label>
          </div>
        </div>

        {/* Right: Live Cockpit Hologram Mockup (5 cols) */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Vista Previa de Composición
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
            {/* Holographic Ring Target */}
            <div className="relative w-44 h-44 rounded-full border-2 border-sky-400/50 flex items-center justify-center overflow-hidden shadow-lg shadow-sky-950/50">
              {participant.photoDataUrl ? (
                <img
                  src={participant.photoDataUrl}
                  alt="Rostro"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-600 space-y-2">
                  <User className="w-12 h-12" />
                  <span className="text-[10px] font-mono">Esperando fotografía...</span>
                </div>
              )}
              {/* Cyan overlay */}
              <div className="absolute inset-0 bg-sky-500/10 pointer-events-none"></div>
            </div>

            {/* Plaque under face */}
            <div className="mt-4 px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-sky-300 font-bold">
              CMD. {(participant.name || 'TU NOMBRE').toUpperCase()}
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1">
              Fragata Estelar Kepler-One
            </span>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <span className="text-sky-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Compromiso de Privacidad y Derechos
            </span>
            <p>
              Cumplimiento riguroso de consentimiento informado. No se utilizan fotografías sin autorización ni se alimentan modelos de entrenamiento sin consentimiento explícito.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
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
