import checkLtiResourceLink from "$server/utils/book/checkLtiResourceLink";
import type { FastifySessionObject } from "@fastify/session";
import prisma from "$server/utils/prisma";
import type { SessionSchema } from "$server/models/session";
import type { LtiResourceLink } from "@prisma/client";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

jest.mock("$server/utils/prisma", () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn().mockResolvedValue(undefined),
    ltiResourceLink: {
      findFirst: jest.fn(),
    },
    activity: {
      findFirst: jest.fn(),
    },
  },
}));

type SessionData = {
  oauthClient: Pick<SessionSchema["oauthClient"], "id">;
  ltiResourceLink: Pick<LtiResourceLinkSchema, "bookId">;
  user: Pick<SessionSchema["user"], "id" | "ltiUserId">;
};

describe("checkLtiResourceLink()検証", () => {
  const VALID_BOOK_ID = 123;
  const OTHER_BOOK_ID = 999;
  const VALID_CONTEXT_ID = "ctx-456";
  const OTHER_CONTEXT_ID = "ctx-789";
  const VALID_USER_ID = "LTI-USER-UNIQUE-ID";
  const VALID_CONSUMER_ID = "session-client-id";
  const OTHER_CONSUMER_ID = "other-client-id";

  const createMockSession = (
    overrides: Partial<SessionData> = {}
  ): FastifySessionObject => {
    const session: SessionData = {
      oauthClient: { id: VALID_CONSUMER_ID },
      user: { id: 1, ltiUserId: VALID_USER_ID },
      ltiResourceLink: { bookId: OTHER_BOOK_ID },
      ...overrides,
    };
    return session as unknown as FastifySessionObject;
  };

  const createMockResourceLink = (
    data: Pick<LtiResourceLink, "id">
  ): LtiResourceLink => {
    return data as LtiResourceLink;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("クエリパラメータ(lti_context_id)", () => {
    it("クエリに情報がある場合、セッションの bookId が一致していても DB 検証を優先し、不一致なら false を返すこと", async () => {
      jest.mocked(prisma.ltiResourceLink.findFirst).mockResolvedValue(null);
      const session = createMockSession({
        ltiResourceLink: { bookId: VALID_BOOK_ID },
      });
      const query = { lti_context_id: OTHER_CONTEXT_ID };

      const result = await checkLtiResourceLink(VALID_BOOK_ID, session, query);
      expect(result).toBe(false);
      expect(prisma.ltiResourceLink.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ contextId: OTHER_CONTEXT_ID }),
        })
      );
    });

    it("lti_consumer_id がクエリにある場合、セッションの値ではなくクエリの値を優先して検索すること", async () => {
      jest
        .mocked(prisma.ltiResourceLink.findFirst)
        .mockResolvedValue(createMockResourceLink({ id: "1" }));
      const query = {
        lti_context_id: VALID_CONTEXT_ID,
        lti_consumer_id: OTHER_CONSUMER_ID,
      };

      const result = await checkLtiResourceLink(
        VALID_BOOK_ID,
        createMockSession({ oauthClient: { id: VALID_CONSUMER_ID } }),
        query
      );
      expect(result).toBe(true);
      expect(prisma.ltiResourceLink.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ consumerId: OTHER_CONSUMER_ID }),
        })
      );
    });

    it("lti_consumer_id が未指定の場合、session.oauthClient.id を使用して検索すること", async () => {
      jest.mocked(prisma.ltiResourceLink.findFirst).mockResolvedValue(null);
      const query = { lti_context_id: VALID_CONTEXT_ID };

      await checkLtiResourceLink(VALID_BOOK_ID, createMockSession(), query);
      expect(prisma.ltiResourceLink.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ consumerId: VALID_CONSUMER_ID }),
        })
      );
    });
  });

  describe("セッション情報(クエリがない場合)", () => {
    it("クエリが空で、セッションの bookId が一致すれば、DBを叩かずに承認すること", async () => {
      const session = createMockSession({
        ltiResourceLink: { bookId: VALID_BOOK_ID },
      });

      const result = await checkLtiResourceLink(VALID_BOOK_ID, session, {});
      expect(result).toBe(true);
      expect(prisma.ltiResourceLink.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("リソースリンク(ltiMembers)", () => {
    it("セッション情報が不一致でも、DBに有効なリソースリンクがあれば承認すること", async () => {
      jest
        .mocked(prisma.ltiResourceLink.findFirst)
        .mockResolvedValue(createMockResourceLink({ id: "888" }));

      const result = await checkLtiResourceLink(
        VALID_BOOK_ID,
        createMockSession(),
        {}
      );
      expect(result).toBe(true);
      expect(prisma.ltiResourceLink.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ bookId: VALID_BOOK_ID }),
        })
      );
    });

    it("セッション不一致かつ DB にもリソースリンクがない場合は拒否すること", async () => {
      jest.mocked(prisma.ltiResourceLink.findFirst).mockResolvedValue(null);

      const result = await checkLtiResourceLink(
        VALID_BOOK_ID,
        createMockSession(),
        {}
      );
      expect(result).toBe(false);
    });
  });
});
