import { useEffect } from "react";
import type { VideoMedia } from "./media";

const YT_UNSTARTED = -1;
const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_BUFFERING = 3;
const YT_CUED = 5;

type StateChangeListener = (event: { data: number }) => void;

type YouTubePlayerLike = {
  addEventListener(event: "onStateChange", listener: StateChangeListener): void;
  removeEventListener(
    event: "onStateChange",
    listener: StateChangeListener
  ): void;
};

type YouTubeMedia = VideoMedia & { engine?: YouTubePlayerLike | null };

function findPausedGetter(media: object): (() => boolean) | undefined {
  for (
    let proto = Object.getPrototypeOf(media);
    proto;
    proto = Object.getPrototypeOf(proto)
  ) {
    const getter = Object.getOwnPropertyDescriptor(proto, "paused")?.get;
    if (getter) return getter;
  }
  return undefined;
}

/**
 * `@videojs/youtube-video` は再生開始が拒否されて UNSTARTED/CUED に戻っても paused=false のまま残る。
 * iOS で自動再生がブロックされると再生ボタンが一時停止扱いのまま押しても再生できなくなるため、
 * YouTube プレイヤーの状態から paused を補正する。
 */
export function useYouTubeBlockedPlaybackFix(
  media: VideoMedia | null,
  enabled: boolean
): void {
  useEffect(() => {
    if (!media || !enabled) return;
    const getPaused = findPausedGetter(media);
    if (!getPaused) return;

    let blocked = false;
    Object.defineProperty(media, "paused", {
      configurable: true,
      get: () => blocked || getPaused.call(media),
    });

    const onStateChange: StateChangeListener = ({ data }) => {
      if (data === YT_UNSTARTED || data === YT_CUED) {
        if (blocked || getPaused.call(media)) return;
        blocked = true;
        media.dispatchEvent(new Event("pause"));
      } else if (data === YT_PLAYING || data === YT_BUFFERING) {
        if (!blocked) return;
        blocked = false;
        // adapter は一度 play を発火すると、拒否後の再生開始では play を発火しない
        media.dispatchEvent(new Event("play"));
      } else if (data === YT_PAUSED || data === YT_ENDED) {
        blocked = false;
      }
    };

    let engine: YouTubePlayerLike | null = null;
    const attach = () => {
      const next = (media as YouTubeMedia).engine ?? null;
      if (next === engine) return;
      engine?.removeEventListener("onStateChange", onStateChange);
      engine = next;
      blocked = false;
      engine?.addEventListener("onStateChange", onStateChange);
    };
    const attachEvents = ["loadstart", "loadedmetadata", "play"];
    attach();
    attachEvents.forEach((type) => media.addEventListener(type, attach));

    return () => {
      attachEvents.forEach((type) => media.removeEventListener(type, attach));
      engine?.removeEventListener("onStateChange", onStateChange);
      delete (media as { paused?: boolean }).paused;
    };
  }, [media, enabled]);
}
