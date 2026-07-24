import { show } from "./show";
import {
  isAdministrator,
  isInstructor,
  isUsersOrAdmin,
} from "$server/utils/session";
import checkLtiResourceLink from "$server/utils/book/checkLtiResourceLink";
import findBook from "$server/utils/book/findBook";
import { findReleasedBooks, findParentBook } from "$server/utils/book/release";
import type { FastifyRequest } from "fastify";
import type { FastifySessionObject } from "@fastify/session";
import type { BookParams } from "$server/validators/bookParams";
import type { SessionSchema } from "$server/models/session";
import type { BookSchema } from "$server/models/book";
import type { BookWithRelease } from "$server/utils/book/release";

// 外部依存をすべてモック化
jest.mock("$server/utils/session");
jest.mock("$server/utils/book/checkLtiResourceLink");
jest.mock("$server/utils/book/findBook");
jest.mock("$server/utils/book/release");
jest.mock("$server/utils/prisma", () => ({ __esModule: true }));

type SessionData = {
  oauthClient: Pick<SessionSchema["oauthClient"], "id">;
  user: Pick<SessionSchema["user"], "id" | "ltiUserId">;
};

describe("release show()", () => {
  const VALID_BOOK_ID = 123;
  const MOCK_USER_ID = 1;

  const MOCK_BOOK = {
    id: VALID_BOOK_ID,
    authors: [],
    release: { shared: false },
  } as unknown as BookSchema;

  const createMockSession = (
    overrides: Partial<SessionData> = {}
  ): FastifySessionObject => {
    const session: SessionData = {
      oauthClient: { id: "consumer-id" },
      user: { id: MOCK_USER_ID, ltiUserId: "user-id" },
      ...overrides,
    };
    return session as unknown as FastifySessionObject;
  };

  const createMockRequest = (
    params: BookParams = { book_id: VALID_BOOK_ID }
  ) => {
    return {
      session: createMockSession(),
      params,
    } as unknown as FastifyRequest<{ Params: BookParams }>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ブックが存在しない場合は 404 を返すこと", async () => {
    jest.mocked(findBook).mockResolvedValue(undefined);

    const response = await show(createMockRequest());

    expect(response.status).toBe(404);
  });

  it("管理者または著者の場合、findReleasedBooks を呼び出して 200 を返すこと", async () => {
    jest.mocked(findBook).mockResolvedValue(MOCK_BOOK);
    jest.mocked(isUsersOrAdmin).mockReturnValue(true);
    jest.mocked(isAdministrator).mockReturnValue(true);
    jest.mocked(findReleasedBooks).mockResolvedValue([] as BookWithRelease[]);

    const response = await show(createMockRequest());

    expect(response.status).toBe(200);
    expect(findReleasedBooks).toHaveBeenCalledWith(
      MOCK_BOOK,
      MOCK_USER_ID,
      true
    );
  });

  it("教員でブックが共有されている場合、findReleasedBooks を呼び出して 200 を返すこと", async () => {
    const sharedBook = {
      ...MOCK_BOOK,
      release: { shared: true },
    } as unknown as BookSchema;

    jest.mocked(findBook).mockResolvedValue(sharedBook);
    jest.mocked(isUsersOrAdmin).mockReturnValue(false);
    jest.mocked(isInstructor).mockReturnValue(true);
    jest.mocked(findReleasedBooks).mockResolvedValue([] as BookWithRelease[]);

    const response = await show(createMockRequest());

    expect(response.status).toBe(200);
    expect(findReleasedBooks).toHaveBeenCalled();
  });

  it("LTI リンクのみ有効な場合、findParentBook を呼び出して 200 を返すこと", async () => {
    jest.mocked(findBook).mockResolvedValue(MOCK_BOOK);
    jest.mocked(isUsersOrAdmin).mockReturnValue(false);
    jest.mocked(isInstructor).mockReturnValue(false);
    jest.mocked(checkLtiResourceLink).mockResolvedValue(true);
    jest.mocked(findParentBook).mockResolvedValue([] as BookWithRelease[]);

    const response = await show(createMockRequest());

    expect(response.status).toBe(200);
    expect(findParentBook).toHaveBeenCalledWith(MOCK_BOOK);
    expect(findReleasedBooks).not.toHaveBeenCalled();
  });

  it("権限が不足している場合は 403 を返すこと", async () => {
    jest.mocked(findBook).mockResolvedValue(MOCK_BOOK);
    jest.mocked(isUsersOrAdmin).mockReturnValue(false);
    jest.mocked(isInstructor).mockReturnValue(false);
    jest.mocked(checkLtiResourceLink).mockResolvedValue(false);

    const response = await show(createMockRequest());

    expect(response.status).toBe(403);
  });
});
