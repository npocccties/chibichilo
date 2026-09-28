import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReplayIcon from "@mui/icons-material/Replay";
import { SeekButton } from "@videojs/react";
import { SEEK_BUTTON_SECONDS } from "$utils/video/seekSeconds";

function SeekControl({ seconds }: { seconds: number }) {
  const backward = seconds < 0;

  return (
    <SeekButton
      seconds={seconds}
      className="media-button chibichilo-seek-button"
    >
      <ReplayIcon
        className={
          backward
            ? "chibichilo-seek-button-icon"
            : "chibichilo-seek-button-icon chibichilo-seek-button-icon-forward"
        }
        fontSize="inherit"
      />
    </SeekButton>
  );
}

function findVolumeInsertTarget(root: Element): {
  parent: Element;
  before: Element;
} | null {
  const primary = root.querySelector(".video-controls-primary");
  const volumeButton = primary?.querySelector(".video-controls-volume-button");
  if (!primary || !volumeButton) return null;

  let before: Element = volumeButton;
  while (before.parentElement && before.parentElement !== primary) {
    before = before.parentElement;
  }
  if (before.parentElement !== primary) return null;

  return { parent: primary, before };
}

/**
 * VideoSkin のコントロールバー（再生と音量の間）へ ±15 秒シークを差し込む。
 * パッケージ版 VideoSkin は Seek を含まないため、DOM スロットへ portal する。
 */
function SeekButtons() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const root =
      host?.closest<HTMLElement>('[data-preset="video"]') ??
      host?.closest<HTMLElement>(".video-skin");
    if (!root) return;

    let slotEl: HTMLElement | null = null;
    let observer: MutationObserver | null = null;

    const detach = () => {
      slotEl?.remove();
      slotEl = null;
      setSlot(null);
    };

    const attach = () => {
      const target = findVolumeInsertTarget(root);
      if (!target) return false;

      if (slotEl?.isConnected && slotEl.parentElement === target.parent) {
        if (slotEl.nextElementSibling !== target.before) {
          target.parent.insertBefore(slotEl, target.before);
        }
        return true;
      }

      detach();
      slotEl = document.createElement("div");
      slotEl.className = "chibichilo-seek-slot";
      slotEl.setAttribute("role", "group");
      slotEl.setAttribute("aria-label", "シーク");
      target.parent.insertBefore(slotEl, target.before);
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
      detach();
    };
  }, []);

  return (
    <>
      <span ref={hostRef} hidden aria-hidden />
      {slot &&
        createPortal(
          <>
            <SeekControl seconds={-SEEK_BUTTON_SECONDS} />
            <SeekControl seconds={SEEK_BUTTON_SECONDS} />
          </>,
          slot
        )}
    </>
  );
}

export default SeekButtons;
