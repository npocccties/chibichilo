import { FastifyRequest } from "fastify";
import Method from "$server/types/method";
import { sessionSchema } from "$server/models/session";

export const method: Method = {
  get: {
    summary: "セッション情報",
    description: "自身に関する詳細な情報を取得します。",
    response: {
      200: sessionSchema,
    },
  },
};

export default {
  async get({ session }: FastifyRequest) {
    const { ltiLaunchBody, ltiResourceLink, user } = session;

    return {
      status: 200,
      body: {
        ltiLaunchBody,
        ltiResourceLink,
        user,
      },
    };
  },
};
