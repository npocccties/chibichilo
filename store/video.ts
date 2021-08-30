import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { RESET, atomWithReset, useUpdateAtom } from "jotai/utils";
import type { ResourceSchema } from "$server/models/resource";
import type { VideoResourceSchema } from "$server/models/videoResource";
import type { SectionSchema } from "$server/models/book/section";
import type { VideoInstance } from "$types/videoInstance";
import { isVideoResource } from "$utils/videoResource";
import getVideoInstance from "$utils/video/getVideoInstance";

const videoAtom = atomWithReset<{
  video: Map<ResourceSchema["url"], VideoInstance>;
}>({
  video: new Map(),
});

const updateVideoAtom = atom(
  null,
  (get, set, sections: Pick<SectionSchema, "topics">[]) => {
    const { video } = get(videoAtom);
    const resources = sections.flatMap(({ topics }) =>
      topics.map(({ resource }) => resource)
    );
    Promise.all(
      resources
        .filter((resource): resource is VideoResourceSchema =>
          isVideoResource(resource)
        )
        .map(async (resource) => {
          video.set(resource.url, await getVideoInstance(resource));
        })
    );
    set(videoAtom, { video });
  }
);

export function useVideoAtom() {
  const [state, reset] = useAtom(videoAtom);
  const updateVideo = useUpdateAtom(updateVideoAtom);
  useEffect(
    () => () => {
      reset(RESET);
    },
    [reset]
  );
  return { ...state, updateVideo };
}
