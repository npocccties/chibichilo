import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authInstructor from "$server/auth/authInstructor";
import authUser from "$server/auth/authUser";
import { isAdministrator } from "$server/utils/session";
import prisma from "$server/utils/prisma";
import createLinkScope from "$server/utils/linkSearch/createLinkScope";

export const method = {
  get: {
    summary: "LMS一覧",
    description: outdent`
      LMSの一覧を取得します。
      教員または管理者でなければなりません。`,
    response: {
      200: {
        type: "object",
        properties: {
          oauthClients: {
            type: "array",
            item: { type: "string" },
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
  const clients = await prisma.ltiConsumer.findMany({
    where: {
      ltiResourceLinks: {
        some: createLinkScope(filter, {
          oauthClientId: session.oauthClient.id,
          ltiContextId: session.ltiContext.id,
        }),
      },
    },
  });
  const oauthClients = clients.flatMap(({ id }) => (id === "" ? [] : [id]));

  return {
    status: 200,
    body: { oauthClients },
  };
}
