/**
 * Roulette Game Constants - Phase 1: Physics and Math Constants
 * 
 * This file contains all physics, mathematical, and positioning constants
 * used in the roulette wheel calculations to eliminate magic numbers.
 */

// Bottle Opener Physics Constants
export const BOTTLE_OPENER_PHYSICS = {
  // Base rotation angle from image measurement (finger tip initial position)
  BASE_ANGLE_DEGREES: -177.8,
  
  // Distance measurements for finger tip calculation
  SCALED_DISTANCE_PX: 221.9,        // Scaled distance for 144px display
  ORIGINAL_DISTANCE_PX: 838.61,     // Original distance from image measurement
  DISPLAY_SIZE_PX: 144,             // Current display size
  ORIGINAL_SIZE_PX: 544,            // Original image size
  
  // Rotation axis position (dimple center coordinates as percentages)
  ROTATION_AXIS: {
    X_PERCENT: 0.5524,              // 55.24% from left
    Y_PERCENT: 0.4669,              // 46.69% from top
  },
} as const;

// Bottle Opener Positioning Constants
export const BOTTLE_OPENER_POSITIONING = {
  // CSS transform offsets to align rotation axis with roulette center
  OFFSET_X_PX: -7.5,                // Horizontal offset
  OFFSET_Y_PX: 4.8,                 // Vertical offset
  
  // Initial rotation to point upward
  INITIAL_ROTATION_DEG: -90,        // Initial rotation angle
} as const;

// Animation and Timing Constants
export const ANIMATION_CONFIG = {
  // Spin duration range for random selection
  SPIN_DURATION: {
    MIN_SECONDS: 3,                 // Minimum spin duration
    MAX_SECONDS: 30,                // Maximum spin duration
    RANGE_SECONDS: 27,              // Duration range (MAX - MIN)
  },
  
  // Real-time update frequency
  UPDATE_INTERVAL_MS: 16,           // ~60fps for smooth updates
  TARGET_FPS: 60,                   // Target frame rate
  
  // Dramatic presentation timing
  DRAMATIC_TIMING: {
    TOTAL_DURATION_MS: 1000,        // Total dramatic presentation duration
    RESULT_DISPLAY_MS: 2000,        // How long to show result state
    ERROR_DISMISS_MS: 1000,         // Auto-dismiss error after this time
  },
} as const;

// Participant Layout Constants
export const PARTICIPANT_LAYOUT = {
  // Distance from roulette center for participant name positioning
  RADIUS_PX: 120,                   // Radius for participant positions
  
  // Angle adjustments
  CENTER_OFFSET_DEG: 90,            // Adjustment for 12 o'clock reference (Math.PI/2)
} as const;

// Component Size Constants
export const COMPONENT_SIZES = {
  // Bottle opener and interaction area
  BOTTLE_OPENER_PX: 144,            // w-36 = 144px (bottle opener size)
  INTERACTION_AREA_PX: 144,         // Same as bottle opener for consistent touch target
  

} as const;

// Power Calculation Constants
export const POWER_CALCULATION = {
  // Formula: (randomDuration / 4) * 2000 + Math.random() * 1000
  DURATION_DIVISOR: 4,              // Duration scaling factor
  BASE_MULTIPLIER: 2000,            // Base power multiplier
  RANDOM_VARIANCE: 1000,            // Random power variance
} as const;

// Angle Normalization Constants
export const ANGLE_CALCULATION = {
  // Full circle degrees
  FULL_CIRCLE_DEG: 360,
  
  // Angle adjustments for proper calculation
  NORMALIZATION_OFFSET: 360,       // For ensuring positive angles
  REFERENCE_ADJUSTMENT: 90,        // 12 o'clock adjustment
} as const;

// UI Messages - Phase 2: User Interface Text Constants
export const UI_MESSAGES = {
  // Roulette component messages
  INSUFFICIENT_PARTICIPANTS: "ルーレットを回すには\n参加者を2人以上追加してください",
  SPINNING: "回転中...",
  HINT_TEXT: "Tap the center to spin the roulette!",
  
  // Calculation state messages
  CALCULATING: "審議中...",
  PAYER_DECIDED: "支払い担当決定！",
  CALCULATION_ERROR: "計算エラー",
  AUTO_DISMISS: "自動的に消えます...",
  
  // NameForm component messages
  NAME_INPUT_PLACEHOLDER: "参加者の名前を入力",
  NAME_REQUIRED_ERROR: "名前を入力してください",
  MAX_PARTICIPANTS_ERROR: "参加者は最大{MAX}人までです",
  ADD_PARTICIPANTS_PROMPT: "参加者を追加してください",
  PARTICIPANTS_LABEL: "参加者",
  RESET_BUTTON: "リセット",
  
  // Game status messages
  NEED_MORE_PARTICIPANTS: "ゲームを開始するには、あと{COUNT}人の参加者が必要です",
  
  // Reset confirmation dialog
  RESET_CONFIRMATION_TITLE: "参加者をリセット",
  RESET_CONFIRMATION_MESSAGE: "本当に参加者リストをすべてクリアしますか？\nこの操作は取り消せません。",
  CANCEL_BUTTON: "キャンセル",
  CONFIRM_RESET_BUTTON: "リセット",
  
  // Button tooltips and aria labels
  ADD_PARTICIPANT_TOOLTIP: "参加者を追加 ({CURRENT}/{MAX})",
  REMOVE_PARTICIPANT_TOOLTIP: "参加者を退出させる",
  RESET_PARTICIPANTS_TOOLTIP: "参加者をリセット",
  SPIN_ROULETTE_ARIA: "ルーレットを回す",
  
  // Page header and footer
  PAGE_TITLE: "BarTab Roulette",
  PAGE_SUBTITLE: "🍻 次の一杯は誰がおごる？ 🍻",
  PAGE_FOOTER: "飲み過ぎにはご注意ください 🍻",
  
  // ResultModal messages
  MODAL_MESSAGE: "支払い担当に決定！",
} as const;

