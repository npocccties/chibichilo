import { FastifyInstance } from "fastify";
import handler from "$server/utils/handler";
import { ltiLaunchService } from "$server/services/ltiLaunch";
import * as ltiResourceLinkService from "$server/services/ltiResourceLink";

export async function launch(fastify: FastifyInstance) {
  fastify.post(
    "/lti/launch",
    {
      schema: ltiLaunchService.method.post,
      preValidation: ltiLaunchService.preValidation(),
      preHandler: ltiLaunchService.preHandler(fastify),
    },
    handler(ltiLaunchService.post)
  );
}

export async function resourceLink(fastify: FastifyInstance) {
  const path = "/lti/resource_link/:lti_resource_link_id";
  const { method, show, update, destroy } = ltiResourceLinkService;
  const preHandler = ltiResourceLinkService.preHandler(fastify);

  fastify.get<{
    Params: ltiResourceLinkService.Params;
  }>(path, { schema: method.get, preHandler }, handler(show));

  fastify.put<{
    Params: ltiResourceLinkService.Params;
    Body: ltiResourceLinkService.Props;
  }>(path, { schema: method.put, preHandler }, handler(update));

  fastify.delete<{
    Params: ltiResourceLinkService.Params;
  }>(path, { schema: method.delete, preHandler }, handler(destroy));
}
