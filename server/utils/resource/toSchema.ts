import type { Prisma } from "@prisma/client";
import type { ResourceSchema } from "$server/models/resource";
import {
  getWowzaAccessToken,
  getVttAccessToken,
} from "$server/utils/topicResourceToken";
import { API_BASE_PATH } from "$server/utils/env";

export const resourceWithVideoArg = {
  include: {
    video: {
      include: { tracks: { select: { id: true, kind: true, language: true } } },
    },
  },
} as const;

type ResourceWithVideo = Prisma.ResourceGetPayload<typeof resourceWithVideoArg>;

export function resourceToResourceSchema(
  resource: ResourceWithVideo
): ResourceSchema {
  return {
    accessToken: getWowzaAccessToken(resource.url, resource.video?.providerUrl),
    ...resource.video,
    tracks: resource.video?.tracks.map((track) => ({
      ...track,
      url: `${API_BASE_PATH}/resource/${resource.id}/video_track/${track.id}/vtt`,
      accessToken: getVttAccessToken(resource.id, track.id),
    })),
    ...resource,
  };
}
