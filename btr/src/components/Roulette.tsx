'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAnimate, motion } from 'framer-motion';
import { Participant } from '@/types';
import { floatingVariants } from '@/constants/animation';
import {
  BOTTLE_OPENER_PHYSICS,
  BOTTLE_OPENER_POSITIONING,
  ANIMATION_CONFIG,
  PARTICIPANT_LAYOUT,
  COMPONENT_SIZES,
  POWER_CALCULATION,
  ANGLE_CALCULATION,
  UI_MESSAGES,
  HINT_TIMING,
  VISUAL_THEME,
  DIMENSIONS,
  LAYOUT,
  TRANSPARENT_PALETTE_SYSTEM,
  LEGACY_COMPATIBILITY,
} from '@/constants/roulette';
import { usePaletteCSS } from '@/hooks/usePaletteCSS';

interface RouletteProps {
  participants: Participant[];
  onPayerSelected: (payer: Participant) => void;
  onCurrentPayerChange?: (payer: Participant | null) => void;
  onHintTextChange?: (hintText: string | null) => void;
  onGameStart?: () => void; // 新しいゲーム開始時のクリーンアップ
  currentPendingPayer?: Participant | null; // 外部から注入される仮確定者
  selectedPayer?: Participant | null; // 外部から注入される確定者
}

