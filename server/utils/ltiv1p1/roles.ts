import roleUrns from "$server/config/roles";
import { LtiLaunchBody } from "$server/validators/ltiLaunchBody";

/** LIS Context Role 名前空間の接頭辞 */
const lisContextRolePrefix = "urn:lti:role:ims/lis/";

/** LIS Context Role 省略名を含める */
function makeRole(role: string) {
  return role.startsWith(lisContextRolePrefix)
    ? [role, role.slice(lisContextRolePrefix.length)]
    : [role];
}

/** LIS Context Role の名前空間のものを含めたロール */
const roles = {
  administrator: roleUrns.administrator.flatMap(makeRole),
  instructor: roleUrns.instructor.flatMap(makeRole),
} as const;

/**
 * ロールが管理者か否か
 * @param ltiLaunchBody LTI v1.1 起動時リクエストボディ
 * @return 管理者の場合 true、それ以外の場合 false
 */
export function isAdministrator(ltiLaunchBody: LtiLaunchBody) {
  return hasRole(ltiLaunchBody.roles, roles.administrator);
}

/**
 * ロールが教員・管理者か否か
 * @param ltiLaunchBody LTI v1.1 起動時リクエストボディ
 * @return 教員または管理者の場合 true、それ以外の場合 false
 */
export function isInstructor(ltiLaunchBody: LtiLaunchBody) {
  return hasRole(ltiLaunchBody.roles, [
    ...roles.instructor,
    ...roles.administrator,
  ]);
}

/**
 * 特定のロールを持っているか否か
 * @param roles 持っているロール一覧。 `,` 区切り。
 * @param roleToFind 対象のロール
 * @return 対象のロールを持っている場合 true、それ以外の場合 false
 */
function hasRole(roles: string, roleToFind: readonly string[]) {
  return roles.split(",").some((role) => roleToFind.includes(role));
}
