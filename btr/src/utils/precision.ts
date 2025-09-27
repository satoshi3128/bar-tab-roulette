/**
 * 精密計算ユーティリティ
 * 
 * ピクセル計算における丸め処理と精度制御を提供
 * CSS出力時の最適化とブラウザ互換性を確保
 */

export class PrecisionUtils {
  /**
   * 0.5ピクセル単位での丸め処理
   * CSSサブピクセル対応とブラウザ最適化のため
   * 
   * @param value - 丸め対象の数値
   * @returns 0.5px単位に丸められた値
   */
  static toHalfPixel(value: number): number {
    return Math.round(value * 2) / 2;
  }
  
  /**
   * 整数ピクセルへの丸め処理
   * 標準CSS推奨値への変換
   * 
   * @param value - 丸め対象の数値
   * @returns 整数に丸められた値
   */
  static toIntegerPixel(value: number): number {
    return Math.round(value);
  }
  
  /**
   * 高精度計算用の小数点制御
   * 内部計算での精度保持に使用
   * 
   * @param value - 精度制御対象の数値
   * @param digits - 保持する小数点以下桁数 (デフォルト: 6)
   * @returns 指定桁数に制御された数値
   */
  static toHighPrecision(value: number, digits: number = 6): number {
    return Number(value.toFixed(digits));
  }
  
  /**
   * CSS値への最適フォーマット
   * ブラウザ最適化とレンダリング性能向上のため
   * 
   * @param value - CSS値に変換する数値
   * @returns 最適化されたCSS文字列 (例: "248px", "148.5px")
   */
  static toCSSPixel(value: number): string {
    const rounded = this.toHalfPixel(value);
    return rounded % 1 === 0 ? `${rounded}px` : `${rounded.toFixed(1)}px`;
  }
  
  /**
   * パーセンテージ値の精密計算
   * レスポンシブ計算での精度確保
   * 
   * @param value - パーセンテージ値 (0-100)
   * @param precision - 小数点以下桁数 (デフォルト: 2)
   * @returns 精密化されたパーセンテージ文字列
   */
  static toCSSPercentage(value: number, precision: number = 2): string {
    return `${Number(value.toFixed(precision))}%`;
  }
  
  /**
   * スケール比の高精度計算
   * 画像スケーリングでの誤差最小化
   * 
   * @param numerator - 分子
   * @param denominator - 分母
   * @param precision - 精度 (デフォルト: 6桁)
   * @returns 高精度スケール比
   */
  static calculatePreciseRatio(numerator: number, denominator: number, precision: number = 6): number {
    if (denominator === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return this.toHighPrecision(numerator / denominator, precision);
  }
}