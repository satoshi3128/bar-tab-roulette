/**
 * CSS Custom Properties 管理Hook
 * 
 * 透明パレットシステムのCSS変数を動的に制御し、
 * レスポンシブ対応と精密な値管理を提供
 */

import { useEffect, useCallback } from 'react';
import { 
  TRANSPARENT_PALETTE_SYSTEM, 
  CSS_VARIABLES, 
  LEGACY_COMPATIBILITY 
} from '../constants/roulette';

/**
 * デバイス種別の判定結果
 */
type DeviceType = 'mobile' | 'desktop';

/**
 * パレットCSS設定のInterface
 */
interface PaletteConfig {
  bottleOpenerWidth: number;
  paletteSize: number;
  paletteRadius: number;
  scaleRatio: number;
}

/**
 * 透明パレットシステム用CSS Custom Properties管理Hook
 * 
 * 機能:
 * - レスポンシブ対応でのCSS変数自動更新
 * - 精密な値計算とブラウザ最適化
 * - デバッグモードでの詳細ログ出力
 * - レガシーシステムとの互換性保持
 * 
 * @returns CSS変数制御用の関数とデバイス情報
 */
export const usePaletteCSS = () => {
  /**
   * 現在のデバイス種別を判定
   */
  const getDeviceType = useCallback((): DeviceType => {
    // Server-side rendering では mobile をデフォルトとする
    if (typeof window === 'undefined') return 'mobile';
    return window.innerWidth >= CSS_VARIABLES.MOBILE_BREAKPOINT ? 'desktop' : 'mobile';
  }, []);

  /**
   * デバイス別のパレット設定を取得
   */
  const getPaletteConfig = useCallback((deviceType: DeviceType): PaletteConfig => {
    const config = deviceType === 'mobile' 
      ? TRANSPARENT_PALETTE_SYSTEM.MOBILE 
      : TRANSPARENT_PALETTE_SYSTEM.DESKTOP;
    
    return {
      bottleOpenerWidth: config.BOTTLE_OPENER_WIDTH,
      paletteSize: config.PALETTE_SIZE,
      paletteRadius: config.PALETTE_RADIUS,
      scaleRatio: config.SCALE_RATIO,
    };
  }, []);

  /**
   * CSS Custom Properties を更新
   */
  const updateCSSVariables = useCallback((config: PaletteConfig) => {
    // Server-side rendering では何もしない
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    
    // 精密な値でCSS変数を設定
    root.style.setProperty(
      CSS_VARIABLES.BOTTLE_OPENER_WIDTH, 
      CSS_VARIABLES.formatCSSValue(config.bottleOpenerWidth)
    );
    
    root.style.setProperty(
      CSS_VARIABLES.PALETTE_SIZE, 
      CSS_VARIABLES.formatCSSValue(config.paletteSize)
    );
    
    root.style.setProperty(
      CSS_VARIABLES.PALETTE_RADIUS, 
      CSS_VARIABLES.formatCSSValue(config.paletteRadius)
    );
    
    root.style.setProperty(
      CSS_VARIABLES.SCALE_RATIO, 
      CSS_VARIABLES.formatCSSRatio(config.scaleRatio)
    );

    // デバッグモードでの詳細ログ
    if (LEGACY_COMPATIBILITY.DEBUG_MODE && LEGACY_COMPATIBILITY.ENABLE_PRECISION_LOGGING) {
      console.log('🎯 Palette CSS Variables Updated:', {
        bottleOpenerWidth: CSS_VARIABLES.formatCSSValue(config.bottleOpenerWidth),
        paletteSize: CSS_VARIABLES.formatCSSValue(config.paletteSize),
        paletteRadius: CSS_VARIABLES.formatCSSValue(config.paletteRadius),
        scaleRatio: CSS_VARIABLES.formatCSSRatio(config.scaleRatio),
      });
    }
  }, []);

  /**
   * レスポンシブ更新処理
   */
  const handleResize = useCallback(() => {
    if (!LEGACY_COMPATIBILITY.ENABLE_TRANSPARENT_PALETTE) {
      return; // 新システムが無効の場合は何もしない
    }

    const deviceType = getDeviceType();
    const config = getPaletteConfig(deviceType);
    updateCSSVariables(config);
  }, [getDeviceType, getPaletteConfig, updateCSSVariables]);

  /**
   * 手動でCSS変数を更新する関数
   * デバッグや動的調整時に使用
   */
  const forceUpdateCSS = useCallback((rouletteSize?: number) => {
    if (rouletteSize) {
      // カスタムサイズでの動的計算
      const customConfig: PaletteConfig = {
        bottleOpenerWidth: TRANSPARENT_PALETTE_SYSTEM.calculateBottleOpenerWidth(rouletteSize),
        paletteSize: TRANSPARENT_PALETTE_SYSTEM.calculatePaletteSize(rouletteSize),
        paletteRadius: TRANSPARENT_PALETTE_SYSTEM.calculatePaletteRadius(rouletteSize),
        scaleRatio: TRANSPARENT_PALETTE_SYSTEM.calculateScaleRatio(rouletteSize),
      };
      updateCSSVariables(customConfig);
    } else {
      // 標準のレスポンシブ更新
      handleResize();
    }
  }, [handleResize, updateCSSVariables]);

  /**
   * 初期化とイベントリスナー登録
   */
  useEffect(() => {
    if (!LEGACY_COMPATIBILITY.ENABLE_TRANSPARENT_PALETTE) {
      if (LEGACY_COMPATIBILITY.DEBUG_MODE) {
        console.log('⚠️ Transparent Palette System is disabled');
      }
      return;
    }

    // 初期設定
    handleResize();

    // Client-side のみでイベントリスナー登録
    if (typeof window !== 'undefined') {
      // リサイズイベントリスナー登録
      window.addEventListener('resize', handleResize);
      
      // オリエンテーション変更対応 (モバイル)
      window.addEventListener('orientationchange', handleResize);
    }

    if (LEGACY_COMPATIBILITY.DEBUG_MODE) {
      console.log('🚀 Transparent Palette CSS system initialized');
    }

    // クリーンアップ
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      }
      
      if (LEGACY_COMPATIBILITY.DEBUG_MODE) {
        console.log('🧹 Palette CSS system cleaned up');
      }
    };
  }, [handleResize]);

  // Hook の戻り値
  return {
    forceUpdateCSS,
    getDeviceType,
    getPaletteConfig,
    currentDeviceType: getDeviceType(),
    isTransparentPaletteEnabled: LEGACY_COMPATIBILITY.ENABLE_TRANSPARENT_PALETTE,
  };
};