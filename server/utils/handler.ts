import type { FastifyRequest, FastifyReply } from "fastify";
import type { RouteGenericInterface } from "fastify/types/route";
import type { ControllerMethod } from "$server/types/controller";

const handler =
  <RouteGeneric extends RouteGenericInterface = RouteGenericInterface>(
    method: ControllerMethod<RouteGeneric>
  ) =>
  async (request: FastifyRequest<RouteGeneric>, reply: FastifyReply) => {
    const { status, headers, body } = await method(request);
    if (headers != null) void reply.headers(headers);
    void reply.code(status);
    return body;
  };

export default handler;
