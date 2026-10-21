export interface ParticipantProfile {
  name: string;
  photoDataUrl: string;
  consentGiven: boolean;
  consentTimestamp?: number;
}

export type CommanderStyle = 'classic' | 'futuristic';
export type AlternateClimax = 'heroic' | 'mystery';

export interface CustomizationConfig {
  style: CommanderStyle;
  alternateEnding: AlternateClimax;
  shipName: string;
  lightingTone: 'cyan_deep' | 'amber_hazard' | 'crimson_alert';
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
}
