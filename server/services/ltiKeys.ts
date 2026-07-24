import { outdent } from "outdent";
import { createPublicKey } from "$server/utils/ltiv1p3/jwk";

export const method = {
  get: {
    summary: "LTI JWKS エンドポイント",
    description: outdent`
      クライアント認証用の公開鍵を取得するためのエンドポイントです。
      このエンドポイントをLTIツールのJWKSエンドポイントとして指定して利用します。`,
    response: {
      200: {
        type: "object",
        properties: {
          keys: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      },
      404: {},
    },
  },
};

export const hooks = {
  get: { auth: [] },
};

export async function index() {
  const publicKey = await createPublicKey();
  if (!publicKey) return { status: 404 };

  return {
    status: 200,
    body: { keys: [publicKey] },
  };
}
