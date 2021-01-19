import type { FastifyRequest } from "fastify";
import type Method from "$server/types/method";
import { Event, eventSchema } from "$server/models/event";
import eventLogger from "$server/utils/eventLogger";

export const method: Method = {
  post: {
    description: "ビデオプレイヤーのイベント情報を記録 (v1互換)",
    body: eventSchema,
    response: {
      204: { type: "null", description: "成功" },
    },
  },
};

export async function create({
  ip,
  headers,
  body,
}: FastifyRequest<{ Body: Event }>) {
  eventLogger({ ip, ua: headers["user-agent"], ...body });
  return { status: 204 };
}
