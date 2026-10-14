import { useCallback, useEffect, useRef } from "react";

/**
 * コールバックの実行を指定ミリ秒だけ遅延する
 */
export default function useDebouncedCallback<
  T extends (...args: never[]) => void,
>(callback: T, delay: number): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  callbackRef.current = callback;

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