// Hint Display Timing - Phase 2: Hint Text Cycle Constants
export const HINT_TIMING = {
  // Hint display cycle (10s show + 20s hide = 30s total cycle)
  DISPLAY_DURATION_MS: 10000,      // Show hint for 10 seconds
  CYCLE_DURATION_MS: 30000,        // Full cycle duration (30 seconds)
  HIDE_DURATION_MS: 20000,         // Hide duration (calculated: 30s - 10s)
} as const;

// Form Validation Constants - Phase 2: Input Constraints
export const INPUT_CONSTRAINTS = {
  // Name input limits
  MAX_NAME_LENGTH: 20,             // Maximum characters for participant name
  
  // Participant limits (imported from types, but centralized here for consistency)
  MIN_PARTICIPANTS: 2,             // Minimum participants to start game
  MAX_PARTICIPANTS: 10,            // Maximum participants allowed
} as const;

// Visual Theme Constants - Phase 3: Styling and Color Constants
export const VISUAL_THEME = {
  // Selected payer highlighting colors
  SELECTED_PAYER_COLOR: '#F7DC6F',          // Light gold for selected payer
  SELECTED_PAYER_SHADOW: 'rgba(247, 220, 111, 0.8)', // Gold shadow for selected payer
  
  // UI state colors
  ERROR_COLOR: '#EF4444',                   // Red for error states
  SUCCESS_COLOR: '#10B981',                 // Green for success states
  WARNING_COLOR: '#F59E0B',                 // Amber for warning states
  
  // Background colors and opacity levels
  MODAL_OVERLAY: 'rgba(0, 0, 0, 0.7)',      // Modal background overlay
  HOVER_OVERLAY: 'rgba(255, 255, 255, 0.1)', // Hover state overlay
  ACTIVE_OVERLAY: 'rgba(255, 255, 255, 0.2)', // Active state overlay
  
  // Border and shadow colors
  WHITE_BORDER: '#FFFFFF',                  // White border for highlighting
  DROP_SHADOW: 'rgba(0, 0, 0, 0.4)',        // Standard drop shadow
  GOLD_GLOW: 'rgba(255, 215, 0, 0.6)',      // Gold glow effect
} as const;

// Component Dimensions - Phase 3: Size and Layout Constants  
export const DIMENSIONS = {
  // Roulette wheel sizes
  ROULETTE_SMALL: {
    WIDTH: '20rem',   // w-80 = 320px
    HEIGHT: '20rem',  // h-80 = 320px
  },
  ROULETTE_LARGE: {
    WIDTH: '24rem',   // w-96 = 384px (md:w-96)
    HEIGHT: '24rem',  // h-96 = 384px (md:h-96)
  },
  
  // Border and spacing
  BORDER_WIDTH: '4px',                      // Standard border width
  BORDER_RADIUS_FULL: '9999px',             // Full circle border radius
  BORDER_RADIUS_LARGE: '1rem',              // Large border radius (16px)
  BORDER_RADIUS_EXTRA_LARGE: '1.5rem',      // XL border radius (24px)
  
  // Padding and margins
  PADDING_SMALL: '0.5rem',                  // 8px
  PADDING_MEDIUM: '1rem',                   // 16px
  PADDING_LARGE: '1.5rem',                  // 24px
  PADDING_EXTRA_LARGE: '2rem',              // 32px
} as const;

// Animation Constants - Phase 3: Animation and Transition Settings
export const ANIMATION_CONSTANTS = {
  // Transition durations
  TRANSITION_FAST: '0.15s',                 // Fast transitions
  TRANSITION_NORMAL: '0.3s',                // Normal transitions
  TRANSITION_SLOW: '0.5s',                  // Slow transitions
  
  // Animation timings
  BOUNCE_DURATION: '2s',                    // Bounce animation duration
  PULSE_DURATION: '1.5s',                   // Pulse animation duration
  SPIN_DURATION: '8s',                      // Continuous spin duration
  
  // Easing functions
  EASE_IN_OUT: 'ease-in-out',               // Standard easing
  EASE_OUT: 'ease-out',                     // Ease out
  LINEAR: 'linear',                         // Linear timing
} as const;

// Layout Constants - Phase 3: Grid and Flexbox Settings
export const LAYOUT = {
  // Flexbox settings
  FLEX_CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex items-center justify-between',
  FLEX_COL_CENTER: 'flex flex-col items-center justify-center',
  
  // Grid and spacing
  SPACE_SMALL: '0.25rem',                   // 4px
  SPACE_MEDIUM: '0.5rem',                   // 8px
  SPACE_LARGE: '1rem',                      // 16px
  SPACE_EXTRA_LARGE: '1.5rem',              // 24px
  
  // Z-index layers
  Z_INDEX: {
    BASE: 0,                                // Base layer
    POINTER: 20,                           // Bottle opener pointer layer
    INTERACTION: 30,                       // Interactive button layer
    OVERLAY: 40,                           // Calculation state overlay
    MODAL: 50,                             // Modal dialogs
  },
} as const;