import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authInstructor from "$server/auth/authInstructor";
import authUser from "$server/auth/authUser";
import { isAdministrator } from "$server/utils/session";
import prisma from "$server/utils/prisma";
import createLinkScope from "$server/utils/linkSearch/createLinkScope";
import { LtiContextSchema } from "$server/models/ltiContext";

export const method = {
  get: {
    summary: "LTIコンテキスト一覧",
    description: outdent`
      LTIコンテキストの一覧を取得します。
      教員または管理者でなければなりません。`,
    response: {
      200: {
        type: "object",
        properties: {
          ltiContexts: {
            type: "array",
            items: LtiContextSchema,
          },
        },
      },
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index({ session }: FastifyRequest) {
  const filter = {
    type: "all" as const,
    by: session.user.id,
    admin: isAdministrator(session),
  };
  const ltiContexts = await prisma.ltiContext.findMany({
    where: {
      resourceLinks: {
        every: createLinkScope(filter, {
          oauthClientId: session.oauthClient.id,
          ltiContextId: session.ltiContext.id,
        }),
      },
    },
  });

  return {
    status: 200,
    body: { ltiContexts },
  };
}
