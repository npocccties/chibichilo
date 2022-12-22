import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/ltiMembership";

export async function ltiMembership(fastify: FastifyInstance) {
  const path = "/ltiMembership";
  const { method, index } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get(path, { schema: method.get, ...hooks.get }, handler(index));
}
