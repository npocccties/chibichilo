import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, useMedia } from "@videojs/react";
import { CheckIcon } from "@videojs/react/icons";
import { isVideoMedia } from "$utils/video/media";

/** v8 プレイヤー相当の再生速度一覧 */
const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

function formatRate(rate: number): string {
  return `${rate}x`;
}

function nearestRate(rate: number): number {
  return PLAYBACK_RATES.reduce((best, candidate) =>
    Math.abs(candidate - rate) < Math.abs(best - rate) ? candidate : best
  );
}

function PlaybackRateMenuContent() {
  const media = useMedia();
  const [playbackRate, setPlaybackRateState] = useState(1);

  useEffect(() => {
    if (!isVideoMedia(media)) {
      setPlaybackRateState(1);
      return;
    }

    const sync = () => setPlaybackRateState(media.playbackRate ?? 1);
    sync();
    media.addEventListener("ratechange", sync);
    return () => media.removeEventListener("ratechange", sync);
  }, [media]);

  const selected = nearestRate(playbackRate);
  const setPlaybackRate = (rate: number) => {
    if (isVideoMedia(media)) media.playbackRate = rate;
  };

  return (
    <Menu.Root side="top" align="end" boundary="viewport">
      <Menu.Trigger
        render={
          <button
            type="button"
            className="media-button chibichilo-playback-rate-button"
            aria-label={`再生速度 ${formatRate(selected)}`}
          />
        }
      >
        {formatRate(selected)}
      </Menu.Trigger>
      <Menu.Popup className="media-popup media-popup-surface media-menu-popup chibichilo-playback-rate-menu">
        <Menu.Content className="media-menu-content">
          <Menu.RadioGroup
            className="media-menu-radio-group"
            value={String(selected)}
            onValueChange={(value) => setPlaybackRate(Number(value))}
            aria-label="再生速度"
          >
            {[...PLAYBACK_RATES].reverse().map((rate) => (
              <Menu.RadioItem
                key={rate}
                value={String(rate)}
                className="media-menu-radio-item"
              >
                <span>{formatRate(rate)}</span>
                <Menu.ItemIndicator
                  forceMount
                  className="media-menu-item-indicator"
                >
                  <CheckIcon className="media-menu-radio-item-icon" />
                </Menu.ItemIndicator>
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}

function findPrimaryChildWrapper(
  primary: Element,
  selector: string
): HTMLElement | null {
  const el = primary.querySelector<HTMLElement>(selector);
  if (!el || el.closest(".chibichilo-captions-slot")) return null;

  let wrapper: HTMLElement = el;
  while (wrapper.parentElement && wrapper.parentElement !== primary) {
    wrapper = wrapper.parentElement;
  }
  return wrapper.parentElement === primary ? wrapper : null;
}

function findCaptionsAnchor(primary: Element): HTMLElement | null {
  return (
    primary.querySelector<HTMLElement>(".chibichilo-captions-slot") ??
    findPrimaryChildWrapper(primary, ".video-controls-captions-button")
  );
}

/**
 * 字幕があればその直後、なければ設定歯車の直前（なければ末尾）。
 * 速度スロット自身は基準にしない。直後に置くと nextSibling が自分になり、
 * insertBefore が空の移動を繰り返して MutationObserver が回り続ける。
 */
function findPlaybackRateInsertBefore(
  primary: Element,
  slotEl: HTMLElement | null
): Node | null {
  const captionsAnchor = findCaptionsAnchor(primary);
  if (captionsAnchor) {
    const next = captionsAnchor.nextSibling;
    if (slotEl && next === slotEl) return slotEl.nextSibling;
    return next;
  }

  const settings = findPrimaryChildWrapper(
    primary,
    ".video-controls-settings-button"
  );
  if (slotEl && settings === slotEl) return slotEl.nextSibling;
  return settings;
}

/**
 * 設定歯車を隠し、現在速度を表示するメニューボタンを置く。
 * 字幕あり: 字幕の右 / 字幕なし: 設定歯車の位置（歯車は非表示）
 */
function PlaybackRateMenu() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const root =
      host?.closest<HTMLElement>('[data-preset="video"]') ??
      host?.closest<HTMLElement>(".video-skin");
    if (!root) return;

    let slotEl: HTMLElement | null = null;
    let hiddenSettings: HTMLElement | null = null;
    let observer: MutationObserver | null = null;

    const detach = () => {
      if (hiddenSettings) {
        hiddenSettings.hidden = false;
        hiddenSettings.style.removeProperty("display");
        hiddenSettings = null;
      }
      slotEl?.remove();
      slotEl = null;
      setSlot(null);
    };

    const hideSettings = (primary: Element) => {
      const settings = findPrimaryChildWrapper(
        primary,
        ".video-controls-settings-button"
      );
      if (!settings || settings === hiddenSettings) return;

      hiddenSettings = settings;
      settings.hidden = true;
      settings.style.display = "none";
    };

    const attach = () => {
      const primary = root.querySelector(".video-controls-primary");
      if (!primary) return false;

      hideSettings(primary);

      const insertBefore = findPlaybackRateInsertBefore(primary, slotEl);

      if (slotEl?.isConnected && slotEl.parentElement === primary) {
        // 後から字幕スロットが付いたら、字幕 → 速度 に並び替える
        if (slotEl.nextSibling !== insertBefore) {
          primary.insertBefore(slotEl, insertBefore);
        }
        return true;
      }

      slotEl = document.createElement("div");
      slotEl.className = "chibichilo-playback-rate-slot";
      primary.insertBefore(slotEl, insertBefore);
      setSlot(slotEl);
      return true;
    };

    attach();
    // コントロール構築遅延・字幕スロット後差し込みの両方に追従する
    observer = new MutationObserver(() => {
      attach();
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      detach();
    };
  }, []);

  return (
    <>
      <span ref={hostRef} hidden aria-hidden />
      {slot && createPortal(<PlaybackRateMenuContent />, slot)}
    </>
  );
}

export default PlaybackRateMenu;
