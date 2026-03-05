import { getGradeTargets } from "./getGradeTargets";
import type { SessionSchema } from "$server/models/session";
import type { ActivityQuery } from "$server/validators/activityQuery";
import type { LtiResourceLink, LtiMember, User } from "@prisma/client";

jest.mock("$server/utils/prisma", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    ltiResourceLink: { findMany: jest.fn() },
  },
}));

import prisma from "$server/utils/prisma";

type MockUser = Partial<User> & {
  ltiMembers?: Partial<LtiMember>[];
};
const mockUserFindUnique = jest.mocked(
  prisma.user.findUnique
) as unknown as jest.Mock<Promise<MockUser | null>>;

type MockResourceLink = Partial<LtiResourceLink> &
  Pick<LtiResourceLink, "consumerId" | "contextId" | "lineItem">;
const mockLtiResourceLinkFindMany = jest.mocked(
  prisma.ltiResourceLink.findMany
) as unknown as jest.Mock<Promise<MockResourceLink[]>>;

describe("getGradeTargets()", () => {
  const bookId = 123;
  const userId = 456;

  const createMockSession = (
    overrides: Partial<SessionSchema> = {}
  ): SessionSchema =>
    ({
      oauthClient: { id: "cons-session" },
      ltiContext: { id: "ctx-session" },
      ...overrides,
    }) as SessionSchema;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("current_lti_context_onlyがtrueでクエリによるコンテキスト指定がある場合、そのコンテキストのみを返し、ラベルが 'Target Context' であること", async () => {
    const session = createMockSession({
      oauthClient: { id: "other-cons", nonce: "" },
      ltiContext: { id: "other-ctx" },
    });
    const query: ActivityQuery = {
      current_lti_context_only: true,
      lti_consumer_id: "curr-cons",
      lti_context_id: "curr-ctx",
    };
    mockLtiResourceLinkFindMany.mockResolvedValue([
      { consumerId: "curr-cons", contextId: "curr-ctx", lineItem: "url-1" },
    ]);

    const result = await getGradeTargets(bookId, userId, session, query);

    expect(prisma.ltiResourceLink.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ consumerId: "curr-cons", contextId: "curr-ctx" }],
        }),
      })
    );
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Target Context");
  });

  it("current_lti_context_onlyがfalseの場合、ユーザーが所属する全コースを対象にリソースリンク検索を行い、結果に'Broadcast'ラベルを付与すること", async () => {
    const session = createMockSession();
    const query: ActivityQuery = {
      current_lti_context_only: false,
      lti_consumer_id: "cons-base",
      lti_context_id: "ctx-base",
    };
    mockUserFindUnique.mockResolvedValue({
      ltiMembers: [{ consumerId: "cons-base", contextId: "ctx-other" }],
    });
    mockLtiResourceLinkFindMany.mockResolvedValue([
      { consumerId: "cons-base", contextId: "ctx-base", lineItem: "url-1" },
      { consumerId: "cons-base", contextId: "ctx-other", lineItem: "url-2" },
    ]);

    const result = await getGradeTargets(bookId, userId, session, query);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        ltiMembers: {
          select: {
            consumerId: true,
            contextId: true,
          },
        },
      },
    });
    expect(prisma.ltiResourceLink.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          bookId: bookId,
          OR: expect.arrayContaining([
            { consumerId: "cons-base", contextId: "ctx-base" },
            { consumerId: "cons-base", contextId: "ctx-other" },
          ]),
        }),
      })
    );
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        consumerId: "cons-base",
        contextId: "ctx-base",
        lineItem: "url-1",
        label: "Broadcast",
      },
      {
        consumerId: "cons-base",
        contextId: "ctx-other",
        lineItem: "url-2",
        label: "Broadcast",
      },
    ]);
  });

  it("current_lti_context_onlyがfalse の場合、複数のリソースが同一URLを持つ場合、重複排除されること", async () => {
    const session = createMockSession();
    const query: ActivityQuery = {
      current_lti_context_only: false,
      lti_consumer_id: "cons-session",
      lti_context_id: "ctx-session",
    };
    mockUserFindUnique.mockResolvedValue({
      ltiMembers: [{ consumerId: "cons-session", contextId: "ctx-other" }],
    });
    mockLtiResourceLinkFindMany.mockResolvedValue([
      {
        consumerId: "cons-session",
        contextId: "ctx-session",
        lineItem: "shared-url",
      },
      {
        consumerId: "cons-session",
        contextId: "ctx-other",
        lineItem: "shared-url",
      },
    ]);

    const result = await getGradeTargets(bookId, userId, session, query);

    expect(result).toHaveLength(1);
    expect(result[0].lineItem).toBe("shared-url");
    expect(result[0].label).toBe("Broadcast");
  });

  it("クエリにIDが含まれない場合、リソースリンクを検索せずにセッション情報のコンテキストとURLを使用すること", async () => {
    const session = createMockSession({
      oauthClient: { id: "cons-session", nonce: "nonce" },
      ltiContext: { id: "ctx-session" },
      ltiAgsEndpoint: {
        lineitem: "url-session",
        lineitems: "url-lineitems",
        scope: [],
      },
    });
    const query: ActivityQuery = {
      current_lti_context_only: true,
      lti_consumer_id: undefined,
      lti_context_id: undefined,
    };

    const result = await getGradeTargets(bookId, userId, session, query);

    expect(prisma.ltiResourceLink.findMany).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      consumerId: "cons-session",
      contextId: "ctx-session",
      lineItem: "url-session",
      label: "Session Context",
    });
  });

  it("クエリにIDが含まれず、かつセッションにlineitemがない場合は空配列を返すこと", async () => {
    const session = createMockSession({
      ltiAgsEndpoint: {
        lineitem: undefined,
        lineitems: "https://lms.example.com/grades",
        scope: [],
      },
    });
    const query: ActivityQuery = {
      current_lti_context_only: true,
      lti_consumer_id: undefined,
      lti_context_id: undefined,
    };

    const result = await getGradeTargets(bookId, userId, session, query);

    expect(result).toEqual([]);
  });
});
