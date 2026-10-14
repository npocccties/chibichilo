/**
 * 秒数を hh:mm:ss.sss 形式の文字列に変換する
 */
export function formatSecondsToHms(seconds: number): string {
  return formatMsToHms(Math.floor(seconds * 1000));
}

/**
 * ミリ秒を hh:mm:ss.sss 形式の文字列に変換する
 */
export function formatMsToHms(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const milliseconds = ms % 1_000;

  return (
    [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":") + `.${String(milliseconds).padStart(3, "0")}`
  );
}
