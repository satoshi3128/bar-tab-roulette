export interface Participant {
  id: string;
  name: string;
  emoji: string;
  color: string;
  weight: number; // For future enhancement
}

export interface SpinResult {
  winner: Participant;
  finalRotation: number;
  duration: number;
}

export interface RouletteState {
  isSpinning: boolean;
  currentRotation: number;
  participants: Participant[];
  winner: Participant | null;
}

// Predefined emojis and colors for participants
export const PARTICIPANT_EMOJIS = ['🍺', '🍻', '🥃', '🍷', '🍸', '🍹', '🥂', '🍾', '🍵', '☕'];

export const PARTICIPANT_COLORS = [
  '#FF0000', // Bright Red
  '#87CEEB', // Sky Blue
  '#0000FF', // Bright Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#90EE90', // Light Green
  '#800080', // Purple
  '#FFA500', // Orange
  '#4682B4', // Steel Blue
  '#32CD32', // Lime Green
  '#FF1493', // Deep Pink
  '#8A2BE2', // Blue Violet
  '#FF8C00', // Dark Orange
  '#2E8B57', // Sea Green
  '#DC143C', // Crimson
  '#9932CC', // Dark Orchid
  '#40E0D0', // Turquoise
  '#FFB6C1', // Light Pink
  '#B22222', // Fire Brick
  '#20B2AA', // Light Sea Green
];

export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 10;

// Bottle Opener Pointer Configuration
export interface BottleOpenerConfig {
  enabled: boolean;
  scale: number; // Size multiplier (0.5 - 2.0)
  rotationSpeed: number; // Rotation speed multiplier (0.5 - 2.0)
  showTrail: boolean; // Show motion trail effect
  customImage?: string; // Custom image URL/path
}

export interface PointerPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// Feature Flag System
export interface FeatureFlags {
  bottleOpenerPointer: boolean;
  classicArrowPointer: boolean;
  customPointers: boolean;
}

export const DEFAULT_BOTTLE_OPENER_CONFIG: BottleOpenerConfig = {
  enabled: false,
  scale: 1.0,
  rotationSpeed: 1.0,
  showTrail: false,
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  bottleOpenerPointer: false,
  classicArrowPointer: true,
  customPointers: false,
};