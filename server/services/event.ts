import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type Method from "$server/types/method";
import { Event, eventSchema } from "$server/models/event";
import eventLogger from "$server/utils/eventLogger";

export const method: Method = {
  post: {
    summary: "ビデオプレイヤーのイベント情報を記録 (v1互換)",
    description: outdent`
      ビデオプレイヤーのイベント情報を記録します。
      利用は推奨しません。
      以前のバージョンv1の構造を踏襲してますが、今後変更される可能性があります。`,
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
