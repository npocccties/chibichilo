import { fetchProtectedResource } from "openid-client";
import prisma from "$server/utils/prisma";
import type { LtiNrpsContextMembershipSchema } from "$server/models/ltiNrpsContextMembership";
import { createAccessToken } from "./accessToken";
import { isInstructor } from "./roles";
import type { FastifySessionObject } from "@fastify/session";
import findClient, { type OidcClient } from "./findClient";

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
  client: OidcClient,
  contextMembershipsUrl?: string,
  retry = true,
  query: string = ""
): Promise<LtiNrpsContextMembershipSchema> {
  const clientId = client.clientMetadata().client_id;
  if (!contextMembershipsUrl) {
    throw new Error(`Failed to get contextMembershipsUrl`);
  }

  const url = new URL(contextMembershipsUrl);
  if (query) {
    const params = new URLSearchParams(query);
    params.forEach((value, key) => url.searchParams.set(key, value));
  }

  const { accessToken } = await createAccessToken(client);

  const res = await fetchProtectedResource(client, accessToken, url, "GET");

  const statusCode = res.status;

  if (authFailureCode.includes(statusCode)) {
    await prisma.ltiConsumer.update({
      where: { id: clientId },
      data: { accessToken: "" },
    });

    if (retry) {
      return await getMemberships(client, contextMembershipsUrl, false, query);
    }
  }

  if (!successCode.includes(statusCode)) {
    throw new Error(`${statusCode} ${res.statusText}`);
  }

  const memberships = (await res.json()) as LtiNrpsContextMembershipSchema;

  if (query) {
    return memberships;
  }

  // 教師を除く、学習者のみのデータを返す
  return {
    ...memberships,
    members: memberships.members.filter(
      (member) =>
        !isInstructor(member.roles) &&
        // NOTE: For Moodle
        !member.roles.includes("Instructor")
    ),
  };
}

/**
 * LTI-NRPS 2.0 教師の取得
 * https://www.imsglobal.org/spec/lti-nrps/v2p0
 * @param session
 */
export async function getInstructors(
  session: FastifySessionObject
): Promise<LtiNrpsContextMembershipSchema> {
  const client = await findClient(session.oauthClient.id);
  if (!client) {
    throw new Error("Failed to find client");
  }
  return getMemberships(
    client,
    session.ltiNrpsParameter?.context_memberships_url,
    true,
    "role=Instructor"
  );
}
