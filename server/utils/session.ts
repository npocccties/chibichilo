import type { User } from "@prisma/client";
import type { SessionSchema } from "$server/models/session";
import type { LtiRolesSchema } from "$server/models/ltiRoles";
import * as ltiv1p3Roles from "./ltiv1p3/roles";
import * as ltiv1p1Roles from "./ltiv1p1/roles";

/**
 * セッションが管理者のものであるか否か
 * @param session セッション
 * @return セッションが管理者のものの場合 true、それ以外の場合 false
 */
export function isAdministrator(session: SessionSchema) {
  return hasRole(session, "isAdministrator");
}

/**
 * セッションが教員・管理者のものであるか否か
 * @param session セッション
 * @return セッションが教員または管理者のものの場合 true、それ以外の場合 false
 */
export function isInstructor(session: SessionSchema) {
  return hasRole(session, "isInstructor");
}

/**
 * セッションが管理者か特定の利用者のものであるか
 * @param session セッション
 * @param users 対象の利用者
 * @return セッションが利用者自身または管理者のものの場合 true、それ以外の場合 false
 */
export function isUsersOrAdmin(
  session: SessionSchema,
  users: Array<Pick<User, "id">>
) {
  return (
    isAdministrator(session) || users.some((user) => verify(session, user))
  );
}

/**
 * 特定のロールであるか否か
 * @param session セッション
 * @param role 対象のロール
 * @return 対象のロールを持っている場合 true、それ以外の場合 false
 */
function hasRole(
  session: SessionSchema,
  role: "isAdministrator" | "isInstructor"
) {
  if (!session.ltiVersion || !session.ltiRoles) return false;

  const roleToFind: (ltiRoles: LtiRolesSchema) => boolean = {
    "1.0.0": ltiv1p1Roles,
    "1.3.0": ltiv1p3Roles,
  }[session.ltiVersion][role];

  return roleToFind(session.ltiRoles);
}

/**
 * セッションが利用者のものであるか否か
 * @param session セッション
 * @param user 対象の利用者
 * @return セッションが利用者のものの場合 true、それ以外の場合 false
 */
function verify(session: SessionSchema, user: Pick<User, "id">) {
  return session.user.id === user.id;
}
