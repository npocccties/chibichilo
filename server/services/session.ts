import type { FastifyRequest } from "fastify";
import type Method from "$server/types/method";
import { type SessionSchema, sessionSchema } from "$server/models/session";
import { getSystemSettings } from "$server/utils/systemSettings";

export const method: Method = {
  get: {
    summary: "セッション情報",
    description: "自身に関する詳細な情報を取得します。",
    response: {
      200: sessionSchema,
    },
  },
};

export const hooks = {
  get: { auth: [] },
};

const nullSession: SessionSchema = {
  oauthClient: {
    id: "",
    nonce: "",
  },
  ltiMessageType: "LtiResourceLinkRequest",
  ltiVersion: "1.3.0",
  ltiDeploymentId: "",
  ltiUser: {
    id: "",
    name: "",
    email: "",
  },
  ltiRoles: [],
  ltiResourceLinkRequest: { id: "", title: "" },
  ltiContext: { id: "", label: "", title: "" },
  ltiResourceLink: null,
  user: {
    id: 0,
    ltiConsumerId: "",
    ltiUserId: "",
    name: "",
    email: "",
    settings: {},
  },
  systemSettings: getSystemSettings(),
};
Object.freeze(nullSession);

export async function show({ session }: FastifyRequest) {
  return {
    status: 200,
    body: { ...nullSession, ...session },
  };
}
