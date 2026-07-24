import { Issuer } from "openid-client";
import prisma from "$server/utils/prisma";
import { createPrivateKey } from "$server/utils/ltiv1p3/jwk";

/** OpenID Connect Client を得る */
async function findClient(clientId: string, redirectUris?: string[]) {
  const consumer = await prisma.ltiConsumer.findUnique({
    where: { id: clientId },
    include: { platform: true },
  });
  const platform = consumer?.platform;

  if (!platform?.issuer) return;

  const metadata =
    typeof platform.metadata === "object" ? platform.metadata : {};
  const issuer = new Issuer({
    ...metadata,
    issuer: platform.issuer,
  });
  const privateKey = await createPrivateKey();
  const client = new issuer.Client(
    {
      client_id: clientId,
      redirect_uris: redirectUris,
      response_types: ["id_token"],
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "RS256",
    },
    { keys: privateKey ? [privateKey] : [] }
  );

  return client;
}

export default findClient;
