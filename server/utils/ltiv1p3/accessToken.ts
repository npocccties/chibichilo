import type { Client } from "openid-client";
import prisma from "$server/utils/prisma";

async function grant(client: Client): Promise<string> {
  try {
    const tokens = await client.grant({
      grant_type: "client_credentials",
      scope: [
        "https://purl.imsglobal.org/spec/lti-ags/scope/score",
        "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly",
      ],
    });
    return tokens.access_token ?? "";
  } catch {
    return "";
  }
}

/**
 * accessTokenの作成
 * @param client OpenID Connect Client
 */
export const createAccessToken = async (client: Client) => {
  const clientId = client.metadata.client_id;

  let { accessToken } = await prisma.ltiConsumer.findUniqueOrThrow({
    where: { id: clientId },
  });

  if (!accessToken) {
    accessToken = await grant(client);

    if (!accessToken) {
      throw new Error(`Failed to grant access token: client ${clientId}`);
    }

    await prisma.ltiConsumer.update({
      where: { id: clientId },
      data: { accessToken },
    });
  }

  return { accessToken };
};
