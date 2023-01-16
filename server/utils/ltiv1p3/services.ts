import type { Client } from "openid-client";
import prisma from "$server/utils/prisma";
import type { LtiNrpsContextMembershipSchema } from "$server/models/ltiNrpsContextMembership";
import { createAccessToken } from "./accessToken";

const successCode = [200, 201, 202, 204];
const authFailureCode = [401];

/**
 * LTI-NRPS 2.0 受講者の取得
 * https://www.imsglobal.org/spec/lti-nrps/v2p0
 * @param client OpenID Connect Client
 * @param contextMembershipsUrl LTI claim に含まれる context_memberships_url
 * @param retry リトライを行うか否か (デフォルト: true 行う)
 */
export async function getMemberships(
  client: Client,
  contextMembershipsUrl?: string,
  retry = true
): Promise<LtiNrpsContextMembershipSchema> {
  const clientId = client.metadata.client_id;
  if (!contextMembershipsUrl) {
    throw new Error(`Failed to get contextMembershipsUrl`);
  }

  const { accessToken } = await createAccessToken(client);

  const res = await client.requestResource(contextMembershipsUrl, accessToken);

  const statusCode = Number(res.statusCode);

  if (authFailureCode.includes(statusCode)) {
    await prisma.ltiConsumer.update({
      where: { id: clientId },
      data: { accessToken: "" },
    });

    if (retry) {
      return await getMemberships(client, contextMembershipsUrl, false);
    }
  }

  if (!successCode.includes(statusCode)) {
    throw new Error(`${res.statusCode} ${res.statusMessage}`);
  }

  if (!res.body) {
    throw new Error("Failed to request memberships resource");
  }

  const memberships = JSON.parse(
    res.body.toString()
  ) as LtiNrpsContextMembershipSchema;

  // 教師を除く、学習者のみのデータを返す
  const learnerMemberships = {
    ...memberships,
    members: memberships.members.filter(
      (member) => !member.roles.includes("Instructor")
    ),
  };
  return learnerMemberships;
}
