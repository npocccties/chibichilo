import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as ltiLaunchService from "$server/services/ltiLaunch";
import * as ltiLoginService from "$server/services/ltiLogin";
import * as ltiCallbackService from "$server/services/ltiCallback";
import * as ltiResourceLinkService from "$server/services/ltiResourceLink";
import * as ltiKeys from "$server/services/ltiKeys";
import * as ltiClients from "$server/services/ltiClients";
import * as ltiContexts from "$server/services/ltiContexts";
import * as linkSearch from "$server/services/linkSearch";
import * as ltiMembersService from "$server/services/ltiMembers";
import * as ltiDeepLinkingService from "$server/services/ltiDeepLinking";

export async function launch(fastify: FastifyInstance) {
  const path = "/lti/launch";
  const { method, post } = ltiLaunchService;
  const hooks = makeHooks(fastify, ltiLaunchService.hooks);

  fastify.post<{
    Body: ltiLaunchService.Props;
  }>(path, { schema: method.post, ...hooks.post }, handler(post));
}

export async function login(fastify: FastifyInstance) {
  const path = "/lti/login";
  const { method, get, post } = ltiLoginService;

  fastify.get<{
    Querystring: ltiLoginService.Props;
  }>(path, { schema: method.get }, handler(get));

  fastify.post<{
    Body: ltiLoginService.Props;
  }>(path, { schema: method.post }, handler(post));
}

export async function callback(fastify: FastifyInstance) {
  const path = "/lti/callback";
  const { method, post } = ltiCallbackService;

  fastify.post<{
    Body: ltiCallbackService.Props;
  }>(path, { schema: method.post }, handler(post));
}

export async function resourceLink(fastify: FastifyInstance) {
  const path = "/lti/:lti_consumer_id/resource_link/:lti_resource_link_id";
  const { method, show, update, destroy } = ltiResourceLinkService;
  const hooks = makeHooks(fastify, ltiResourceLinkService.hooks);

  fastify.get<{
    Params: ltiResourceLinkService.Params;
  }>(path, { schema: method.get, ...hooks.get }, handler(show));

  fastify.put<{
    Params: ltiResourceLinkService.Params;
    Body: ltiResourceLinkService.Props;
  }>(path, { schema: method.put, ...hooks.put }, handler(update));

  fastify.delete<{
    Params: ltiResourceLinkService.Params;
  }>(path, { schema: method.delete, ...hooks.delete }, handler(destroy));
}

export async function keys(fastify: FastifyInstance) {
  const path = "/lti/keys";
  const { method, index } = ltiKeys;
  const hooks = makeHooks(fastify, ltiKeys.hooks);

  fastify.get(path, { schema: method.get, ...hooks.get }, handler(index));
}

export async function clients(fastify: FastifyInstance) {
  const path = "/lti/clients";
  const { method, index } = ltiClients;
  const hooks = makeHooks(fastify, ltiClients.hooks);

  fastify.get(path, { schema: method.get, ...hooks.get }, handler(index));
}

export async function contexts(fastify: FastifyInstance) {
  const path = "/lti/contexts";
  const { method, index } = ltiContexts;
  const hooks = makeHooks(fastify, ltiContexts.hooks);

  fastify.get(path, { schema: method.get, ...hooks.get }, handler(index));
}

export async function ltiSearch(fastify: FastifyInstance) {
  const path = "/lti/search";
  const { method, index } = linkSearch;
  const hooks = makeHooks(fastify, linkSearch.hooks);

  fastify.get<{
    Querystring: linkSearch.Query;
  }>(path, { schema: method.get, ...hooks.get }, handler(index));
}

export async function ltiMembers(fastify: FastifyInstance) {
  const path = "/lti/members";
  const { method, update, show } = ltiMembersService;
  const hooks = makeHooks(fastify, ltiMembersService.hooks);

  fastify.get(path, { schema: method.get, ...hooks.get }, handler(show));

  fastify.put<{
    Body: ltiMembersService.Body;
  }>(path, { schema: method.put, ...hooks.put }, handler(update));
}

export async function ltiDeepLinking(fastify: FastifyInstance) {
  const path = "/lti/deep_linking";
  const { method, index } = ltiDeepLinkingService;
  const hooks = makeHooks(fastify, ltiMembersService.hooks);

  fastify.get<{
    Querystring: ltiDeepLinkingService.Query;
  }>(path, { schema: method.get, ...hooks.get }, handler(index));
}
