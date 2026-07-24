import type { FastifySchema } from "fastify";
import { outdent } from "outdent";
import { VideoTrackParams } from "$server/validators/videoTrackParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import destroyVideoTrack from "$server/utils/videoTrack/destroyVideoTrack";

export const destroySchema: FastifySchema = {
  summary: "字幕の削除",
  description: outdent`
    字幕を削除します。
    教員または管理者でなければなりません。`,
  params: VideoTrackParams,
  response: {
    204: { type: "null", description: "成功" },
  },
};

export const destroyHooks = {
  auth: [authUser, authInstructor],
};

export async function destroy({ params }: { params: VideoTrackParams }) {
  await destroyVideoTrack(params.video_track_id);

  return { status: 204 };
}
