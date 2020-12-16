import useSWR, { mutate } from "swr";
import { api } from "./api";
import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

const key = "/api/v2/lti/resource_link/{lti_resource_link_id}";

async function fetchLtiResourceLink(
  _: typeof key,
  ltiResourceLinkId: LtiResourceLinkSchema["id"]
) {
  const res = await api.apiV2LtiResourceLinkLtiResourceLinkIdGet({
    ltiResourceLinkId,
  });
  return res as LtiResourceLinkSchema;
}

export function useLtiResourceLink(
  ltiResourceLinkId: LtiResourceLinkSchema["id"]
) {
  return useSWR<LtiResourceLinkSchema>(
    [key, ltiResourceLinkId],
    fetchLtiResourceLink
  );
}

export async function updateLtiResourceLink(body: LtiResourceLinkSchema) {
  const res = await api.apiV2LtiResourceLinkLtiResourceLinkIdPut({
    ltiResourceLinkId: body.id,
    body,
  });
  await mutate([key, body.id], res);
}

export async function destroyLtiResourceLink(
  ltiResourceLinkId: LtiResourceLinkSchema["id"]
) {
  await api.apiV2LtiResourceLinkLtiResourceLinkIdDelete({
    ltiResourceLinkId,
  });
  await mutate([key, ltiResourceLinkId], undefined);
}
