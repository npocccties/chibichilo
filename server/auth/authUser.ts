import type { FastifyRequest } from "fastify";

const isDev = process.env.NODE_ENV !== "production";

async function authUser(req: FastifyRequest) {
  if (isDev) return; // NOTE: 開発環境ではクレデンシャルを持たないリクエストを許容
  if (!req.session.user) throw new Error("user authorization required");
}

export default authUser;
