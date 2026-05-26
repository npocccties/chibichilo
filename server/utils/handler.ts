import type {
  FastifyRequest,
  FastifyReply,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
  RawReplyDefaultExpression,
} from "fastify";
import type { RouteGenericInterface } from "fastify/types/route";
import type Controller from "$server/types/controller";
import { importLog, isImportApiRoute } from "$server/utils/book/importLog";

const handler =
  <
    K extends keyof Controller,
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends
      RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends
      RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
  >(
    method: Required<Controller<RouteGeneric, RawServer, RawRequest>>[K]
  ) =>
  async (
    request: FastifyRequest<RouteGeneric, RawServer, RawRequest>,
    reply: FastifyReply<RawServer, RawRequest, RawReply>
  ) => {
    const route = `${request.method} ${request.url}`;
    const isImport = isImportApiRoute(request.method, request.url);
    if (isImport) {
      importLog("handler:request", {
        route,
        nodeVersion: process.version,
      });
    }
    const { status, headers, body } = await method(request);
    if (isImport) {
      importLog("handler:reply", { route, status });
    }
    if (headers != null) void reply.headers(headers);
    void reply.code(status);
    return body;
  };

export default handler;
