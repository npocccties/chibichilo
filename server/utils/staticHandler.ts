import type { FastifyRequest, FastifyReply } from "fastify";
import serveHandler from "serve-handler";

/**
 * Fastify 用 serve-handler
 * https://github.com/vercel/serve-handler#readme
 * @param options https://github.com/vercel/serve-handler#options
 */
const staticHandler = (options: Parameters<typeof serveHandler>[2]) => (
  req: FastifyRequest,
  reply: FastifyReply
) => serveHandler(req.raw, reply.raw, options);

export default staticHandler;
