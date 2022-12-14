import type { FastifyRequest } from "fastify";
import { FRONTEND_ORIGIN, FRONTEND_PATH } from "$server/utils/env";
import { upsertUser } from "$server/utils/user";
import {
  findLtiResourceLink,
  upsertLtiResourceLink,
} from "$server/utils/ltiResourceLink";
// import { isInstructor } from "$server/utils/session";
import { getSystemSettings } from "$server/utils/systemSettings";
// import { upsertLtiMember } from "$server/utils/ltiMember";

const frontendUrl = `${FRONTEND_ORIGIN}${FRONTEND_PATH}`;

/** 起動時の初期化プロセス */
async function init({ session }: FastifyRequest) {
  const systemSettings = getSystemSettings();
  const ltiResourceLink = await findLtiResourceLink({
    consumerId: session.oauthClient.id,
    id: session.ltiResourceLinkRequest.id,
  });

  if (ltiResourceLink) {
    await upsertLtiResourceLink({
      ...ltiResourceLink,
      title: session.ltiResourceLinkRequest.title ?? ltiResourceLink.title,
      contextTitle: session.ltiContext.title ?? ltiResourceLink.contextTitle,
      contextLabel: session.ltiContext.label ?? ltiResourceLink.contextLabel,
    });
  }

  const user = await upsertUser({
    ltiConsumerId: session.oauthClient.id,
    ltiUserId: session.ltiUser.id,
    name: session.ltiUser.name ?? "",
    email: session.ltiUser.email ?? "",
  });

  // TODO：削除
  // ユーザー同期はLTI Names and Role Provisioning Servicesで行うのでコメントアウト
  // if (ltiResourceLink && !isInstructor(session)) {
  //   await upsertLtiMember(
  //     ltiResourceLink.consumerId,
  //     ltiResourceLink.contextId,
  //     user.ltiUserId
  //   );
  // }

  Object.assign(session, { ltiResourceLink, user, systemSettings });

  return {
    status: 302,
    headers: { location: frontendUrl },
  } as const;
}

/** OpenAPI Responses Object */
init.response = { 302: {} } as const;

/** 成功時のリダイレクト先のフロントエンドのURL */
init.frontendUrl = frontendUrl;

export default init;
