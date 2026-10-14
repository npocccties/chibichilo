import { useEffect } from "react";

/**
 * body のスクロールを固定する
 */
export default function useLockBodyScroll(lock = false): void {
  useEffect(() => {
    if (!lock) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [lock]);
}
