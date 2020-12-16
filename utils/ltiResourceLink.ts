import useSWR, { mutate } from "swr";
import { api } from "./api";
import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

const key = "/api/v2/lti/resource_link/{lti_resource_link_id}";

async function fetchLtiResourceLink(
  _: typeof key,
  id: LtiResourceLinkSchema["id"]
) {
  const res = await api.apiV2LtiResourceLinkLtiResourceLinkIdGet({
    ltiResourceLinkId: id,
  });
  return res as LtiResourceLinkSchema;
}

export function useLtiResourceLink(id: LtiResourceLinkSchema["id"]) {
  return useSWR<LtiResourceLinkSchema>([key, id], fetchLtiResourceLink);
}

export async function updateLtiResourceLink({
  id,
  ...body
}: LtiResourceLinkSchema) {
  const res = await api.apiV2LtiResourceLinkLtiResourceLinkIdPut({
    ltiResourceLinkId: id,
    body,
  });
  await mutate([key, id], res);
}

export async function destroyLtiResourceLink(id: LtiResourceLinkSchema["id"]) {
  await api.apiV2LtiResourceLinkLtiResourceLinkIdDelete({
    ltiResourceLinkId: id,
  });
  await mutate([key, id], undefined);
}
