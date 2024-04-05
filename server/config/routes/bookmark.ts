import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/bookmark";

const basePath = "/bookmark";
const pathWithParams = `${basePath}/:id`;

export async function bookmark(fastify: FastifyInstance) {
  const { method, create, destroy } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.post<{
    Body: service.Props;
  }>(basePath, { schema: method.post, ...hooks.post }, handler(create));

  fastify.delete<{
    Params: service.Params;
  }>(
    pathWithParams,
    { schema: method.delete, ...hooks.delete },
    handler(destroy)
  );
}
