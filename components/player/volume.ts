import { VideoJsPlayer } from "video.js";
import VimeoPlayer from "@vimeo/player";

type Volume = {
  /** 音量 0-1 */
  volume: number;
  /** ミュート */
  muted: boolean;
};

const Key = "volumePersisterVolume";
const MuteKey = "volumePersisterMute";
const Muted = "true";

function save({ volume, muted }: Volume) {
  localStorage.setItem(Key, volume.toString());
  if (muted) localStorage.setItem(MuteKey, Muted);
  else localStorage.removeItem(MuteKey);
}

function load(): Volume | undefined {
  const volume = localStorage.getItem(Key);
  if (volume == null) return;
  const muted = localStorage.getItem(MuteKey) === Muted;
  return {
    volume: Number(volume),
    muted,
  };
}

async function intoVimeo(player: VimeoPlayer) {
  player.on("volumechange", async function (event: { volume: number }) {
    // @ts-expect-error
    const muted = await (player.getMuted() as Promise<boolean>);
    save({ volume: event.volume, muted });
  });

  const volume = load();
  if (volume == null) return;
  await Promise.all([
    player.setVolume(volume.volume),
    // @ts-expect-error
    player.setMuted(volume.muted),
  ]);
}

function intoVideoJs(player: VideoJsPlayer) {
  player.on("volumechange", function () {
    const volume = player.volume();
    const muted = player.muted();
    save({ volume, muted });
  });

  const volume = load();
  if (volume == null) return;
  player.volume(volume.volume);
  player.muted(volume.muted);
}

export async function volumePersister(player: VideoJsPlayer | VimeoPlayer) {
  if (typeof window === "undefined") return;
  if (player instanceof VimeoPlayer) {
    await intoVimeo(player);
  } else {
    intoVideoJs(player);
  }
}
