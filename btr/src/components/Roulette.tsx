'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { Participant } from '@/types';

interface RouletteProps {
  participants: Participant[];
  onPayerSelected: (payer: Participant) => void;
  onCurrentPayerChange?: (payer: Participant | null) => void;
  onHintTextChange?: (hintText: string | null) => void;
}

export function Roulette({ 
  participants, 
  onPayerSelected, 
  onCurrentPayerChange, 
  onHintTextChange
}: RouletteProps) {
  const [scope, animate] = useAnimate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState<Participant | null>(null);
  const [calculationState, setCalculationState] = useState<'idle' | 'drum-roll' | 'calculating' | 'result' | 'error'>('idle');
  const hintIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const bottleOpenerRef = useRef<HTMLImageElement>(null);

  // Generate conic-gradient background
  const segmentSize = 360 / participants.length;
  
  const gradientParts = participants.map((participant, index) => {
    const startAngle = index * segmentSize;
    const endAngle = (index + 1) * segmentSize;
    
    // Use gold color for selected payer, original color for others
    const color = (selectedPayer?.id === participant.id) 
      ? '#F7DC6F' // Light gold for selected payer
      : participant.color;
      
    return `${color} ${startAngle}deg ${endAngle}deg`;
  });
  
  const conicBackground = `conic-gradient(${gradientParts.join(', ')})`;

  // Calculate participant positions on the wheel (equal segments)
  const getParticipantPosition = (index: number) => {
    // Each participant gets an equal segment
    const segmentAngle = 360 / participants.length;
    const centerAngle = index * segmentAngle + segmentAngle / 2;
    
    const angle = centerAngle * (Math.PI / 180);
    const radius = 120; // Distance from center
    
    const x = Math.cos(angle - Math.PI / 2) * radius;
    const y = Math.sin(angle - Math.PI / 2) * radius;
    
    return { x, y, angle: centerAngle };
  };

  // Handle SPIN button click (3-30 second random duration)
  const handleSpinButton = async () => {
    if (isSpinning || participants.length < 2) return;
    setIsSpinning(true);

    // Generate random duration between 3-30 seconds
    const randomDuration = Math.random() * 27 + 3; // 3-30 seconds
    
    // Calculate power based on duration (adjust to match existing rotation logic)
    const power = (randomDuration / 4) * 2000 + Math.random() * 1000;
    
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
    
    setIsSpinning(false);
    
    // Perform dramatic calculation with parallel execution
    try {
      const payer = await performDramaticCalculation();
      setSelectedPayer(payer);
      onPayerSelected(payer);
      
      // Reset calculation state after a delay
      setTimeout(() => {
        setCalculationState('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to determine payer:', error);
      setCalculationState('error');
      
      // Auto-dismiss error after 1 second
      setTimeout(() => {
        setCalculationState('idle');
      }, 1000);
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
      return ((rawRotation % 360) + 360) % 360;
    }
    
    return 0;
  }, [bottleOpenerRef]);

  // Lightweight calculation for real-time updates during spinning (CPU-friendly)
  const calculateLightweightPayer = useCallback((): Participant | null => {
    if (participants.length === 0) return null;
    
    // Simple angle-based calculation without DOM measurements
    const currentRotationDegrees = getCurrentRotation();
    const baseAngleDegrees = -177.8; // Initial finger tip angle
    const totalAngleDegrees = baseAngleDegrees + currentRotationDegrees;
    
    // Simplified angle normalization
    const angleFromCenter = (totalAngleDegrees + 360 + 90) % 360;
    
    const segmentSize = 360 / participants.length;
    const segmentIndex = Math.floor(angleFromCenter / segmentSize);
    const validIndex = segmentIndex % participants.length;
    
    return participants[validIndex];
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

    // Get DOM element position and size with multiple measurements for accuracy
    const rect = bottleOpenerRef.current.getBoundingClientRect();
    
    // Calculate rotation axis position (dimple center at 55.24%, 46.69%)
    const rotationAxisX = rect.left + rect.width * 0.5524;
    const rotationAxisY = rect.top + rect.height * 0.4669;

    // Get current rotation angle with high precision
    const currentRotationDegrees = getCurrentRotation();

    // Calculate finger tip position using actual measurements
    // Original: fingertip(0,222) to rotationAxis(838,254) = distance 838.61px at angle -177.8°
    // Scaled for 144px display: distance = 838.61 * (144/544) = 221.9px
    const baseAngleDegrees = -177.8; // Initial finger tip angle from image measurement
    const scaledDistance = 221.9; // Scaled distance for 144px display
    
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
    
    const angleFromCenter = (Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 360 + 90) % 360; // normalize and adjust for 12 o'clock

    // Determine which segment the finger tip is pointing to
    const segmentSize = 360 / participants.length;
    const segmentIndex = Math.floor(angleFromCenter / segmentSize);
    const validIndex = segmentIndex % participants.length;

    return participants[validIndex];
  }, [participants, getCurrentRotation]);

  // Real-time payer tracking during spinning
  const updateCurrentPayer = useCallback(() => {
    if (!isSpinning || calculationState !== 'idle') return;
    
    // During spinning: use lightweight calculation for real-time updates
    const newPayer = calculateLightweightPayer();
    
    if (newPayer && newPayer.id !== selectedPayer?.id) {
      setSelectedPayer(newPayer);
      onCurrentPayerChange?.(newPayer);
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Current payer updated (lightweight):`, newPayer.name);
      }
    }
  }, [isSpinning, calculationState, selectedPayer, calculateLightweightPayer, onCurrentPayerChange]);

  // Dramatic presentation with drum roll effect
  const dramaticPresentation = useCallback(async (duration: number): Promise<void> => {
    // Phase 1: Drum roll
    setCalculationState('drum-roll');
    await new Promise(resolve => setTimeout(resolve, duration * 0.8)); // 800ms

    // Phase 2: Calculating
    setCalculationState('calculating');
    await new Promise(resolve => setTimeout(resolve, duration * 0.2)); // 200ms

    // Ready to reveal (will be set to 'result' after Promise.all completes)
  }, []);

  // Dramatic calculation with parallel execution (calculation + presentation)
  const performDramaticCalculation = useCallback(async (): Promise<Participant> => {
    try {
      // Start both calculation and presentation in parallel
      const [payerResult] = await Promise.all([
        calculatePixelPerfectPayer(), // High-precision calculation
        dramaticPresentation(1000)    // 1 second presentation
      ]);

      // Both completed - show result
      setCalculationState('result');
      return payerResult;

    } catch (error) {
      console.error('Calculation failed:', error);
      setCalculationState('error');
      
      // Auto-dismiss error after 1 second
      setTimeout(() => {
        setCalculationState('idle');
      }, 1000);
      
      throw error;
    }
  }, [calculatePixelPerfectPayer, dramaticPresentation]);




  // Real-time tracking during spinning only
  useEffect(() => {
    if (isSpinning && calculationState === 'idle') {
      // Real-time updates during spinning
      const interval = setInterval(() => {
        updateCurrentPayer();
      }, 16); // ~60fps for smooth real-time updates
      
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
      onHintTextChange?.("Tap the center to spin the roulette!");
      
      // Hide after 10 seconds
      hintIntervalRef.current = setTimeout(() => {
        onHintTextChange?.(null);
      }, 10000);
    };

    // Start cycle immediately
    hintCycle();
    
    // Repeat every 30 seconds
    const interval = setInterval(hintCycle, 30000);

    return () => {
      clearInterval(interval);
      if (hintIntervalRef.current) {
        clearTimeout(hintIntervalRef.current);
      }
    };
  }, [isSpinning, participants.length, onHintTextChange]);


  if (participants.length < 2) {
    return (
      <div className="flex items-center justify-center w-80 h-80 md:w-96 md:h-96 border-4 border-amber-800 rounded-full bg-amber-900/20">
        <p className="text-amber-300 text-center px-6">
          ルーレットを回すには<br />
          参加者を2人以上追加してください
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96 overflow-visible">
      {/* Roulette Wheel */}
      <div
        className="w-full h-full rounded-full border-4 border-amber-800 shadow-2xl transition-all relative overflow-hidden"
        style={{ background: conicBackground }}
      >

        {/* Participant Names */}
        {participants.map((participant, index) => {
          const position = getParticipantPosition(index);
          const isSelectedToPay = selectedPayer?.id === participant.id;
          
          return (
            <div
              key={participant.id}
              className="absolute text-white font-bold text-sm md:text-base flex items-center justify-center"
              style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
                transform: 'translate(-50%, -50%)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: isSelectedToPay 
                  ? 'drop-shadow(2px 2px 8px rgba(247, 220, 111, 0.8))' // Gold glow for selected payer
                  : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.9))',
              }}
            >
              <span className="mr-1">{participant.emoji}</span>
              <span>{participant.name}</span>
            </div>
          );
        })}
      </div>
      
      {/* Center Hub - Layer 2 (decorative) */}
      <motion.div
        ref={scope}
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: 'none', zIndex: 10 }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 border-4 border-amber-800 shadow-lg flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-amber-900"></div>
        </div>
      </motion.div>

      {/* Bottle Opener Overlay - Layer 3 (transparent overlay) */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: 'none', zIndex: 20 }}
      >
        <img 
          ref={bottleOpenerRef}
          src="/bottle_opener.png"
          alt="Bottle Opener Pointer"
          className="w-36 h-36 object-contain"
          style={{
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
            transform: 'translate(-7.5px, 4.8px) rotate(-90deg)',
            transformOrigin: '55.24% 46.69%', // Precise rotation axis (dimple center)
          }}
        />
      </div>

      {/* Transparent Button Layer - Layer 4 (interaction) */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 30 }}
      >
        <button
          onClick={handleSpinButton}
          disabled={isSpinning || participants.length < 2}
          className="w-36 h-36 rounded-full bg-transparent hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer disabled:cursor-not-allowed touch-manipulation"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          aria-label="ルーレットを回す"
        />
      </div>



      {/* Calculation State Overlay */}
      {calculationState !== 'idle' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 rounded-full">
          {calculationState === 'drum-roll' && (
            <>
              <div className="text-6xl mb-4 animate-pulse">🥁</div>
              <div className="text-amber-200 text-xl animate-bounce">
                ドラムロール...
              </div>
              <div className="mt-4 flex space-x-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping delay-100" />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping delay-200" />
              </div>
            </>
          )}
          
          {calculationState === 'calculating' && (
            <>
              <div className="text-4xl mb-4 animate-spin">⚙️</div>
              <div className="text-amber-200 text-lg">
                精密判定中...
              </div>
            </>
          )}
          
          {calculationState === 'result' && (
            <>
              <div className="text-6xl mb-4 animate-bounce">💸</div>
              <div className="text-amber-200 text-xl">
                支払い担当決定！
              </div>
            </>
          )}
          
          {calculationState === 'error' && (
            <>
              <div className="text-4xl mb-4">❌</div>
              <div className="text-red-400 text-lg">
                計算エラー
              </div>
              <div className="text-amber-300 text-sm mt-2">
                自動的に消えます...
              </div>
            </>
          )}
        </div>
      )}

      {isSpinning && (
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-amber-200 text-center">
          <p className="text-sm animate-pulse">回転中...</p>
        </div>
      )}
    </div>
  );
}