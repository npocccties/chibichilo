import {
  allowInsecureRequests,
  Configuration,
  None,
  PrivateKeyJwt,
  useIdTokenResponseType,
} from "openid-client";
import { importJWK } from "jose";
import type { ServerMetadata } from "openid-client";
import prisma from "$server/utils/prisma";
import { createPrivateKey } from "$server/utils/ltiv1p3/jwk";

export type OidcClient = Configuration;

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
  const server: ServerMetadata = {
    ...(metadata as ServerMetadata),
    issuer: platform.issuer,
  };
  const privateKey = await createPrivateKey();
  const clientAuth = privateKey
    ? PrivateKeyJwt((await importJWK(privateKey, "RS256")) as CryptoKey)
    : None();
  const config = new Configuration(
    server,
    clientId,
    {
      redirect_uris: redirectUris,
      response_types: ["id_token"],
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "RS256",
    },
    clientAuth
  );
  useIdTokenResponseType(config);

  if (process.env.NODE_ENV !== "production") {
    allowInsecureRequests(config);
  }

  return config;
}

export default findClient;
