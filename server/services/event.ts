import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type Method from "$server/types/method";
import { EventSchema, EventActivitySchema } from "$server/models/event";
import eventLogger from "$server/utils/eventLogger";

const EventParams = {
  type: "object",
  properties: {
    ...EventSchema.properties,
    ...EventActivitySchema.properties,
  },
  additionalProperties: false,
};

export const method: Method = {
  post: {
    summary: "ビデオプレイヤーのイベント情報を記録 (v1互換)",
    description: outdent`
      ビデオプレイヤーのイベント情報を記録します。
      利用は推奨しません。
      以前のバージョンv1の構造を踏襲してますが、今後変更される可能性があります。`,
    body: EventParams,
    response: {
      204: { type: "null", description: "成功" },
    },
  },
};

export const hooks = {
  post: { auth: [] },
};

export async function create({
  ip,
  headers,
  body,
}: FastifyRequest<{ Body: EventSchema & EventActivitySchema }>) {
  eventLogger({ ip, ua: headers["user-agent"], ...body });
  return { status: 204 };
}
