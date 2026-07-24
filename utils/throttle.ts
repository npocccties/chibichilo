/**
 * 指定間隔で関数の実行を間引く
 */
export default function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = waitMs - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      lastCall = now;
      fn(...args);
      return;
    }

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = undefined;
        fn(...args);
      }, remaining);
    }
  };
}
