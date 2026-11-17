import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FullscreenEnterIcon, FullscreenExitIcon } from "@videojs/react/icons";

/** 付いている間は VideoSkin の全画面ボタンを隠す（Video.tsx のスタイル） */
export const FALLBACK_ATTR = "data-chibichilo-full-window-fallback";

type Props = {
  active: boolean;
  onToggle: () => void;
};

function isElementFullscreenSupported(): boolean {
  const doc = document as { webkitFullscreenEnabled?: boolean };
  return Boolean(document.fullscreenEnabled || doc.webkitFullscreenEnabled);
}

/**
 * iPhone の Safari は要素の全画面 API を持たず、VideoSkin の全画面ボタンは iframe 埋め込みの動画では何もしない。
 * その環境では VideoSkin のボタンを隠し、v8 の全画面ウィンドウ表示（enterFullWindow）相当のボタンに差し替える。
 */
function FullWindowButton({ active, onToggle }: Props) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isElementFullscreenSupported()) return;
    const host = hostRef.current;
    const root =
      host?.closest<HTMLElement>('[data-preset="video"]') ??
      host?.closest<HTMLElement>(".video-skin");
    if (!root) return;

    let slotEl: HTMLElement | null = null;
    let observer: MutationObserver | null = null;
    root.setAttribute(FALLBACK_ATTR, "");

    const attach = () => {
      const secondary = root.querySelector(".video-controls-secondary");
      if (!secondary) return false;

      slotEl = document.createElement("div");
      slotEl.className = "chibichilo-full-window-slot";
      secondary.appendChild(slotEl);
      setSlot(slotEl);
      return true;
    };

    if (!attach()) {
      observer = new MutationObserver(() => {
        if (attach()) observer?.disconnect();
      });
      observer.observe(root, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      root.removeAttribute(FALLBACK_ATTR);
      slotEl?.remove();
      setSlot(null);
    };
  }, []);

  return (
    <>
      <span ref={hostRef} hidden aria-hidden />
      {slot &&
        createPortal(
          <button
            type="button"
            className="media-button"
            aria-label={active ? "全画面表示を終了" : "全画面表示"}
            onClick={onToggle}
          >
            {active ? (
              <FullscreenExitIcon className="media-button-icon" />
            ) : (
              <FullscreenEnterIcon className="media-button-icon" />
            )}
          </button>,
          slot
        )}
    </>
  );
}

export default FullWindowButton;
