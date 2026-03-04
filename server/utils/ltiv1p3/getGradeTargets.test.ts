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
    const session = createMockSession();
    const query: ActivityQuery = {
      current_lti_context_only: true,
      lti_consumer_id: "curr-cons",
      lti_context_id: "curr-ctx",
    };

    mockLtiResourceLinkFindMany.mockResolvedValue([
      { consumerId: "curr-cons", contextId: "curr-ctx", lineItem: "url-1" },
    ]);

    const result = await getGradeTargets(bookId, userId, session, query);

    expect(result).toHaveLength(1);
    expect(result[0].contextId).toBe("curr-ctx");
    expect(result[0].label).toBe("Target Context");
  });

  it("current_lti_context_onlyがfalseの場合、bookIdが一致する自身のすべてのリソースリンクを含めて返し、ラベルが'Broadcast'であること", async () => {
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

    expect(result).toHaveLength(2);
    for (const target of result) {
      expect(target.label).toBe("Broadcast");
    }
  });

  it("current_lti_context_onlyがfalse の場合、複数のリソースが同一URLを持つ場合、重複排除されること", async () => {
    const session = createMockSession();
    const query: ActivityQuery = { current_lti_context_only: false };
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
  });

  it("クエリにIDが含まれない場合、セッション情報のコンテキストを使用すること", async () => {
    const session = createMockSession();
    const query: ActivityQuery = { current_lti_context_only: true };
    mockLtiResourceLinkFindMany.mockResolvedValue([
      {
        consumerId: "cons-session",
        contextId: "ctx-session",
        lineItem: "url-session",
      },
    ]);

    const result = await getGradeTargets(bookId, userId, session, query);

    expect(result).toHaveLength(1);
    expect(result[0].consumerId).toBe("cons-session");
    expect(result[0].contextId).toBe("ctx-session");
    expect(result[0].lineItem).toBe("url-session");
    expect(result[0].label).toBe("Target Context");
  });
});
