import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaptionsButton, Menu } from "@videojs/react";
import { CaptionsRadioGroup } from "@videojs/react/ui/captions-radio-group";
import {
  CaptionsOffIcon,
  CaptionsOnIcon,
  CheckIcon,
} from "@videojs/react/icons";

const OFF_LABEL = "サブタイトル オフ";

function CaptionsMenuContent() {
  return (
    <Menu.Root side="top" align="end" boundary="viewport">
      <CaptionsRadioGroup.Root label="字幕">
        <Menu.Trigger
          render={
            <CaptionsButton className="media-button media-captions-button video-controls-captions-button">
              <CaptionsOffIcon className="media-button-icon media-captions-button-off-icon" />
              <CaptionsOnIcon className="media-button-icon media-captions-button-on-icon" />
            </CaptionsButton>
          }
        />
        <Menu.Popup className="media-popup media-popup-surface media-menu-popup chibichilo-captions-menu">
          <Menu.Content className="media-menu-content">
            <CaptionsRadioGroup.Options
              className="media-menu-radio-group"
              renderItem={(props, item) => (
                <Menu.RadioItem {...props} className="media-menu-radio-item">
                  <span>{item.value === "off" ? OFF_LABEL : item.label}</span>
                  <Menu.ItemIndicator
                    forceMount
                    className="media-menu-item-indicator"
                  >
                    <CheckIcon className="media-menu-radio-item-icon" />
                  </Menu.ItemIndicator>
                </Menu.RadioItem>
              )}
            />
          </Menu.Content>
        </Menu.Popup>
      </CaptionsRadioGroup.Root>
    </Menu.Root>
  );
}

function findCaptionsControl(root: Element): {
  wrapper: HTMLElement;
  parent: Element;
} | null {
  const primary = root.querySelector(".video-controls-primary");
  if (!primary) return null;

  // 差し込み済みスロット内の CC は除外し、VideoSkin 側だけを対象にする
  const buttons = primary.querySelectorAll<HTMLElement>(
    ".video-controls-captions-button"
  );
  let button: HTMLElement | null = null;
  for (const candidate of buttons) {
    if (!candidate.closest(".chibichilo-captions-slot")) {
      button = candidate;
      break;
    }
  }
  if (!button) return null;

  let wrapper: HTMLElement = button;
  while (wrapper.parentElement && wrapper.parentElement !== primary) {
    wrapper = wrapper.parentElement;
  }
  if (wrapper.parentElement !== primary) return null;

  return { wrapper, parent: primary };
}

/**
 * VideoSkin の CaptionsButton（トグルのみ）を、v8 相当の言語選択メニューに差し替える。
 * 2 本以上の字幕があるとき CC ボタンから Off / 各言語を選べる。
 */
function CaptionsMenu() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const root =
      host?.closest<HTMLElement>('[data-preset="video"]') ??
      host?.closest<HTMLElement>(".video-skin");
    if (!root) return;

    let slotEl: HTMLElement | null = null;
    let hiddenWrapper: HTMLElement | null = null;
    let observer: MutationObserver | null = null;

    const detach = () => {
      if (hiddenWrapper) {
        hiddenWrapper.hidden = false;
        hiddenWrapper.style.removeProperty("display");
        hiddenWrapper = null;
      }
      slotEl?.remove();
      slotEl = null;
      setSlot(null);
    };

    const attach = () => {
      // 一度差し込んだら再配置しない（PlaybackRateMenu との位置取り合いを防ぐ）
      if (slotEl?.isConnected) {
        if (hiddenWrapper) {
          hiddenWrapper.hidden = true;
          hiddenWrapper.style.display = "none";
        }
        return true;
      }

      const target = findCaptionsControl(root);
      if (!target) return false;

      hiddenWrapper = target.wrapper;
      target.wrapper.hidden = true;
      target.wrapper.style.display = "none";

      slotEl = document.createElement("div");
      slotEl.className = "chibichilo-captions-slot";
      target.parent.insertBefore(slotEl, target.wrapper.nextSibling);
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
      {slot && createPortal(<CaptionsMenuContent />, slot)}
    </>
  );
}

export default CaptionsMenu;
