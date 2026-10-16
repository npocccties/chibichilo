import { useRef, type MutableRefObject } from "react";

/** 常に最新の値を参照する ref（購読系フックの依存を安定させる） */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
