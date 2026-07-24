import { show } from "./show";
import fetchActivity from "$server/utils/activity/fetchActivity";
import type { FastifyRequest } from "fastify";
import type { BookParams } from "$server/validators/bookParams";
import type { ActivityQuery } from "$server/validators/activityQuery";
import type { ActivitySchema } from "$server/models/activity";

jest.mock("$server/utils/activity/fetchActivity");
jest.mock("$server/utils/prisma", () => ({
  __esModule: true,
}));

const createMockActivity = (
  overrides: Partial<ActivitySchema>
): ActivitySchema => {
  const base: ActivitySchema = {
    id: 0,
    bookId: 0,
    completed: false,
    totalTimeMs: 0,
    timeRanges: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    learner: {
      id: 1,
      name: "test user",
      email: "test@example.com",
      ltiUserId: "lti-user-id",
      ltiConsumerId: "lti-consumer-id",
    },
    topic: { id: 101, name: "Topic 1", timeRequired: 0 },
  };
  return { ...base, ...overrides };
};

describe("show()", () => {
  type ShowRequest = FastifyRequest<{
    Params: BookParams;
    Querystring: ActivityQuery;
  }>;

  const mockSession = {
    user: { id: 1 },
    oauthClient: { id: "session-consumer-id" },
    ltiContext: { id: "session-context-id" },
  };

  const mockParams: BookParams = { book_id: 100 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("セッション情報が欠けている場合、401を返すこと", async () => {
    const incompleteReq = {
      session: { ...mockSession, oauthClient: undefined },
      params: mockParams,
      query: {},
    } as unknown as ShowRequest;

    const result = await show(incompleteReq);
    expect(result.status).toBe(401);
  });

  it("クエリが空の場合、セッションのコンテキスト情報を使用して活動履歴を取得すること", async () => {
    const mockActivities = [createMockActivity({ id: 1 })];
    jest.mocked(fetchActivity).mockResolvedValue(mockActivities);

    const req = {
      session: mockSession,
      params: mockParams,
      query: {},
    } as unknown as ShowRequest;

    const result = await show(req);

    expect(result.status).toBe(200);
    expect(result.body?.activity).toEqual(mockActivities);
    expect(fetchActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        ltiConsumerId: "session-consumer-id",
        ltiContextId: "session-context-id",
        learnerId: 1,
        bookId: 100,
      }),
      false
    );
  });

  it("クエリに値がある場合、セッションよりもクエリのコンテキスト情報を優先すること", async () => {
    jest.mocked(fetchActivity).mockResolvedValue([]);

    const req = {
      session: mockSession,
      params: mockParams,
      query: {
        lti_consumer_id: "query-consumer-id",
        lti_context_id: "query-context-id",
        current_lti_context_only: true,
      } as ActivityQuery,
    } as unknown as ShowRequest;

    await show(req);

    expect(fetchActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        ltiConsumerId: "query-consumer-id",
        ltiContextId: "query-context-id",
      }),
      true
    );
  });

  it("current_lti_context_only が true の場合、現在のコンテキストに絞られた結果を返すこと", async () => {
    const currentContextActivity = [createMockActivity({ id: 101 })];
    jest.mocked(fetchActivity).mockResolvedValue(currentContextActivity);

    const req = {
      session: mockSession,
      params: mockParams,
      query: { current_lti_context_only: true } as ActivityQuery,
    } as unknown as ShowRequest;

    const result = await show(req);

    expect(fetchActivity).toHaveBeenCalledWith(expect.anything(), true);
    if ("body" in result && result.body) {
      expect(result.body.activity).toHaveLength(1);
      expect(result.body.activity[0].id).toBe(101);
    }
  });

  it("current_lti_context_only が false の場合、全コンテキストの活動を返すこと", async () => {
    const allActivities = [
      createMockActivity({ id: 101 }),
      createMockActivity({ id: 102 }),
    ];
    jest.mocked(fetchActivity).mockResolvedValue(allActivities);

    const req = {
      session: mockSession,
      params: mockParams,
      query: { current_lti_context_only: false } as ActivityQuery,
    } as unknown as ShowRequest;

    const result = await show(req);

    expect(fetchActivity).toHaveBeenCalledWith(expect.anything(), false);
    if ("body" in result && result.body) {
      expect(result.body.activity).toHaveLength(2);
    }
  });
});
