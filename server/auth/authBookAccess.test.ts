import authBookAccess from "./authBookAccess";
import checkLtiResourceLink from "$server/utils/book/checkLtiResourceLink";
import { isInstructor } from "$utils/session";
import type { FastifyRequest } from "fastify";

jest.mock("$server/utils/prisma", () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("$server/utils/book/checkLtiResourceLink");
jest.mock("$utils/session", () => ({
  isInstructor: jest.fn(),
}));

const VALID_BOOK_ID = 123;

// 毎回新しいオブジェクトを返す
const createDefaultReq = () => ({
  session: { user: { role: "learner" } },
  params: { book_id: String(VALID_BOOK_ID) },
  query: {},
  body: {},
});

type MockRequest = {
  session?: {
    user?: {
      role: string;
    };
  };
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
};

describe("authBookAccess()", () => {
  const createMockReq = (
    overrides: Partial<MockRequest> = {}
  ): FastifyRequest => {
    const base = createDefaultReq();

    // session が明示的に undefined の場合は未ログイン状態をシミュレート
    const session =
      Object.hasOwn(overrides, "session") && overrides.session === undefined
        ? undefined
        : { ...base.session, ...overrides.session };

    // userも個別マージ
    if (session && overrides.session?.user) {
      session.user = { ...base.session.user, ...overrides.session.user };
    }
    return {
      ...base,
      ...overrides,
      session,
    } as unknown as FastifyRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("管理者や教員の場合はエラーを投げずに終了すること", async () => {
    jest.mocked(isInstructor).mockReturnValue(true);
    const req = createMockReq({ session: { user: { role: "instructor" } } });

    await expect(authBookAccess(req)).resolves.not.toThrow();
  });

  describe("学習者 (learner) の場合", () => {
    beforeEach(() => {
      jest.mocked(isInstructor).mockReturnValue(false);
    });

    it("LTIリソースリンクのチェックが通れば正常終了すること", async () => {
      jest.mocked(checkLtiResourceLink).mockResolvedValue(true);
      const req = createMockReq({ query: { lti_context_id: "ctx-1" } });

      await expect(authBookAccess(req)).resolves.not.toThrow();
      expect(checkLtiResourceLink).toHaveBeenCalledWith(
        VALID_BOOK_ID,
        req.session,
        req.query
      );
    });

    it("LTIリソースリンクのチェックが失敗すれば 403 エラーを投げること", async () => {
      jest.mocked(checkLtiResourceLink).mockResolvedValue(false);
      const req = createMockReq();

      await expect(authBookAccess(req)).rejects.toMatchObject({
        status: 403,
        message: expect.stringContaining("Forbidden"),
      });
    });

    it("不正な文字列の book_id が渡された場合、400エラーを投げること", async () => {
      const req = createMockReq({ params: { book_id: "not-a-number" } });
      await expect(authBookAccess(req)).rejects.toMatchObject({ status: 400 });
    });

    it("空文字列の book_id が渡された場合、400エラーを投げること", async () => {
      const req = createMockReq({ params: { book_id: "" } });
      await expect(authBookAccess(req)).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("パラメータ抽出のチェック", () => {
    beforeEach(() => jest.mocked(isInstructor).mockReturnValue(true));

    it("body.bookId から bookId を抽出できること", async () => {
      const req = createMockReq({
        params: {},
        body: { bookId: VALID_BOOK_ID },
      });
      await expect(authBookAccess(req)).resolves.not.toThrow();
    });

    it("query.book_id から bookId を抽出できること", async () => {
      const req = createMockReq({
        params: {},
        query: { book_id: String(VALID_BOOK_ID) },
      });
      await expect(authBookAccess(req)).resolves.not.toThrow();
    });
  });

  describe("セッション・ユーザー異常系のチェック", () => {
    it("セッションが存在しない場合、エラーを投げること", async () => {
      const req = createMockReq({ session: undefined });
      await expect(authBookAccess(req)).rejects.toThrow(
        "user authorization required"
      );
    });

    it("セッションにユーザー情報がない場合、エラーを投げること", async () => {
      const req = createMockReq({ session: { user: undefined } });
      await expect(authBookAccess(req)).rejects.toThrow(
        "user authorization required"
      );
    });
  });

  describe("authBookAccess 統合検証", () => {
    it("クエリパラメータ (?book_id=...) からも正しく ID を抽出して認可できること", async () => {
      const req = {
        session: { user: { id: 1 } },
        params: {},
        body: {},
        query: { book_id: "123" },
      } as unknown as FastifyRequest;
      jest.mocked(isInstructor).mockReturnValue(false);
      jest.mocked(checkLtiResourceLink).mockReturnValue(Promise.resolve(true));

      await expect(authBookAccess(req)).resolves.not.toThrow();
      expect(checkLtiResourceLink).toHaveBeenCalledWith(
        123,
        expect.anything(),
        expect.anything()
      );
    });

    it("教員（isInstructor: true）の場合は、LTI リンクのチェックを行わずに許可すること", async () => {
      const req = {
        session: { user: { id: 1 } },
        params: { book_id: "123" },
        query: {},
      } as unknown as FastifyRequest;
      jest.mocked(isInstructor).mockReturnValue(true);

      await authBookAccess(req);
      expect(checkLtiResourceLink).not.toHaveBeenCalled();
    });
  });
});
