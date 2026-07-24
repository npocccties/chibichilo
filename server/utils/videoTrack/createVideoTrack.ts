import type { Resource } from "@prisma/client";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import prisma from "$server/utils/prisma";
import { getVttAccessToken } from "$server/utils/topicResourceToken";

async function createVideoTrack(
  createRequestUrl: string,
  resourceId: Resource["id"],
  { content, ...props }: VideoTrackProps
): Promise<undefined | VideoTrackSchema> {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { videoId: true },
  });

  if (!resource) return;
  if (resource.videoId == null) return;

  const contentText =
    typeof content === "string" ? content : await content.text();

  const created = await prisma.track.create({
    data: {
      ...props,
      content: contentText,
      video: { connect: { id: resource.videoId } },
    },
    select: { id: true, kind: true, language: true },
  });

  return {
    ...created,
    url: `${createRequestUrl}/${created.id}/vtt`,
    accessToken: getVttAccessToken(resourceId, created.id),
  };
}

export default createVideoTrack;
