import type {
  FastifyRequest,
  HTTPMethods,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
} from "fastify";
import type { RouteGenericInterface } from "fastify/types/route";

type Controller<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends
    RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
> = {
  [K in Lowercase<HTTPMethods>]?: (
    req: FastifyRequest<RouteGeneric, RawServer, RawRequest>
  ) => Promise<{
    status: number;
    body?: unknown;
    headers?: Record<string, string>;
  }>;
};

export default Controller;
