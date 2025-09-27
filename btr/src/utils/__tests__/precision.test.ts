/**
 * PrecisionUtils ユニットテスト
 * 
 * 精密計算ユーティリティの正確性と一貫性を検証
 */

import { PrecisionUtils } from '../precision';

describe('PrecisionUtils', () => {
  describe('toHalfPixel', () => {
    test('0.5px単位での正確な丸め', () => {
      expect(PrecisionUtils.toHalfPixel(268.8)).toBe(269);
      expect(PrecisionUtils.toHalfPixel(148.6)).toBe(148.5);
      expect(PrecisionUtils.toHalfPixel(123.2)).toBe(123);
      expect(PrecisionUtils.toHalfPixel(123.3)).toBe(123.5);
      expect(PrecisionUtils.toHalfPixel(123.7)).toBe(123.5);
      expect(PrecisionUtils.toHalfPixel(123.8)).toBe(124);
    });

    test('整数値の保持', () => {
      expect(PrecisionUtils.toHalfPixel(100)).toBe(100);
      expect(PrecisionUtils.toHalfPixel(248)).toBe(248);
    });

    test('負の値の処理', () => {
      expect(PrecisionUtils.toHalfPixel(-1.2)).toBe(-1);
      expect(PrecisionUtils.toHalfPixel(-1.8)).toBe(-2);
    });
  });

  describe('toIntegerPixel', () => {
    test('整数への正確な丸め', () => {
      expect(PrecisionUtils.toIntegerPixel(297.164995)).toBe(297);
      expect(PrecisionUtils.toIntegerPixel(298.7)).toBe(299);
      expect(PrecisionUtils.toIntegerPixel(298.4)).toBe(298);
    });

    test('整数値の保持', () => {
      expect(PrecisionUtils.toIntegerPixel(248)).toBe(248);
      expect(PrecisionUtils.toIntegerPixel(100)).toBe(100);
    });
  });

  describe('toHighPrecision', () => {
    test('指定桁数での精度制御', () => {
      expect(PrecisionUtils.toHighPrecision(0.14769500659, 6)).toBe(0.147695);
      expect(PrecisionUtils.toHighPrecision(0.17719300589, 6)).toBe(0.177193);
      expect(PrecisionUtils.toHighPrecision(Math.PI, 3)).toBe(3.142);
    });

    test('デフォルト精度(6桁)の適用', () => {
      expect(PrecisionUtils.toHighPrecision(1 / 3)).toBe(0.333333);
      expect(PrecisionUtils.toHighPrecision(2 / 7)).toBe(0.285714);
    });
  });

  describe('toCSSPixel', () => {
    test('整数値のpx単位フォーマット', () => {
      expect(PrecisionUtils.toCSSPixel(248)).toBe('248px');
      expect(PrecisionUtils.toCSSPixel(100)).toBe('100px');
      expect(PrecisionUtils.toCSSPixel(0)).toBe('0px');
    });

    test('小数値の適切なフォーマット', () => {
      expect(PrecisionUtils.toCSSPixel(148.5)).toBe('148.5px');
      expect(PrecisionUtils.toCSSPixel(268.8)).toBe('269px'); // 0.5px単位に丸められる
      expect(PrecisionUtils.toCSSPixel(123.3)).toBe('123.5px');
    });

    test('負の値のフォーマット', () => {
      expect(PrecisionUtils.toCSSPixel(-10)).toBe('-10px');
      expect(PrecisionUtils.toCSSPixel(-10.5)).toBe('-10.5px');
    });
  });

  describe('toCSSPercentage', () => {
    test('パーセンテージの正確なフォーマット', () => {
      expect(PrecisionUtils.toCSSPercentage(70)).toBe('70%');
      expect(PrecisionUtils.toCSSPercentage(70.555)).toBe('70.56%');
      expect(PrecisionUtils.toCSSPercentage(33.333333)).toBe('33.33%');
    });

    test('精度指定でのフォーマット', () => {
      expect(PrecisionUtils.toCSSPercentage(33.333333, 1)).toBe('33.3%');
      expect(PrecisionUtils.toCSSPercentage(33.333333, 4)).toBe('33.3333%');
    });
  });

  describe('calculatePreciseRatio', () => {
    test('高精度スケール比の計算', () => {
      expect(PrecisionUtils.calculatePreciseRatio(224, 1517)).toBe(0.147695);
      expect(PrecisionUtils.calculatePreciseRatio(269, 1517)).toBe(0.177325);
    });

    test('ゼロ除算エラーの処理', () => {
      expect(() => {
        PrecisionUtils.calculatePreciseRatio(100, 0);
      }).toThrow('Division by zero is not allowed');
    });

    test('精度指定での計算', () => {
      expect(PrecisionUtils.calculatePreciseRatio(1, 3, 3)).toBe(0.333);
      expect(PrecisionUtils.calculatePreciseRatio(2, 7, 4)).toBe(0.2857);
    });
  });

  describe('実際のパレット計算での統合テスト', () => {
    test('モバイル設定の計算精度', () => {
      const rouletteSize = 320;
      const bottleOpenerWidth = rouletteSize * 0.7; // 224
      const scaleRatio = PrecisionUtils.calculatePreciseRatio(bottleOpenerWidth, 1517);
      const paletteRadius = PrecisionUtils.toHalfPixel(838.6 * scaleRatio);
      const paletteSize = PrecisionUtils.toIntegerPixel(paletteRadius * 2);
      
      expect(bottleOpenerWidth).toBe(224);
      expect(scaleRatio).toBe(0.147695);
      expect(paletteRadius).toBe(124);
      expect(paletteSize).toBe(248);
    });

    test('デスクトップ設定の計算精度', () => {
      const rouletteSize = 384;
      const bottleOpenerWidth = PrecisionUtils.toHalfPixel(rouletteSize * 0.7); // 268.8 → 269
      const scaleRatio = PrecisionUtils.calculatePreciseRatio(bottleOpenerWidth, 1517);
      const paletteRadius = PrecisionUtils.toHalfPixel(838.6 * scaleRatio);
      const paletteSize = PrecisionUtils.toIntegerPixel(paletteRadius * 2);
      
      expect(bottleOpenerWidth).toBe(269);
      expect(scaleRatio).toBe(0.177325);
      expect(paletteRadius).toBe(149);
      expect(paletteSize).toBe(298);
    });

    test('パレットサイズがルーレットサイズ以下', () => {
      const mobileRouletteSize = 320;
      const desktopRouletteSize = 384;
      
      const mobilePaletteSize = PrecisionUtils.toIntegerPixel(
        PrecisionUtils.toHalfPixel(838.6 * (224 / 1517)) * 2
      );
      
      const desktopPaletteSize = PrecisionUtils.toIntegerPixel(
        PrecisionUtils.toHalfPixel(838.6 * (269 / 1517)) * 2
      );
      
      expect(mobilePaletteSize).toBeLessThan(mobileRouletteSize);
      expect(desktopPaletteSize).toBeLessThan(desktopRouletteSize);
    });
  });
});