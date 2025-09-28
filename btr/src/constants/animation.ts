/**
 * 確定者浮遊アニメーション設定
 * 
 * 2段階の浮遊エフェクト:
 * 1. 回転中: ダイナミック浮遊 (わかりやすい強調)
 * 2. 確定後: 3D浮遊 (派手な演出)
 */

export const FLOATING_EFFECTS = {
  // 回転中の仮確定者用: ダイナミック浮遊
  SPINNING: {
    // アニメーションの基本設定
    DURATION: 1.2,
    EASE: 'easeInOut' as const,
    REPEAT: Infinity,
    REPEAT_TYPE: 'reverse' as const,
    
    // 移動範囲 (Y軸の上下動)
    Y_RANGE: {
      MIN: -4,   // 基本位置からの最小移動 (px)
      MAX: -12,  // 基本位置からの最大移動 (px)
    },
    
    // テキストシャドウ設定
    TEXT_SHADOW: {
      BASE: '0 4px 8px rgba(255,255,255,0.8), 0 12px 24px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.2)',
      PEAK: '0 6px 12px rgba(255,255,255,0.9), 0 20px 40px rgba(0,0,0,0.5), 0 40px 80px rgba(0,0,0,0.3)',
    },
  },

  // 確定後用: 3D浮遊
  CONFIRMED: {
    // アニメーションの基本設定
    DURATION: 2.5,
    EASE: 'easeInOut' as const,
    REPEAT: Infinity,
    REPEAT_TYPE: 'loop' as const,
    
    // 移動範囲
    Y_RANGE: {
      MIN: -6,   // 基本位置からの最小移動 (px)
      MAX: -10,  // 基本位置からの最大移動 (px)
    },
    
    // 3D回転設定
    ROTATION: {
      PERSPECTIVE: 1000,
      X_RANGE: { MIN: 8, MAX: 12 },    // X軸回転角度
      Y_RANGE: { MIN: -2, MAX: 2 },    // Y軸回転角度
    },
    
    // 3Dテキストシャドウ (立体感)
    TEXT_SHADOW: {
      BASE: '1px 1px 0 rgba(0,0,0,0.2), 2px 2px 0 rgba(0,0,0,0.15), 3px 3px 0 rgba(0,0,0,0.1), 4px 4px 0 rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.3), 0 16px 32px rgba(0,0,0,0.2)',
    },
  },
} as const;

/**
 * CSS Keyframes生成ヘルパー
 */
export const generateDynamicFloatCSS = () => `
  @keyframes dynamic-float {
    0%, 100% { 
      transform: translateY(${FLOATING_EFFECTS.SPINNING.Y_RANGE.MIN}px);
      text-shadow: ${FLOATING_EFFECTS.SPINNING.TEXT_SHADOW.BASE};
    }
    50% { 
      transform: translateY(${FLOATING_EFFECTS.SPINNING.Y_RANGE.MAX}px);
      text-shadow: ${FLOATING_EFFECTS.SPINNING.TEXT_SHADOW.PEAK};
    }
  }
`;

export const generateConfirmed3DFloatCSS = () => `
  @keyframes confirmed-3d-float {
    0%, 100% { 
      transform: perspective(${FLOATING_EFFECTS.CONFIRMED.ROTATION.PERSPECTIVE}px) 
                 rotateX(${FLOATING_EFFECTS.CONFIRMED.ROTATION.X_RANGE.MIN}deg) 
                 translateY(${FLOATING_EFFECTS.CONFIRMED.Y_RANGE.MIN}px);
    }
    25% { 
      transform: perspective(${FLOATING_EFFECTS.CONFIRMED.ROTATION.PERSPECTIVE}px) 
                 rotateX(${FLOATING_EFFECTS.CONFIRMED.ROTATION.X_RANGE.MAX}deg) 
                 rotateY(${FLOATING_EFFECTS.CONFIRMED.ROTATION.Y_RANGE.MAX}deg) 
                 translateY(${FLOATING_EFFECTS.CONFIRMED.Y_RANGE.MAX}px);
    }
    50% { 
      transform: perspective(${FLOATING_EFFECTS.CONFIRMED.ROTATION.PERSPECTIVE}px) 
                 rotateX(${FLOATING_EFFECTS.CONFIRMED.ROTATION.X_RANGE.MIN}deg) 
                 translateY(${FLOATING_EFFECTS.CONFIRMED.Y_RANGE.MIN + 2}px);
    }
    75% { 
      transform: perspective(${FLOATING_EFFECTS.CONFIRMED.ROTATION.PERSPECTIVE}px) 
                 rotateX(${FLOATING_EFFECTS.CONFIRMED.ROTATION.X_RANGE.MAX}deg) 
                 rotateY(${FLOATING_EFFECTS.CONFIRMED.ROTATION.Y_RANGE.MIN}deg) 
                 translateY(${FLOATING_EFFECTS.CONFIRMED.Y_RANGE.MAX}px);
    }
  }
`;

/**
 * Framer Motion用のバリアント設定
 */
export const floatingVariants = {
  spinning: {
    y: [FLOATING_EFFECTS.SPINNING.Y_RANGE.MIN, FLOATING_EFFECTS.SPINNING.Y_RANGE.MAX],
    textShadow: [
      FLOATING_EFFECTS.SPINNING.TEXT_SHADOW.BASE,
      FLOATING_EFFECTS.SPINNING.TEXT_SHADOW.PEAK,
    ],
    transition: {
      duration: FLOATING_EFFECTS.SPINNING.DURATION,
      repeat: FLOATING_EFFECTS.SPINNING.REPEAT,
      repeatType: FLOATING_EFFECTS.SPINNING.REPEAT_TYPE,
      ease: FLOATING_EFFECTS.SPINNING.EASE,
    },
  },
  confirmed: {
    y: [FLOATING_EFFECTS.CONFIRMED.Y_RANGE.MIN, FLOATING_EFFECTS.CONFIRMED.Y_RANGE.MAX, FLOATING_EFFECTS.CONFIRMED.Y_RANGE.MIN + 2, FLOATING_EFFECTS.CONFIRMED.Y_RANGE.MAX],
    rotateX: [FLOATING_EFFECTS.CONFIRMED.ROTATION.X_RANGE.MIN, FLOATING_EFFECTS.CONFIRMED.ROTATION.X_RANGE.MAX, FLOATING_EFFECTS.CONFIRMED.ROTATION.X_RANGE.MIN, FLOATING_EFFECTS.CONFIRMED.ROTATION.X_RANGE.MAX],
    rotateY: [0, FLOATING_EFFECTS.CONFIRMED.ROTATION.Y_RANGE.MAX, 0, FLOATING_EFFECTS.CONFIRMED.ROTATION.Y_RANGE.MIN],
    textShadow: FLOATING_EFFECTS.CONFIRMED.TEXT_SHADOW.BASE,
    transition: {
      duration: FLOATING_EFFECTS.CONFIRMED.DURATION,
      repeat: FLOATING_EFFECTS.CONFIRMED.REPEAT,
      repeatType: FLOATING_EFFECTS.CONFIRMED.REPEAT_TYPE,
      ease: FLOATING_EFFECTS.CONFIRMED.EASE,
    },
  },
  static: {
    y: 0,
    rotateX: 0,
    rotateY: 0,
    textShadow: 'none',
    transform: 'translate(-50%, -50%)',
    transition: { duration: 0.3 },
  },
};