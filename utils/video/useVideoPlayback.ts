import { useEffect } from "react";
import type { VideoInstance } from "$types/videoInstance";
import type { VideoMedia } from "$utils/video/media";
import { whenMediaReady } from "$utils/video/media";
import { usePlayerState } from "$store/player";
import { usePlayerTrackingAtom } from "$store/playerTracker";
import { useLatestRef } from "./useLatestRef";

function isValidPlaybackEnd({
  currentTime = 0,
  stopTime,
}: {
  currentTime: number | undefined;
  stopTime: number | null | undefined;
}): boolean {
  return typeof stopTime === "number" && 0 < stopTime && stopTime < currentTime;
}

/** 非アクティブ（他トピック）の再生だけ停止する */
function usePauseWhenInactive(media: VideoMedia | null, active: boolean): void {
  useEffect(() => {
    if (!media || active) return;
    media.pause();
  }, [media, active]);
}

/** アクティブかつ autoplay のとき再生を試みる（cleanup では pause しない） */
function useAutoplay(
  media: VideoMedia | null,
  enabled: boolean,
  /** セクション切替検知用（旧実装踏襲） */
  replayToken?: unknown
): void {
  useEffect(() => {
    if (!media || !enabled) return;
    let active = true;
    const play = async () => {
      if (!active) return;
      await media.play();
    };
    const onPlay = () => {
      clearTimeout(timeout);
      media.removeEventListener("play", onPlay);
    };
    // NOTE: 埋め込み系メディアで初回 play が握りつぶされることがあるので再試行する
    const timeout = setTimeout(() => play(), 1_000);
    media.addEventListener("play", onPlay);
    const cancelReady = whenMediaReady(media, () => {
      void play();
    });
    return () => {
      active = false;
      clearTimeout(timeout);
      media.removeEventListener("play", onPlay);
      cancelReady();
    };
  }, [media, enabled, replayToken]);
}

/** media の基本イベントを React コールバックへ橋渡し */
function useMediaEvents(
  media: VideoMedia | null,
  handlers: {
    onEnded?: () => void;
    onDurationChange?: (duration: number) => void;
    onTimeUpdate?: (currentTime: number) => void;
  }
): void {
  const handlersRef = useLatestRef(handlers);

  useEffect(() => {
    if (!media) return;

    const handleEnded = () => handlersRef.current.onEnded?.();
    const handleDurationChange = () => {
      const duration = media.duration;
      if (Number.isFinite(duration) && duration > 0) {
        handlersRef.current.onDurationChange?.(duration);
      }
    };
    const handleTimeUpdate = () => {
      const currentTime = media.currentTime;
      if (Number.isFinite(currentTime)) {
        handlersRef.current.onTimeUpdate?.(currentTime);
      }
    };

    media.addEventListener("ended", handleEnded);
    media.addEventListener("durationchange", handleDurationChange);
    media.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      media.removeEventListener("ended", handleEnded);
      media.removeEventListener("durationchange", handleDurationChange);
      media.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [media, handlersRef]);
}

function useClipBounds(
  media: VideoMedia | null,
  {
    enabled,
    startTime,
    stopTime,
    videoInstance,
    onEnded,
  }: {
    enabled: boolean;
    startTime?: number | null;
    stopTime?: number | null;
    videoInstance: VideoInstance;
    onEnded?: () => void;
  }
): void {
  const onEndedRef = useLatestRef(onEnded);

  useEffect(() => {
    if (!media || !enabled) return;

    const handleSeeked = () => {
      const currentTime = media.currentTime;
      if (
        typeof startTime === "number" &&
        Number.isFinite(startTime) &&
        currentTime < startTime
      ) {
        media.currentTime = startTime;
      }
    };

    const handleTimeUpdate = () => {
      if (videoInstance.stopTimeOver) return;
      if (isValidPlaybackEnd({ currentTime: media.currentTime, stopTime })) {
        videoInstance.stopTimeOver = true;
        media.pause();
        onEndedRef.current?.();
      }
    };

    const handlePlay = () => {
      // 終了位置より後ろにシークすると、意図せず再生が再開してしまうことがあるので抑制する
      if (videoInstance.stopTimeOver) media.pause();
    };

    const handleFirstPlay = () => {
      if (!videoInstance.firstPlay) return;
      if (typeof startTime === "number" && Number.isFinite(startTime)) {
        media.currentTime = startTime;
      }
      videoInstance.firstPlay = false;
    };

    const cancelReady = whenMediaReady(media, () => {
      if (videoInstance.stopTimeOver) {
        if (typeof startTime === "number" && Number.isFinite(startTime)) {
          media.currentTime = startTime;
        }
        videoInstance.stopTimeOver = false;
      }
      media.addEventListener("timeupdate", handleTimeUpdate);
      media.addEventListener("seeked", handleSeeked);
    });

    media.addEventListener("play", handlePlay);
    media.addEventListener("play", handleFirstPlay, { once: true });

    return () => {
      cancelReady();
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("seeked", handleSeeked);
      media.removeEventListener("play", handlePlay);
      media.removeEventListener("play", handleFirstPlay);
    };
  }, [media, enabled, startTime, stopTime, videoInstance, onEndedRef]);
}

function usePlayerTracking(
  media: VideoMedia | null,
  videoInstance: VideoInstance,
  enabled: boolean
): void {
  const playerTracking = usePlayerTrackingAtom();

  useEffect(() => {
    if (!media || !enabled) return;
    const cancelReady = whenMediaReady(media, () => {
      playerTracking({
        player: media,
        url: videoInstance.url,
        type: videoInstance.type,
      });
    });
    return () => {
      cancelReady();
    };
  }, [media, videoInstance, enabled, playerTracking]);
}

type UseVideoPlaybackArgs = {
  media: VideoMedia | null;
  videoInstance: VideoInstance;
  /** 表示中のトピックか */
  active: boolean;
  autoplay?: boolean;
  startTime?: number | null;
  stopTime?: number | null;
  onEnded?: () => void;
  onDurationChange?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
};

/**
 * 動画プレイヤーの命令的副作用を集約する。
 * - 非アクティブ: pause のみ（現在動画の autoplay は壊さない）
 * - アクティブ + autoplay: play（cleanup では pause しない）
 */
export function useVideoPlayback({
  media,
  videoInstance,
  active,
  autoplay = false,
  startTime,
  stopTime,
  onEnded,
  onDurationChange,
  onTimeUpdate,
}: UseVideoPlaybackArgs): void {
  usePlayerState(media);
  usePauseWhenInactive(media, active);
  useAutoplay(media, active && autoplay, onEnded);
  useMediaEvents(media, { onEnded, onDurationChange, onTimeUpdate });
  useClipBounds(media, {
    enabled: active,
    startTime,
    stopTime,
    videoInstance,
    onEnded,
  });
  usePlayerTracking(media, videoInstance, active);
}
