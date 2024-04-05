import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/bookmarkTagMenu";

export async function bookmarkTagMenu(fastify: FastifyInstance) {
  const { method, index } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{ Querystring: service.Query }>(
    "/bookmarkTagMenu",
    { schema: method.get, ...hooks.get },
    handler(index)
  );
}
