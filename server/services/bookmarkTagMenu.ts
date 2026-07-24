import { outdent } from "outdent";
import { BookmarkTagMenu } from "$server/models/bookmark";
import type { BookmarkQuery } from "$server/validators/bookmarkQuery";
import authUser from "$server/auth/authUser";
import findBookmarkTagMenu from "$server/utils/bookmark/findBookmarkTagMenu";

export const method = {
  get: {
    summary: "ブックマークメニュー（タグ）一覧",
    description: outdent`
    ブックマークメニュー（タグ）の一覧を取得します。
    `,
    response: {
      200: {
        description: "成功時",
        type: "object",
        properties: {
          bookmarkTagMenu: BookmarkTagMenu,
        },
        required: ["bookmarkTagMenu"],
      },
      404: {},
    },
  },
} as const;

export type Query = BookmarkQuery;

export const hooks = {
  get: { auth: [authUser] },
};

export async function index() {
  const bookmarkTagMenu = await findBookmarkTagMenu();

  return {
    status: 200,
    body: {
      bookmarkTagMenu: bookmarkTagMenu,
    },
  };
}
