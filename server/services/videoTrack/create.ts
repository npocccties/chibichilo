import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import type { VideoTrackProps } from "$server/models/videoTrack";
import {
  videoTrackPropsSchema,
  videoTrackSchema,
} from "$server/models/videoTrack";
import { ResourceParams } from "$server/validators/resourceParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import createVideoTrack from "$server/utils/videoTrack/createVideoTrack";

export type CreateBody = VideoTrackProps;

export const createSchema: FastifySchema = {
  summary: "字幕のアップロード",
  description: outdent`
    字幕をアップロードします。
    教員または管理者でなければなりません。`,
  params: ResourceParams,
  body: videoTrackPropsSchema,
  response: {
    201: videoTrackSchema,
    400: {},
  },
};

export const createHooks = {
  auth: [authUser, authInstructor],
};

export async function create(
  req: FastifyRequest<{
    Params: ResourceParams;
    Body: CreateBody;
  }>
) {
  const url = `${req.protocol}://${req.hostname}${req.url}`;
  const created = await createVideoTrack(url, req.params.resource_id, req.body);

  return {
    status: created == null ? 400 : 201,
    body: created,
  };
}
