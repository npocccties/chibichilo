import type { FastifyRequest, HTTPMethods } from "fastify";
import type { RouteGenericInterface } from "fastify/types/route";

export type ControllerMethod<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
> = (req: FastifyRequest<RouteGeneric>) => Promise<{
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}>;

type Controller<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
> = {
  [K in Lowercase<HTTPMethods>]?: ControllerMethod<RouteGeneric>;
};

export default Controller;
