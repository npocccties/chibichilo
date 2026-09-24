import { atom, useAtomValue, useSetAtom } from "jotai";
import type { SectionSchema } from "$server/models/book/section";
import type { VideoInstance } from "$types/videoInstance";
import { isVideoResource } from "$utils/videoResource";
import getVideoInstance from "$utils/video/getVideoInstance";

/** 動画プレイヤーオブジェクトプール (トピックID(10進数文字列)または動画URLをキーとして使用) */
const videoAtom = atom<{
  video: Map<string, VideoInstance>;
}>({
  video: new Map(),
});

const preloadVideoAtom = atom(
  null,
  (get, set, sections: Pick<SectionSchema, "topics">[]) => {
    const current = get(videoAtom).video;
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
    if (added === 0 && removed === 0) return;
    set(videoAtom, { video });
  }
);

export function useVideoAtom() {
  const state = useAtomValue(videoAtom);
  const preloadVideo = useSetAtom(preloadVideoAtom);
  return { ...state, preloadVideo };
}
