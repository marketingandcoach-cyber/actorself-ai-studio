import React, { useState } from 'react';
import { FaceToVideoStudio } from './components/FaceToVideoStudio';
import { TestSceneCatalog } from './components/TestSceneCatalog';
import { Navbar } from './components/Navbar';
import { Screen1Welcome } from './components/Screen1Welcome';
import { Screen2StorySelect } from './components/Screen2StorySelect';
import { Screen3RoleSelect } from './components/Screen3RoleSelect';
import { Screen4IdentityConsent } from './components/Screen4IdentityConsent';
import { Screen5Customization } from './components/Screen5Customization';
import { Screen6SceneGenerator } from './components/Screen6SceneGenerator';
import { Screen7CinematicPlayer } from './components/Screen7CinematicPlayer';
import { ArchitectureModal } from './components/ArchitectureModal';
import { STORIES } from './data/stories';
import { ParticipantProfile, CustomizationConfig, GeneratedSceneResult, StoryData, CharacterRole } from './types';
import defaultMateoPortrait from './assets/images/protagonist_male_face_1792681375296.jpg';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [faceStudioOpen, setFaceStudioOpen] = useState(false);
  const [showTestCatalog, setShowTestCatalog] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryData>(STORIES[0]);
  const [selectedRole, setSelectedRole] = useState<CharacterRole>(STORIES[0].roles[0]);

  // Participant Profile State - Preloaded with high-fidelity protagonist portrait
  const [participant, setParticipant] = useState<ParticipantProfile>({
    name: 'Mateo Rivera',
    photoDataUrl: defaultMateoPortrait,
    consentGiven: false,
    consentTimestamp: undefined,
    actorProMode: true,
    studioMode: false,
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
    talent: {
      stageName: 'Mateo Rivera',
      actingInterest: false,
      notes: '',
      talentConsentGiven: false,
    },
  });

  // Customization Configuration
  const [config, setConfig] = useState<CustomizationConfig>({
    style: 'classic',
    alternateEnding: 'heroic',
    shipName: 'Kepler-One',
    lightingTone: 'cyan_deep',
  });

  // Generated Video Result
  const [generatedResult, setGeneratedResult] = useState<GeneratedSceneResult | null>(null);

  // Architecture Modal
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);

  const handleUpdateParticipant = (partial: Partial<ParticipantProfile>) => {
    setParticipant(prev => ({ ...prev, ...partial }));
  };

  const handleUpdateConfig = (partial: Partial<CustomizationConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  };

  const handleSceneGenerated = (result: GeneratedSceneResult) => {
    setGeneratedResult(result);
    setCurrentStep(7);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Top Header / Navigation */}
      <Navbar
        currentStep={currentStep}
        onNavigateStep={(step) => {
          // Steps 1 to 4 can always be accessed directly
          if (step <= 4) {
            setCurrentStep(step);
          } else if (step === 5) {
            // Step 5 requires photo and consent
            const hasPhoto = Boolean(participant.photoDataUrl || Object.keys(participant.expressions).length > 0);
            if (hasPhoto && participant.consentGiven) {
              setCurrentStep(5);
            } else {
              setCurrentStep(4);
            }
          } else if (step === 6) {
            setCurrentStep(6);
          } else if (step === 7 && generatedResult) {
            setCurrentStep(7);
          } else if (step <= currentStep) {
            setCurrentStep(step);
          }
        }}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <button type="button" onClick={() => setFaceStudioOpen(value => !value)} className="w-full rounded-xl border border-sky-500 bg-sky-950 px-5 py-4 font-bold text-sky-200 hover:bg-sky-900">
          {faceStudioOpen ? 'Cerrar estudio Face-to-Video' : '🎬 NUEVO: Transferir mi rostro a un video con IA gratuita'}
        </button>
      </div>
      {faceStudioOpen && <div className="mt-5"><FaceToVideoStudio /></div>}
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-3">
        <button type="button" onClick={() => { setShowTestCatalog(v => !v); window.scrollTo({top:0,behavior:'smooth'}); }} className="rounded-xl border border-sky-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-950">
          {showTestCatalog ? '← Volver a ACTORSELF' : '🎞️ Explorar catálogo de escenas de prueba (11 videos)'}
        </button>
      </div>
      {showTestCatalog ? <TestSceneCatalog /> : <main className="flex-1">
        {currentStep === 1 && (
          <Screen1Welcome
            onStart={() => setCurrentStep(2)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
            onSelectStoryAndStart={(story) => {
              setSelectedStory(story);
              if (story.roles && story.roles.length > 0) {
                setSelectedRole(story.roles[0]);
              }
              if (story.scenes && story.scenes.length > 0) {
                setConfig(prev => ({ ...prev, selectedSceneId: story.scenes![0].id }));
              }
              setCurrentStep(3);
            }}
          />
        )}

        {currentStep === 2 && (
          <Screen2StorySelect
            stories={STORIES}
            selectedStory={selectedStory}
            onSelectStory={(story) => {
              setSelectedStory(story);
              if (story.roles && story.roles.length > 0) {
                setSelectedRole(story.roles[0]);
              }
              if (story.scenes && story.scenes.length > 0) {
                setConfig(prev => ({ ...prev, selectedSceneId: story.scenes![0].id }));
              }
            }}
            onProceed={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Screen3RoleSelect
            story={selectedStory}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            onProceed={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Screen4IdentityConsent
            participant={participant}
            onUpdateParticipant={handleUpdateParticipant}
            onProceed={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Screen5Customization
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onProceed={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
            participantName={participant.name}
          />
        )}

        {currentStep === 6 && (
          <Screen6SceneGenerator
            participant={participant}
            config={config}
            onSceneGenerated={handleSceneGenerated}
            onBack={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 7 && generatedResult && (
          <Screen7CinematicPlayer
            result={generatedResult}
            story={selectedStory}
            onGenerateAnother={() => setCurrentStep(5)}
            onReturnToCatalog={() => setCurrentStep(2)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
          />
        )}
      </main>}

      {/* Dossier Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">ACTORSELF</span>
            <span>· Enter the Story</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Prototipo Funcional para Hackatón de Amazon</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            ACTORSELF · Enter the Story
          </div>
        </div>
      </footer>
    </div>
  );
}
