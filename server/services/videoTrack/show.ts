import { FastifySchema } from "fastify";
import {
  VideoTrackParams,
  videoTrackParamsSchema,
} from "$server/validators/videoTrackParams";
import findVideoTrack from "$server/utils/videoTrack/findVideoTrack";

export const showSchema: FastifySchema = {
  summary: "字幕の取得",
  description: "字幕を取得します。",
  params: videoTrackParamsSchema,
  // @ts-expect-error NOTE: fastify-swagger用。型が用意されていない。
  produces: ["text/vtt"],
  response: {
    200: {},
    404: {},
  },
};

export async function show({ params }: { params: VideoTrackParams }) {
  const videoTrack = await findVideoTrack(
    params.resource_id,
    params.video_track_id
  );

  return {
    status: videoTrack == null ? 404 : 200,
    headers: videoTrack == null ? undefined : { "Content-Type": "text/vtt" },
    body: videoTrack,
  };
}
