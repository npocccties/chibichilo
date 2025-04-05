/**
 * 数値を四捨五入
 * @param n 対象となる数値
 * @param round_digit 四捨五入する桁（負数の場合は小数点以下の桁）
 */
export function round(n: number, round_digit: number) {
  return (
    Math.round(n * Math.pow(10, -1 * round_digit)) /
    Math.pow(10, -1 * round_digit)
  );
}
