import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/bookmarkMemoContent";

const basePath = "/bookmarkMemoContent";

const pathWithParams = `${basePath}/:id`;

export async function bookmarkMemoContent(fastify: FastifyInstance) {
  const { method, create, update } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.post<{
    Body: service.Props;
  }>(basePath, { schema: method.post, ...hooks.post }, handler(create));

  fastify.put<{
    Params: service.Params;
    Body: service.Props;
  }>(pathWithParams, { schema: method.put, ...hooks.put }, handler(update));
}