export function Roulette({ 
  participants, 
  onPayerSelected, 
  onCurrentPayerChange, 
  onHintTextChange,
  onGameStart,
  currentPendingPayer,
  selectedPayer: selectedPayerProp
}: RouletteProps) {
  const [, animate] = useAnimate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [calculationState, setCalculationState] = useState<'idle' | 'drum-roll' | 'calculating' | 'result' | 'error'>('idle');
  const hintIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const bottleOpenerRef = useRef<HTMLImageElement>(null);
  
  // Transparent Palette CSS management
  usePaletteCSS();

  // Generate conic-gradient background
  const segmentSize = ANGLE_CALCULATION.FULL_CIRCLE_DEG / participants.length;
  
  const gradientParts = participants.map((participant, index) => {
    const startAngle = index * segmentSize;
    const endAngle = (index + 1) * segmentSize;
    
    // Always use original participant color (no gold background effect)
    const color = participant.color;
      
    return `${color} ${startAngle}deg ${endAngle}deg`;
  });
  
  const conicBackground = `conic-gradient(${gradientParts.join(', ')})`;

  // Calculate participant positions on the wheel (equal segments)
  const getParticipantPosition = (index: number) => {
    // Each participant gets an equal segment
    const segmentAngle = ANGLE_CALCULATION.FULL_CIRCLE_DEG / participants.length;
    const centerAngle = index * segmentAngle + segmentAngle / 2;
    
    const angle = centerAngle * (Math.PI / 180);
    const radius = PARTICIPANT_LAYOUT.RADIUS_PX; // Distance from center
    
    const x = Math.cos(angle - Math.PI / 2) * radius;
    const y = Math.sin(angle - Math.PI / 2) * radius;
    
    return { x, y, angle: centerAngle };
  };

  // Handle SPIN button click (3-30 second random duration)
  const handleSpinButton = async () => {
    if (isSpinning || participants.length < 2) return;
    
    // Clear previous game state
    onGameStart?.();
    onCurrentPayerChange?.(null);
    
    setIsSpinning(true);

    // Generate random duration using constants
    const randomDuration = Math.random() * ANIMATION_CONFIG.SPIN_DURATION.RANGE_SECONDS + ANIMATION_CONFIG.SPIN_DURATION.MIN_SECONDS;
    
    // Calculate power based on duration using constants
    const power = (randomDuration / POWER_CALCULATION.DURATION_DIVISOR) * POWER_CALCULATION.BASE_MULTIPLIER + Math.random() * POWER_CALCULATION.RANDOM_VARIANCE;
    
    // Get current rotation
    const currentRotation = getCurrentRotation();
    const targetRotation = currentRotation + power;

    // Animate only the bottle opener using ref
    if (!bottleOpenerRef.current) {
      console.error('Bottle opener element not found');
      setIsSpinning(false);
      return;
    }

    const wheelAnimation = animate(
      bottleOpenerRef.current, // Use ref instead of CSS selector
      { rotate: targetRotation },
      { type: 'tween', ease: 'easeOut', duration: randomDuration }
    );

    // Start real-time payer tracking during animation
    let localAnimationFrameRef: number | undefined;
    const startRealtimeTracking = () => {
      const trackPayer = () => {
        if (isSpinning && calculationState === 'idle') {
          updateCurrentPayer();
          localAnimationFrameRef = requestAnimationFrame(trackPayer);
        }
      };
      trackPayer();
    };
    startRealtimeTracking();

    await wheelAnimation;
    
    // Stop real-time tracking
    if (localAnimationFrameRef !== undefined) {
      cancelAnimationFrame(localAnimationFrameRef);
    }
    
    // Clear pending payer immediately when spinning stops
    onCurrentPayerChange?.(null);
    setIsSpinning(false);
    
    // Perform dramatic calculation with parallel execution
    try {
      const payer = await performDramaticCalculation();
      onPayerSelected(payer);
      
      // Reset calculation state after a delay
      setTimeout(() => {
        setCalculationState('idle');
      }, ANIMATION_CONFIG.DRAMATIC_TIMING.RESULT_DISPLAY_MS);
      
    } catch (error) {
      console.error('Failed to determine payer:', error);
      setCalculationState('error');
      
      // Auto-dismiss error after specified time
      setTimeout(() => {
        setCalculationState('idle');
      }, ANIMATION_CONFIG.DRAMATIC_TIMING.ERROR_DISMISS_MS);
    }
  };


  // Get current rotation angle from transform matrix
  const getCurrentRotation = useCallback((): number => {
    if (!bottleOpenerRef.current) return 0;
    
    const computedStyle = getComputedStyle(bottleOpenerRef.current);
    const transform = computedStyle.transform || '';
    
    if (transform === 'none') return 0;
    
    const matrix = transform.match(/matrix.*\((.+)\)/);
    if (matrix) {
      const values = matrix[1].split(', ');
      const a = parseFloat(values[0]);
      const b = parseFloat(values[1]);
      const rawRotation = Math.atan2(b, a) * (180 / Math.PI);
      
      // Normalize to 0-360 range to prevent accumulation errors
      return ((rawRotation % ANGLE_CALCULATION.FULL_CIRCLE_DEG) + ANGLE_CALCULATION.FULL_CIRCLE_DEG) % ANGLE_CALCULATION.FULL_CIRCLE_DEG;
    }
    
    return 0;
  }, [bottleOpenerRef]);

  // Lightweight calculation for real-time updates during spinning (CPU-friendly)
  const calculateLightweightPayer = useCallback((): Participant | null => {
    if (participants.length === 0) return null;
    
    // Simple angle-based calculation without DOM measurements
    const currentRotationDegrees = getCurrentRotation();
    
    if (LEGACY_COMPATIBILITY.ENABLE_TRANSPARENT_PALETTE) {
      // Transparent Palette System: simplified calculation with center rotation
      const baseAngleDegrees = TRANSPARENT_PALETTE_SYSTEM.POINTER_ANGLE_DEG;
      const totalAngleDegrees = baseAngleDegrees + currentRotationDegrees;
      
      // Simplified angle normalization
      const angleFromCenter = (totalAngleDegrees + ANGLE_CALCULATION.NORMALIZATION_OFFSET + ANGLE_CALCULATION.REFERENCE_ADJUSTMENT) % ANGLE_CALCULATION.FULL_CIRCLE_DEG;
      
      const segmentSize = ANGLE_CALCULATION.FULL_CIRCLE_DEG / participants.length;
      const segmentIndex = Math.floor(angleFromCenter / segmentSize);
      const validIndex = segmentIndex % participants.length;
      
      return participants[validIndex];
    } else {
      // Legacy System: original calculation
      const baseAngleDegrees = -177.8; // Initial finger tip angle
      const totalAngleDegrees = baseAngleDegrees + currentRotationDegrees;
      
      // Simplified angle normalization using constants
      const angleFromCenter = (totalAngleDegrees + ANGLE_CALCULATION.NORMALIZATION_OFFSET + ANGLE_CALCULATION.REFERENCE_ADJUSTMENT) % ANGLE_CALCULATION.FULL_CIRCLE_DEG;
      
      const segmentSize = ANGLE_CALCULATION.FULL_CIRCLE_DEG / participants.length;
      const segmentIndex = Math.floor(angleFromCenter / segmentSize);
      const validIndex = segmentIndex % participants.length;
      
      return participants[validIndex];
    }
  }, [participants, getCurrentRotation]);


  // Pixel-perfect calculation for final payer determination (CPU-intensive but accurate)
  const calculatePixelPerfectPayer = useCallback(async (): Promise<Participant> => {
    // Validation checks
    if (!bottleOpenerRef.current) {
      throw new Error("Bottle opener element not found");
    }
    
    if (participants.length === 0) {
      throw new Error("No participants available");
    }

    if (LEGACY_COMPATIBILITY.ENABLE_TRANSPARENT_PALETTE) {
      // Transparent Palette System: Simplified calculation with center-based rotation
      // Get current rotation angle with high precision
      const currentRotationDegrees = getCurrentRotation();
      
      // With transparent palette, finger tip calculation is simplified
      const baseAngleDegrees = TRANSPARENT_PALETTE_SYSTEM.POINTER_ANGLE_DEG;
      const totalAngleDegrees = baseAngleDegrees + currentRotationDegrees;
      
      // Direct angle calculation without complex DOM positioning
      const angleFromCenter = (totalAngleDegrees + ANGLE_CALCULATION.NORMALIZATION_OFFSET + ANGLE_CALCULATION.REFERENCE_ADJUSTMENT) % ANGLE_CALCULATION.FULL_CIRCLE_DEG;

      // Determine which segment the pointer is indicating
      const segmentSize = ANGLE_CALCULATION.FULL_CIRCLE_DEG / participants.length;
      const segmentIndex = Math.floor(angleFromCenter / segmentSize);
      const validIndex = segmentIndex % participants.length;

      return participants[validIndex];
      
    } else {
      // Legacy System: Complex DOM-based calculation
      // Get DOM element position and size with multiple measurements for accuracy
      const rect = bottleOpenerRef.current.getBoundingClientRect();
      
      // Calculate rotation axis position using constants
      const rotationAxisX = rect.left + rect.width * BOTTLE_OPENER_PHYSICS.ROTATION_AXIS.X_PERCENT;
      const rotationAxisY = rect.top + rect.height * BOTTLE_OPENER_PHYSICS.ROTATION_AXIS.Y_PERCENT;

      // Get current rotation angle with high precision
      const currentRotationDegrees = getCurrentRotation();

      // Calculate finger tip position using constants
      // Original: fingertip(0,222) to rotationAxis(838,254) = distance 838.61px at angle -177.8°
      // Scaled for 144px display: distance = 838.61 * (144/544) = 221.9px
      const baseAngleDegrees = BOTTLE_OPENER_PHYSICS.BASE_ANGLE_DEGREES;
      const scaledDistance = BOTTLE_OPENER_PHYSICS.SCALED_DISTANCE_PX;
      
      const totalAngleDegrees = baseAngleDegrees + currentRotationDegrees;
      const totalAngleRadians = totalAngleDegrees * (Math.PI / 180);

      // Calculate finger tip absolute position
      const fingerX = rotationAxisX + Math.cos(totalAngleRadians) * scaledDistance;
      const fingerY = rotationAxisY + Math.sin(totalAngleRadians) * scaledDistance;

      // Calculate angle from roulette center to finger tip
      const rouletteCenterX = rect.left + rect.width / 2;
      const rouletteCenterY = rect.top + rect.height / 2;
      
      const deltaX = fingerX - rouletteCenterX;
      const deltaY = fingerY - rouletteCenterY;
      
      const angleFromCenter = (Math.atan2(deltaY, deltaX) * (180 / Math.PI) + ANGLE_CALCULATION.NORMALIZATION_OFFSET + ANGLE_CALCULATION.REFERENCE_ADJUSTMENT) % ANGLE_CALCULATION.FULL_CIRCLE_DEG;

      // Determine which segment the finger tip is pointing to
      const segmentSize = ANGLE_CALCULATION.FULL_CIRCLE_DEG / participants.length;
      const segmentIndex = Math.floor(angleFromCenter / segmentSize);
      const validIndex = segmentIndex % participants.length;

      return participants[validIndex];
    }
  }, [participants, getCurrentRotation]);

  // Real-time payer tracking during spinning
  const updateCurrentPayer = useCallback(() => {
    if (!isSpinning || calculationState !== 'idle') return;
    
    // During spinning: use lightweight calculation for real-time updates
    const newPayer = calculateLightweightPayer();
    
    if (newPayer && newPayer.id !== currentPendingPayer?.id) {
      onCurrentPayerChange?.(newPayer);
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Current payer updated (lightweight):`, newPayer.name);
      }
    }
  }, [isSpinning, calculationState, calculateLightweightPayer, onCurrentPayerChange, currentPendingPayer?.id]);

  // Dramatic presentation with drum roll effect
  const dramaticPresentation = useCallback(async (duration: number): Promise<void> => {
    // Start calculating immediately
    setCalculationState('calculating');
    await new Promise(resolve => setTimeout(resolve, duration));

    // Ready to reveal (will be set to 'result' after Promise.all completes)
  }, []);

  // Dramatic calculation with parallel execution (calculation + presentation)
  const performDramaticCalculation = useCallback(async (): Promise<Participant> => {
    try {
      // Start both calculation and presentation in parallel
      const [payerResult] = await Promise.all([
        calculatePixelPerfectPayer(), // High-precision calculation
        dramaticPresentation(ANIMATION_CONFIG.DRAMATIC_TIMING.TOTAL_DURATION_MS)    // Presentation duration
      ]);

      // Both completed - show result
      setCalculationState('result');
      return payerResult;

    } catch (error) {
      console.error('Calculation failed:', error);
      setCalculationState('error');
      
      // Auto-dismiss error after specified time
      setTimeout(() => {
        setCalculationState('idle');
      }, ANIMATION_CONFIG.DRAMATIC_TIMING.ERROR_DISMISS_MS);
      
      throw error;
    }
  }, [calculatePixelPerfectPayer, dramaticPresentation]);




  // Real-time tracking during spinning only
  useEffect(() => {
    if (isSpinning && calculationState === 'idle') {
      // Real-time updates during spinning
      const interval = setInterval(() => {
        updateCurrentPayer();
      }, ANIMATION_CONFIG.UPDATE_INTERVAL_MS); // 60fps for smooth real-time updates
      
      return () => clearInterval(interval);
    }
  }, [isSpinning, calculationState, updateCurrentPayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup handled in individual effects
    };
  }, []);

  // Hint text cycle (10s show + 20s hide = 30s cycle)
  useEffect(() => {
    if (isSpinning || participants.length < 2) {
      onHintTextChange?.(null);
      if (hintIntervalRef.current) {
        clearTimeout(hintIntervalRef.current);
      }
      return;
    }

    const hintCycle = () => {
      onHintTextChange?.(UI_MESSAGES.HINT_TEXT);
      
      // Hide after specified duration
      hintIntervalRef.current = setTimeout(() => {
        onHintTextChange?.(null);
      }, HINT_TIMING.DISPLAY_DURATION_MS);
    };

    // Start cycle immediately
    hintCycle();
    
    // Repeat every cycle duration
    const interval = setInterval(hintCycle, HINT_TIMING.CYCLE_DURATION_MS);

    return () => {
      clearInterval(interval);
      if (hintIntervalRef.current) {
        clearTimeout(hintIntervalRef.current);
      }
    };
  }, [isSpinning, participants.length, onHintTextChange]);


  if (participants.length < 2) {
    return (
      <div 
        className="flex items-center justify-center border-4 border-amber-800 rounded-full bg-amber-900/20"
        style={{
          width: DIMENSIONS.ROULETTE_SMALL.WIDTH,
          height: DIMENSIONS.ROULETTE_SMALL.HEIGHT,
        }}
      >
        <p className="text-amber-300 text-center px-6">
          {UI_MESSAGES.INSUFFICIENT_PARTICIPANTS}
        </p>
      </div>
    );
  }

  return (
    <div 
      className="relative overflow-visible"
      style={{
        width: DIMENSIONS.ROULETTE_SMALL.WIDTH,
        height: DIMENSIONS.ROULETTE_SMALL.HEIGHT,
      }}
    >
      {/* Roulette Wheel */}
      <div
        className="w-full h-full rounded-full border-4 border-amber-800 shadow-2xl transition-all relative overflow-hidden"
        style={{ background: conicBackground }}
      >

        {/* Participant Names */}
        {participants.map((participant, index) => {
          const position = getParticipantPosition(index);
          const isPendingPayer = currentPendingPayer?.id === participant.id;
          const isConfirmedPayer = selectedPayerProp?.id === participant.id;
          const isSpinningAndPending = isSpinning && isPendingPayer;
          const isConfirmedAndNotSpinning = !isSpinning && isConfirmedPayer;
          
          return (
            <motion.div
              key={participant.id}
              className="absolute text-white font-bold text-sm md:text-base flex items-center justify-center"
              style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
              }}
              variants={floatingVariants}
              animate={
                isSpinningAndPending ? 'spinning' 
                : isConfirmedAndNotSpinning ? 'confirmed' 
                : 'static'
              }
              initial="static"
            >
              <span className="mr-1">{participant.emoji}</span>
              <span>{participant.name}</span>
            </motion.div>
          );
        })}
      </div>
      


      {/* Transparent Palette Bottle Opener - Layer 3 (precise rotation) */}
      {LEGACY_COMPATIBILITY.ENABLE_TRANSPARENT_PALETTE ? (
        <div 
          className="bottle-opener-layer"
          style={{ zIndex: LAYOUT.Z_INDEX.POINTER }}
        >
          <div 
            ref={bottleOpenerRef}
            className="transparent-palette"
            style={{
              transform: `rotate(${BOTTLE_OPENER_POSITIONING.INITIAL_ROTATION_DEG}deg)`,
            }}
          >
            <img 
              src="./bottle_opener.png"
              alt="Bottle Opener Pointer"
              className="bottle-opener-image"
              style={{
                filter: `drop-shadow(0 6px 12px ${VISUAL_THEME.DROP_SHADOW})`,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      ) : (
        /* Legacy Bottle Opener - fallback */
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: 'none', zIndex: LAYOUT.Z_INDEX.POINTER }}
        >
          <img 
            ref={bottleOpenerRef}
            src="./bottle_opener.png"
            alt="Bottle Opener Pointer"
            className="object-contain"
            style={{
              width: COMPONENT_SIZES.BOTTLE_OPENER_PX,
              height: COMPONENT_SIZES.BOTTLE_OPENER_PX,
              filter: `drop-shadow(0 6px 12px ${VISUAL_THEME.DROP_SHADOW})`,
              transform: `translate(${BOTTLE_OPENER_POSITIONING.OFFSET_X_PX}px, ${BOTTLE_OPENER_POSITIONING.OFFSET_Y_PX}px) rotate(${BOTTLE_OPENER_POSITIONING.INITIAL_ROTATION_DEG}deg)`,
              transformOrigin: `${BOTTLE_OPENER_PHYSICS.ROTATION_AXIS.X_PERCENT * 100}% ${BOTTLE_OPENER_PHYSICS.ROTATION_AXIS.Y_PERCENT * 100}%`,
            }}
          />
        </div>
      )}

      {/* Transparent Button Layer - Layer 4 (interaction) */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: LAYOUT.Z_INDEX.INTERACTION }}
      >
        <button
          onClick={handleSpinButton}
          disabled={isSpinning || participants.length < 2}
          className="rounded-full bg-transparent hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer disabled:cursor-not-allowed touch-manipulation"
          style={{
            width: COMPONENT_SIZES.INTERACTION_AREA_PX,
            height: COMPONENT_SIZES.INTERACTION_AREA_PX,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          aria-label={UI_MESSAGES.SPIN_ROULETTE_ARIA}
        />
      </div>



      {/* Calculation State Overlay */}
      {calculationState !== 'idle' && (
        <div 
          className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-full"
          style={{ zIndex: LAYOUT.Z_INDEX.OVERLAY }}
        >
          {calculationState === 'calculating' && (
            <>
              <div className="text-4xl mb-4 animate-spin">⚙️</div>
              <div className="text-amber-200 text-lg">
                {UI_MESSAGES.CALCULATING}
              </div>
            </>
          )}
          
          {calculationState === 'result' && (
            <>
              <div className="text-6xl mb-4 animate-bounce">💸</div>
              <div className="text-amber-200 text-xl">
                {UI_MESSAGES.PAYER_DECIDED}
              </div>
            </>
          )}
          
          {calculationState === 'error' && (
            <>
              <div className="text-4xl mb-4">❌</div>
              <div className="text-red-400 text-lg">
                {UI_MESSAGES.CALCULATION_ERROR}
              </div>
              <div className="text-amber-300 text-sm mt-2">
                {UI_MESSAGES.AUTO_DISMISS}
              </div>
            </>
          )}
        </div>
      )}

      {isSpinning && (
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-amber-200 text-center">
          <p className="text-sm animate-pulse">{UI_MESSAGES.SPINNING}</p>
        </div>
      )}
    </div>
  );
}