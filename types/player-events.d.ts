type PlayerEvent = VideoLocation & {
  /** ビデオの経過時間 (秒) */
  currentTime: number;
};

type PlayerEvents = {
  ended: PlayerEvent;
  pause: PlayerEvent;
  play: PlayerEvent;
  seeked: PlayerEvent;
  seeking: PlayerEvent;
  timeupdate: PlayerEvent;
  playbackratechange: PlayerEvent & { playbackRate: number };
  texttrackchange: PlayerEvent & { language?: string };
  /** @deprecated */
  firstplay: PlayerEvent;
};
