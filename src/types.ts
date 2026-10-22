export type EmotionKey =
  | 'sonriente'
  | 'molesto'
  | 'dudoso'
  | 'triste'
  | 'sorprendido'
  | 'asustado'
  | 'decidido'
  | 'pensativo';

export interface EmotionGuide {
  key: EmotionKey;
  label: string;
  category: 'core' | 'studio';
  instruction: string;
  narrativeUse: string;
}

export interface TalentProfile {
  stageName: string;
  actingInterest: boolean;
  notes: string;
  talentConsentGiven: boolean;
  videoSampleUrl?: string;
  videoSampleDurationSec?: number;
}

export interface ParticipantProfile {
  name: string;
  photoDataUrl: string;
  consentGiven: boolean;
  consentTimestamp?: number;
  actorProMode: boolean;
  studioMode: boolean;
  expressions: Partial<Record<EmotionKey, string>>;
  talent: TalentProfile;
  fullBodyDataUrl?: string;
  motionVideoUrl?: string;
  captureMode?: 'standard' | 'motion' | 'fullbody';
}

export type CommanderStyle = 'classic' | 'futuristic';
export type AlternateClimax = 'heroic' | 'mystery';
export type ProcessingEngineMode = 'neural_browser' | 'cloud_gpu_preview';

export interface FaceTrackingKeyframe {
  timestamp: number;
  faceBox: { x: number; y: number; width: number; height: number };
  headPose: { yaw: number; pitch: number; roll: number };
  lighting: {
    ambientColor: string;
    keyAngle: number;
    intensity: number;
    alertPulse?: number;
    shadowContrast: number;
  };
  expression: EmotionKey | 'neutral';
  occlusionType: 'visor' | 'shadow' | 'collar' | 'rain' | 'none';
}

export interface CinematicCameraShot {
  shotNumber: number;
  name: string;
  description: string;
  durationSec: number;
  framing: 'medium' | 'close_up' | 'dutch_angle' | 'hero_climax';
}

export interface CinematicSceneDefinition {
  id: string;
  storyId: string;
  title: string;
  description: string;
  characterRoleId: string;
  originalActorName: string;
  durationSec: number;
  shots: CinematicCameraShot[];
  keyframes: FaceTrackingKeyframe[];
  ambientAudioProfile: 'space_hyperspace' | 'nordic_rain_foley' | 'cyberpunk_synth_rain';
}

export interface CustomizationConfig {
  style: CommanderStyle;
  alternateEnding: AlternateClimax;
  shipName: string;
  lightingTone: 'cyan_deep' | 'amber_hazard' | 'crimson_alert' | 'noir_tungsten' | 'cyber_neon';
  cinematicDurationSec?: number;
  selectedSceneId?: string;
  processingEngine?: ProcessingEngineMode;
}

export interface CharacterRole {
  id: string;
  name: string;
  rank: string;
  description: string;
  type: string;
  suitColor: string;
  avatarIcon: string;
}

export interface StoryData {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  durationLabel: string;
  synopsis: string;
  setting: string;
  coverImage: string;
  isAvailable: boolean;
  badge: string;
  roles: CharacterRole[];
  scenes?: CinematicSceneDefinition[];
}

export interface GeneratedSceneResult {
  id: string;
  videoBlobUrl: string;
  videoBlob: Blob;
  durationSec: number;
  timestamp: number;
  participantName: string;
  style: CommanderStyle;
  ending: AlternateClimax;
  resolution: string;
  fileSizeBytes: number;
  usedExpressionsCount?: number;
  sceneTitle?: string;
  replacedActorName?: string;
}
