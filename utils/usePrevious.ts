import { useRef } from "react";

/**
 * 直前の値を保持する
 */
export default function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  const previous = ref.current;
  ref.current = value;
  return previous;
}
