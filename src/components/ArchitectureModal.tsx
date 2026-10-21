import React from 'react';
import { X, Tv, Shield, Users, Layers, Film, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif">
                ACTORSELF — Dossier de Arquitectura & Visión Comercial
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Prototipo Funcional Oficial para Hackatón de Amazon
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Concept */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-sky-400 font-mono uppercase tracking-wider block">
              1. Concepto Central e Identidad
            </span>
            <p>
              <strong>ACTORSELF NO es una plataforma de audiciones, casting, escuelas de actuación ni agencias de talentos.</strong> Es una experiencia de entretenimiento interactivo que permite a espectadores comunes convertirse virtualmente en personajes de historias cinematográficas bajo el lema: <em>"Ya no solamente miras la película. Ahora puedes formar parte de ella."</em>
            </p>
          </div>

          {/* Section 2: Prime Video Integration */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Film className="w-4 h-4 text-sky-400" />
              <span>2. Visión de Integración con Amazon Prime Video</span>
            </h4>
            <p className="text-slate-400">
              En una futura versión autorizada, ACTORSELF operará como una capa de personalización cinematográfica sobre películas y series elegibles:
            </p>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-300">
              <li>Sustitución facial selectiva y composición audiovisual sobre contenido con derechos autorizados.</li>
              <li>No pretende re-generar películas completas con IA, sino insertar al usuario en momentos clave y escenas complementarias.</li>
              <li>El prototipo actual es una prueba de concepto con contenido original para demostrar la viabilidad técnica.</li>
            </ul>
          </div>

          {/* Section 3: Business & Membership Model */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>3. Modelo de Acceso y Membresía Prime</span>
            </h4>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-300">
              <li>El usuario creador debe contar con una membresía Prime activa y acceso legítimo al título.</li>
              <li>Los participantes invitados deben cumplir condiciones de elegibilidad independientes.</li>
              <li>La experiencia completa personalizada solo está accesible para usuarios autorizados dentro del ecosistema; para usuarios externos se genera un tráiler promocional breve de 5 a 15 segundos.</li>
            </ul>
          </div>

          {/* Section 4: Privacy & Consent */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>4. Privacidad, Seguridad y Consentimiento Expreso</span>
            </h4>
            <p className="text-slate-400">
              El flujo de ACTORSELF exige consentimiento explícito antes de cualquier procesamiento visual. Las fotografías de rostro se procesan localmente en el dispositivo para la composición interactiva y no se transfieren a almacenes biométricos permanentes.
            </p>
          </div>

          {/* Section 5: Future Fire TV & Alexa Roadmap */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Tv className="w-4 h-4 text-indigo-400" />
              <span>5. Hoja de Ruta: Fire TV y Alexa</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-mono text-indigo-300 font-bold block">Fire TV / Vega OS</span>
                <p className="text-slate-400 text-[11px]">
                  Diseño de aplicación nativa para visualización en pantalla grande de la escena personalizada en salón familiar.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-mono text-sky-300 font-bold block">Integración con Alexa</span>
                <p className="text-slate-400 text-[11px]">
                  Comandos de voz: <em>"Alexa, abre ACTORSELF en el salón y reproduce mi escena de Kepler."</em>
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Technical Stack */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-sky-400 font-mono uppercase tracking-wider block">
              6. Especificaciones Técnicas del Prototipo
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-400">
              <div>· React 19 + TypeScript</div>
              <div>· HTML Canvas 60 FPS</div>
              <div>· MediaRecorder API</div>
              <div>· Web Audio Synthesizer</div>
              <div>· Tailwind CSS v4</div>
              <div>· Full HD 1080p (16:9)</div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Cerrar Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
