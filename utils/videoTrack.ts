import type { Resource, Track } from "@prisma/client";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import { api } from "./api";

export async function uploadVideoTrack(
  resourceId: Resource["id"],
  { content, ...props }: VideoTrackProps
) {
  const contentText =
    typeof content === "string" ? content : await content.text();

  const uploaded = await api.apiV2ResourceResourceIdVideoTrackPost({
    resourceId,
    body: {
      ...props,
      content: contentText,
    },
  });

  return uploaded as VideoTrackSchema;
}

export async function destroyVideoTrack(
  resourceId: Resource["id"],
  videoTrackId: Track["id"]
) {
  await api.apiV2ResourceResourceIdVideoTrackVideoTrackIdDelete({
    resourceId,
    videoTrackId,
  });
}
