import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/activityRewatchRate";

const basePath = "/activityRewatchRate";
const pathWithParams = `${basePath}`;

export async function activityRewatchRate(fastify: FastifyInstance) {
  const { method, index } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{ Querystring: service.Query }>(
    pathWithParams,
    { schema: method.get, ...hooks.get },
    handler(index)
  );
}
