import { outdent } from "outdent";
import fetch from "node-fetch";
import { OembedParams } from "$server/validators/oembedParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { OembedSchema } from "$server/models/oembed";
import findResource from "$server/utils/resource/findResource";
import resourceToOEmbedProvider from "server/utils/oembed/resourceToOEmbedProvider";
import resourceToWowzaProvider from "$server/utils/wowza/resourceToWowzaProvider";
import { WOWZA_THUMBNAIL_BASE_URL } from "$server/utils/env";

export type Params = OembedParams;

export const method = {
  get: {
    summary: "リソースの埋め込み情報の取得",
    description: outdent`
      リソースの埋め込み情報を取得します。
      教員または管理者でなければなりません。`,
    params: OembedParams,
    response: {
      200: OembedSchema,
      404: {},
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index({
  params: { resource_id: resourceId },
}: {
  params: Params;
}) {
  const resource = await findResource(resourceId);
  if (!resource) return { status: 404 };
  const provider = resourceToOEmbedProvider(resource);
  // NOTE: providerがundefinedの場合、Wowzaとみなす
  if (!provider && !WOWZA_THUMBNAIL_BASE_URL) {
    return { status: 404 };
  }
  if (!provider) {
    const oembed = resourceToWowzaProvider(resource);
    return { status: 200, body: oembed };
  }
  const params = new URLSearchParams();
  params.append("url", resource.url);
  const response = await fetch(provider + "?" + params.toString());
  if (response.status !== 200) {
    return { status: 404 };
  }
  const oembed = await response.json();

  return {
    status: 200,
    body: oembed,
  };
}
