import { generators } from "openid-client";
import getUnixTime from "date-fns/getUnixTime";
import prisma from "$server/utils/prisma";
import findClient from "./findClient";

/** アカウントを登録し OpenID Connect Authorization URL を得る */
async function createAccount(
  {
    client_id,
    iss,
    login_hint,
    lti_message_hint,
  }: {
    client_id: string;
    iss: string;
    login_hint: string;
    target_link_uri: string;
    lti_message_hint?: string;
  },
  callbackUrl: string
) {
  const client = await findClient(client_id, [callbackUrl]);

  if (client?.issuer.metadata.issuer !== iss) {
    throw new Error("このプラットフォームは許可されていません");
  }

  const state = generators.state();
  const nonce = generators.nonce();
  const timestamp = getUnixTime(new Date());
  await prisma.account.create({ data: { nonce, timestamp } });

  const authorizationUrl = client.authorizationUrl({
    state,
    nonce,
    login_hint,
    response_mode: "form_post",
    prompt: "none",
    ...{ lti_message_hint },
  });

  return { state, nonce, authorizationUrl };
}

export default createAccount;
