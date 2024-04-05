import type { FastifyInstance } from "fastify";
import type { EventSchema } from "$server/models/event";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/event";

export default async function (fastify: FastifyInstance) {
  const { method, create } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.post<{ Body: EventSchema }>(
    "/event",
    { schema: method.post, ...hooks.post },
    handler(create)
  );
}
