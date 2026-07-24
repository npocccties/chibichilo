import type { FastifySchema, FastifyRequest } from "fastify";
import { VideoTrackParams } from "$server/validators/videoTrackParams";
import findVideoTrack from "$server/utils/videoTrack/findVideoTrack";
import type { TopicResourceProps } from "$server/validators/topicResourceProps";
import { topicResourcePropsSchema } from "$server/validators/topicResourceProps";
import { checkVttAccessToken } from "$server/utils/topicResourceToken";

export const showSchema: FastifySchema = {
  summary: "字幕の取得",
  description: "字幕を取得します。",
  params: VideoTrackParams,
  querystring: topicResourcePropsSchema,
  produces: ["text/vtt"],
  response: {
    200: {},
    403: {},
    404: {},
  },
};

export const showHooks = {
  auth: [],
};

export async function show({
  params,
  query,
}: FastifyRequest<{
  Params: VideoTrackParams;
  Querystring: TopicResourceProps;
}>) {
  if (
    !checkVttAccessToken(
      query.accessToken,
      params.resource_id,
      params.video_track_id
    )
  )
    return { status: 403 };

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
