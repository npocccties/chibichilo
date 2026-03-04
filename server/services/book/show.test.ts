import { show } from "./show";
import checkLtiResourceLink from "$server/utils/book/checkLtiResourceLink";
import { isInstructor } from "$utils/session";
import type { FastifyRequest } from "$node_modules/fastify/fastify";
import type { FastifySessionObject } from "@fastify/session";
import type { BookParams } from "$server/validators/bookParams";
import type { SessionSchema } from "$server/models/session";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import findBook from "$server/utils/book/findBook";
import type { BookSchema } from "$server/models/book";

jest.mock("$server/utils/book/checkLtiResourceLink");
jest.mock("$utils/session");
jest.mock("$server/utils/book/findBook");
jest.mock("$server/utils/prisma", () => ({ __esModule: true }));

type SessionData = {
  oauthClient: Pick<SessionSchema["oauthClient"], "id">;
  ltiResourceLink: Pick<LtiResourceLinkSchema, "bookId">;
  user: Pick<SessionSchema["user"], "id" | "ltiUserId">;
};

describe("show()", () => {
  const VALID_BOOK_ID = 123;
  const DIFFERENT_BOOK_ID = 999;
  const MOCK_BOOK = {
    id: VALID_BOOK_ID,
    name: "テストブック",
  } as unknown as BookSchema;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockSession = (
    overrides: Partial<SessionData> = {}
  ): FastifySessionObject => {
    const session: SessionData = {
      oauthClient: { id: "consumer-id" },
      user: { id: 1, ltiUserId: "user-id" },
      ltiResourceLink: { bookId: VALID_BOOK_ID },
      ...overrides,
    };
    return session as unknown as FastifySessionObject;
  };

  const createMockRequest = (
    overrides: Partial<SessionData> = {},
    params: BookParams = { book_id: VALID_BOOK_ID }
  ) => {
    return {
      session: createMockSession(overrides),
      params,
    } as unknown as FastifyRequest<{ Params: BookParams }>;
  };

  it("教員ではなく、かつリソースリンクも不一致な場合は 403 を返すこと", async () => {
    jest.mocked(isInstructor).mockReturnValue(false);
    jest.mocked(checkLtiResourceLink).mockResolvedValue(false);
    const req = createMockRequest(
      { ltiResourceLink: { bookId: DIFFERENT_BOOK_ID } },
      { book_id: 123 }
    );
    const response = await show(req);
    expect(response.status).toBe(403);
  });

  it("教員であれば、リソースリンクに関係なくブックを取得でき、200 を返すこと", async () => {
    jest.mocked(isInstructor).mockReturnValue(true);
    jest.mocked(findBook).mockResolvedValue(MOCK_BOOK);
    const req = createMockRequest();
    const response = await show(req);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(MOCK_BOOK);
    expect(checkLtiResourceLink).not.toHaveBeenCalled();
  });

  it("権限はあるが、指定された ID のブックが DB に存在しない場合は 404 を返すこと", async () => {
    jest.mocked(isInstructor).mockReturnValue(true);
    jest.mocked(findBook).mockResolvedValue(undefined);
    const req = createMockRequest();
    const response = await show(req);
    expect(response.status).toBe(404);
  });
});
