import { outdent } from "outdent";
import { UsersParams } from "$server/validators/usersParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { UserSchema } from "$server/models/user";
import { findUsersByEmail } from "$server/utils/user";

export type Params = UsersParams;

export const method = {
  get: {
    summary: "利用者情報",
    description: outdent`
      利用者に関する詳細な情報を取得します。
      教員または管理者でなければなりません。`,
    params: UsersParams,
    response: {
      200: { type: "array", items: UserSchema },
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index({ params: { email } }: { params: Params }) {
  const users = await findUsersByEmail(email);

  return {
    status: 200,
    body: users,
  };
}
