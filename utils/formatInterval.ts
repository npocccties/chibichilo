import formatDuration from "date-fns/formatDuration";
import intervalToDuration from "date-fns/intervalToDuration";
import ja from "date-fns/locale/ja";

/**
 * 時間間隔を日本語表記で表示する
 * @param start 開始日時
 * @param end 終了日時
 * @returns 日本語表記の時間間隔
 */
function formatInterval(start: Date | number, end: Date | number) {
  const duration = intervalToDuration({ start, end });
  return formatDuration(duration, { locale: ja }) || "1秒未満";
}

export default formatInterval;
