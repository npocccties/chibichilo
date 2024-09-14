import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/topic";
import * as activityService from "$server/services/topic/activity";
import * as authorsService from "$server/services/topic/authors";
import * as importService from "$server/services/topicImport";
import * as releaseService from "$server/services/topic/release";

const basePath = "/topic";
const pathWithParams = `${basePath}/:topic_id`;

export async function topic(fastify: FastifyInstance) {
  const { method, show, create, update, destroy } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{
    Params: service.Params;
  }>(pathWithParams, { schema: method.get, ...hooks.get }, handler(show));

  fastify.post<{
    Body: service.Props;
  }>(basePath, { schema: method.post, ...hooks.post }, handler(create));

  fastify.put<{
    Params: service.Params;
    Body: service.Props;
  }>(pathWithParams, { schema: method.put, ...hooks.put }, handler(update));

  fastify.delete<{
    Params: service.Params;
  }>(
    pathWithParams,
    { schema: method.delete, ...hooks.delete },
    handler(destroy)
  );
}

export async function topicActivity(fastify: FastifyInstance) {
  const path = `${pathWithParams}/activity`;
  const { method, update } = activityService;
  const hooks = makeHooks(fastify, activityService.hooks);

  fastify.put<{
    Params: activityService.Params;
    Querystring: activityService.Query;
    Body: activityService.Props;
  }>(path, { schema: method.put, ...hooks.put }, handler(update));
}

export async function topicAuthors(fastify: FastifyInstance) {
  const path = `${pathWithParams}/authors`;
  const { method, update } = authorsService;
  const hooks = makeHooks(fastify, authorsService.hooks);

  fastify.put<{
    Params: authorsService.Params;
    Body: authorsService.Props;
  }>(path, { schema: method.put, ...hooks.put }, handler(update));
}

export async function topicImport(fastify: FastifyInstance) {
  const path = `${pathWithParams}/import`;
  const { importSchema, importHooks, importTopic } = importService;
  const hooks = makeHooks(fastify, importHooks);

  fastify.post<{
    Params: service.Params;
    Body: importService.Params;
  }>(path, { schema: importSchema, ...hooks.post }, handler(importTopic));
}

export async function topicRelease(fastify: FastifyInstance) {
  const path = `${pathWithParams}/release`;
  const { method, show } = releaseService;
  const hooks = makeHooks(fastify, releaseService.hooks);

  fastify.get<{
    Params: releaseService.Params;
  }>(path, { schema: method.get, ...hooks.get }, handler(show));
}
