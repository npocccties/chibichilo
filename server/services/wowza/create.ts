import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import wowzaUpload from "$server/utils/topic/wowzaUpload";
import { API_BASE_PATH } from "$server/utils/env";

export const createSchema = {
  summary: "Wowza Streaming Engine へのアップロードするためのエンドポイント",
  description: outdent`
      動画ファイルを与えてアップロードします。
      教員または管理者でなければなりません。`,
  consumes: ["multipart/form-data"],
  response: {
    201: {
      type: "object",
      properties: {
        url: {
          title: "アップロードされた動画URL",
          type: "string",
        },
      },
    },
    400: {},
  },
};

export const createHooks = {
  auth: [authUser, authInstructor],
};

export default async function create(req: FastifyRequest) {
  const data = await req.file();
  if (!data) return { status: 400 };
  const url = await wowzaUpload(
    req.session.user.ltiConsumerId,
    req.session.user.id,
    data.filename,
    data.file,
    `${req.protocol}://${req.hostname}${API_BASE_PATH}/wowza`
  );
  return { status: 201, body: { url } };
}
