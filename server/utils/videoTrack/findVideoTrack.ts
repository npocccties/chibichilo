import type { Resource, Track } from "@prisma/client";
import prisma from "$server/utils/prisma";

async function findVideoTrack(
  resourceId: Resource["id"],
  videoTrackId: Track["id"]
): Promise<undefined | string> {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { videoId: true },
  });

  if (!resource) return;
  if (resource.videoId == null) return;

  const videoTrack = await prisma.track.findUnique({
    where: { id: videoTrackId },
    select: { content: true },
  });

  return videoTrack?.content;
}

export default findVideoTrack;
