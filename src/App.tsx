import React, { useState } from 'react';
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

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedStory, setSelectedStory] = useState<StoryData>(STORIES[0]);
  const [selectedRole, setSelectedRole] = useState<CharacterRole>(STORIES[0].roles[0]);

  // Participant Profile State
  const [participant, setParticipant] = useState<ParticipantProfile>({
    name: 'Mateo Rivera',
    photoDataUrl: '',
    consentGiven: false,
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
          // Allow going to earlier steps or step 7 if video exists
          if (step <= currentStep || (step === 7 && generatedResult)) {
            setCurrentStep(step);
          }
        }}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Main 7-Screen User Flow */}
      <main className="flex-1">
        {currentStep === 1 && (
          <Screen1Welcome
            onStart={() => setCurrentStep(2)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
          />
        )}

        {currentStep === 2 && (
          <Screen2StorySelect
            stories={STORIES}
            selectedStory={selectedStory}
            onSelectStory={setSelectedStory}
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
      </main>

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
            Escena Oficial: ACTORSELF: Última luz de Kepler (1080p · 5.0s)
          </div>
        </div>
      </footer>
    </div>
  );
}
