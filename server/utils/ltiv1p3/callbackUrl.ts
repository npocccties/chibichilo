import type { FastifyRequest } from "fastify";
import { API_BASE_PATH } from "$server/utils/env";

/** LTI v1.3 の redirect_uri（trustProxy 考慮、ポートを含む） */
export function ltiCallbackUrl(req: FastifyRequest): string {
  const host = req.host || req.headers.host || req.hostname;
  return `${req.protocol}://${host}${API_BASE_PATH}/lti/callback`;
}
