import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/ltiMember";

const basePath = "/ltiMember";

export async function ltiMember(fastify: FastifyInstance) {
  const { method, update } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.put<{
    Body: service.Body;
  }>(basePath, { schema: method.put, ...hooks.put }, handler(update));
}
