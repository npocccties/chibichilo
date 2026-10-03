import { atom, useAtomValue, useSetAtom } from "jotai";
import type { SectionSchema } from "$server/models/book/section";
import type { VideoInstance } from "$types/videoInstance";
import { isVideoResource } from "$utils/videoResource";
import getVideoInstance from "$utils/video/getVideoInstance";
import { pauseOtherVideos } from "$utils/video/pauseOthers";

/** 動画プレイヤーオブジェクトプール (トピックID(10進数文字列)または動画URLをキーとして使用) */
const videoAtom = atom<{
  video: Map<string, VideoInstance>;
}>({
  video: new Map(),
});

function createVideoPool(
  sections: Pick<SectionSchema, "topics">[],
  current: Map<string, VideoInstance>
): { video: Map<string, VideoInstance>; changed: boolean } {
  const video = new Map(current);
  let added = 0;
  let removed = 0;
  for (const topic of sections.flatMap(({ topics }) => topics)) {
    if (!isVideoResource(topic.resource)) {
      if (video.has(String(topic.id))) removed += 1;
      video.delete(String(topic.id));
      continue;
    }
    if (!video.has(String(topic.id))) {
      video.set(String(topic.id), getVideoInstance(topic.resource));
      added += 1;
    }
  }
  return { video, changed: added > 0 || removed > 0 };
}

const preloadVideoAtom = atom(
  null,
  (get, set, sections: Pick<SectionSchema, "topics">[]) => {
    const current = get(videoAtom).video;
    const { video, changed } = createVideoPool(sections, current);
    if (!changed) return;
    set(videoAtom, { video });
  }
);

/** 現在トピック以外の再生を破棄する（トピック切替コマンドから呼ぶ） */
const pauseOthersAtom = atom(null, (get, _set, currentId: string) => {
  pauseOtherVideos(get(videoAtom).video, currentId);
});

export function useVideoAtom() {
  const state = useAtomValue(videoAtom);
  const preloadVideo = useSetAtom(preloadVideoAtom);
  return { ...state, preloadVideo };
}

/** @internal book store の切替コマンドから利用 */
export { preloadVideoAtom, pauseOthersAtom };
