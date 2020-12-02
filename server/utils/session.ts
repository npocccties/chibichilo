import { User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { LtiLaunchBody } from "$server/validators/ltiLaunchBody";
import * as ltiRoles from "./ltiv1p1/roles";

/**
 * セッションが利用者のものであるか否か
 * @param session セッション
 * @param user 対象の利用者
 * @return セッションが利用者のものの場合 true、それ以外の場合 false
 */
export function verify(session: FastifyRequest["session"], user: User) {
  return session.user?.id === user.id;
}

/**
 * セッションが管理者のものであるか否か
 * @param session セッション
 * @return セッションが管理者のものの場合 true、それ以外の場合 false
 */
export function isAdministrator(session: FastifyRequest["session"]) {
  return hasRole(session, ltiRoles.isAdministrator);
}

/**
 * セッションが教員・管理者のものであるか否か
 * @param session セッション
 * @return セッションが教員または管理者のものの場合 true、それ以外の場合 false
 */
export function isInstructor(session: FastifyRequest["session"]) {
  return hasRole(session, ltiRoles.isInstructor);
}

/**
 * 特定のロールであるか否か
 * @param session セッション
 * @param roleToFind 対象のロール
 * @return 対象のロールを持っている場合 true、それ以外の場合 false
 */
function hasRole(
  session: FastifyRequest["session"],
  roleToFind: (ltiLaunchBody: LtiLaunchBody) => boolean
) {
  return session.ltiLaunchBody != null && roleToFind(session.ltiLaunchBody);
}
