import { FastifySchema } from "fastify";
import { outdent } from "outdent";
import {
  VideoTrackParams,
  videoTrackParamsSchema,
} from "$server/validators/videoTrackParams";
import destroyVideoTrack from "$server/utils/videoTrack/destroyVideoTrack";

export const destroySchema: FastifySchema = {
  summary: "字幕の削除",
  description: outdent`
    字幕を削除します。
    教員または管理者でなければなりません。`,
  params: videoTrackParamsSchema,
  response: {
    204: { type: "null", description: "成功" },
  },
};

export async function destroy({ params }: { params: VideoTrackParams }) {
  await destroyVideoTrack(params.video_track_id);

  return { status: 204 };
}
