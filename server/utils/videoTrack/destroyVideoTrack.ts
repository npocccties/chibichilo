import type { Track } from "@prisma/client";
import prisma from "$server/utils/prisma";

async function destroyVideoTrack(id: Track["id"]) {
  try {
    await prisma.track.deleteMany({ where: { id } });
  } catch {
    return;
  }
}

export default destroyVideoTrack;
