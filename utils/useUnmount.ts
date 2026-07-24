import { useEffect, useRef } from "react";

/**
 * コンポーネントのアンマウント時にコールバックを実行する
 */
export default function useUnmount(fn: () => void): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => () => fnRef.current(), []);
}
