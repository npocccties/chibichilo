import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { validateOrReject } from "class-validator";
import { upsertUser } from "$server/utils/user";
import Method from "$server/types/method";
import prisma from "$server/utils/prisma";
import {
  FRONTEND_ORIGIN,
  FRONTEND_PATH,
  OAUTH_CONSUMER_KEY,
  OAUTH_CONSUMER_SECRET,
} from "$server/utils/env";
import { auth, valid } from "$server/utils/ltiv1p1/oauth";
import {
  LtiLaunchBody,
  ltiLaunchBodySchema,
} from "$server/validators/ltiLaunchBody";
import { findLtiResourceLink } from "$server/utils/ltiResourceLink";

const frontendUrl = `${FRONTEND_ORIGIN}${FRONTEND_PATH}`;

const method: Method = {
  post: {
    description: "LTI ツールとして指定するエンドポイント",
    consumes: ["application/x-www-form-urlencoded"],
    body: ltiLaunchBodySchema,
    response: {
      302: {
        description:
          "成功時 `${FRONTEND_ORIGIN}${FRONTEND_PATH}` にリダイレクト",
        type: "null",
      },
    },
  },
};

async function post({ session }: FastifyRequest) {
  const { ltiLaunchBody } = session;
  if (ltiLaunchBody != null) {
    const ltiResourceLink = await findLtiResourceLink(
      ltiLaunchBody.resource_link_id
    );

    const user = await upsertUser({
      ltiUserId: ltiLaunchBody.user_id,
      name: ltiLaunchBody.lis_person_name_full ?? "",
    });

    Object.assign(session, { ltiResourceLink, user });
  }

  return {
    status: 302,
    headers: {
      location: frontendUrl,
    },
  };
}

function preValidation() {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const params = Object.assign(new LtiLaunchBody(), req.body);
    try {
      if (
        req.method !== "POST" ||
        !valid((params as unknown) as Record<string, unknown>)
      )
        throw new Error("invalid");

      await validateOrReject(params);
    } catch {
      await reply.code(400).send();
    }
  };
}

function preHandler(fastify: FastifyInstance) {
  return fastify.auth([
    async (req) => {
      const body = req.body as LtiLaunchBody;
      const url = `${req.protocol}://${req.hostname}${req.url}`;
      const authorized = await auth(
        url,
        (body as unknown) as Record<string, string>,
        OAUTH_CONSUMER_KEY,
        OAUTH_CONSUMER_SECRET,
        lookupNonce
      );

      if (!authorized) throw new Error("unauthorized");

      req.session.ltiLaunchBody = body;
    },
  ]);
}

export const ltiLaunchService = {
  method,
  post,
  preValidation,
  preHandler,
};

async function lookupNonce(nonce: string, timestamp: number) {
  const count = await prisma.account.count({
    where: { nonce, timestamp },
  });

  if (count === 0) {
    await prisma.account.create({
      data: {
        nonce,
        timestamp,
      },
    });
  }

  return count > 0;
}
