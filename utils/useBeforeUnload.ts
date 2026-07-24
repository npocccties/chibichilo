import { useEffect } from "react";

/**
 * ページ離脱時に確認ダイアログを表示する
 */
export default function useBeforeUnload(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}
