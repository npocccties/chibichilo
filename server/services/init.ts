import type { FastifyRequest } from "fastify";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import { FRONTEND_ORIGIN, FRONTEND_PATH } from "$server/utils/env";
import { upsertUser } from "$server/utils/user";
import {
  findLtiResourceLink,
  upsertLtiResourceLink,
} from "$server/utils/ltiResourceLink";
import { isInstructor } from "$server/utils/ltiv1p3/roles";
import { getSystemSettings } from "$server/utils/systemSettings";
import getValidUrl from "$server/utils/getValidUrl";

const frontendUrl = `${FRONTEND_ORIGIN}${FRONTEND_PATH}`;

/** 起動時の初期化プロセス */
async function init({ session }: FastifyRequest) {
  const systemSettings = getSystemSettings();

  // 最初にユーザー情報を取得
  const user = await upsertUser({
    ltiConsumerId: session.oauthClient.id,
    ltiUserId: session.ltiUser.id,
    name: session.ltiUser.name ?? "",
    email: session.ltiUser.email ?? "",
  });

  let ltiResourceLink: LtiResourceLinkSchema | null = null;

  if (
    session.ltiMessageType === "LtiResourceLinkRequest" &&
    session.ltiResourceLinkRequest?.id
  ) {
    ltiResourceLink = await findLtiResourceLink({
      consumerId: session.oauthClient.id,
      id: session.ltiResourceLinkRequest.id,
    });
  }

  // Target Link URI を LTI Resource Link として紐付ける
  const ltiTargetLink = getValidUrl(session.ltiTargetLinkUri ?? "");
  // see also pages/book.tsx query
  const bookId =
    ltiTargetLink &&
    ltiTargetLink.pathname === "/book" &&
    ltiTargetLink.searchParams.get("bookId");
  // ただし `/book?bookId` 形式以外の場合は Target Link URI を無効値とする
  const ltiTargetLinkUri =
    ltiTargetLink &&
    typeof bookId === "string" &&
    Number.isInteger(Number(bookId))
      ? ltiTargetLink.href
      : undefined;
  if (
    isInstructor(session.ltiRoles) &&
    session.ltiMessageType === "LtiResourceLinkRequest" &&
    session.ltiResourceLinkRequest?.id &&
    Boolean(ltiTargetLinkUri)
  ) {
    ltiResourceLink = {
      bookId: Number(bookId),
      creatorId: ltiResourceLink?.creatorId ?? user.id, // 直接user.idを使用
      consumerId: session.oauthClient.id,
      contextId: session.ltiContext.id,
      id: session.ltiResourceLinkRequest.id,
      title:
        session.ltiResourceLinkRequest?.title ?? ltiResourceLink?.title ?? "",
      contextTitle:
        session.ltiContext.title ?? ltiResourceLink?.contextTitle ?? "",
      contextLabel:
        session.ltiContext.label ?? ltiResourceLink?.contextLabel ?? "",
    };
  }

  if (ltiResourceLink) {
    await upsertLtiResourceLink({
      ...ltiResourceLink,
      title: session.ltiResourceLinkRequest?.title ?? ltiResourceLink.title,
      contextTitle: session.ltiContext.title ?? ltiResourceLink.contextTitle,
      contextLabel: session.ltiContext.label ?? ltiResourceLink.contextLabel,
    });
  }

  Object.assign(session, {
    ltiTargetLinkUri,
    ltiResourceLink,
    user,
    systemSettings,
  });

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
