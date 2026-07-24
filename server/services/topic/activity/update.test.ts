import { update } from "./update";
import topicExists from "$server/utils/topic/topicExists";
import upsertLtiContextActivity from "$server/utils/activity/upsertLtiContextActivity";
import upsertTopicActivity from "$server/utils/activity/upsertTopicActivity";
import type { FastifyRequest } from "fastify";
import type { TopicParams } from "$server/validators/topicParams";
import type { TopicActivityQuery } from "$server/validators/topicActivityQuery";
import type { ActivityProps } from "$server/validators/activityProps";

jest.mock("$server/utils/topic/topicExists");
jest.mock("$server/utils/activity/upsertLtiContextActivity");
jest.mock("$server/utils/activity/upsertTopicActivity");
jest.mock("$server/utils/prisma", () => ({
  __esModule: true,
}));

describe("update() - トピック活動履歴の更新", () => {
  type UpdateRequest = FastifyRequest<{
    Params: TopicParams;
    Querystring: TopicActivityQuery;
    Body: ActivityProps;
  }>;

  type TopicExistsResult = Awaited<ReturnType<typeof topicExists>>;
  type UpsertResult = Awaited<ReturnType<typeof upsertTopicActivity>>;

  const mockSession = {
    user: { id: 1 },
    oauthClient: { id: "session-consumer-id" },
    ltiContext: { id: "session-context-id" },
    ltiResourceLink: { bookId: 100 },
  };

  const mockParams: TopicParams = { topic_id: 1 };

  const mockBody: ActivityProps = {
    timeRanges: [{ startMs: 0, endMs: 10 }],
  };

  const mockTopicFound = { id: 1 } as unknown as TopicExistsResult;
  const mockUpsertResult = {
    id: 1,
    ...mockBody,
  } as unknown as UpsertResult;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(topicExists).mockResolvedValue(mockTopicFound);
  });

  it("リソースリンク経由（LTIセッション中）: book_id が一致しクエリが空なら、セッション情報を使用すること", async () => {
    const req = {
      session: mockSession,
      params: mockParams,
      query: { book_id: 100 },
      body: mockBody,
    } as unknown as UpdateRequest;

    jest.mocked(upsertLtiContextActivity).mockResolvedValue(mockUpsertResult);
    jest.mocked(upsertTopicActivity).mockResolvedValue(mockUpsertResult);

    await update(req);

    expect(upsertLtiContextActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: 100,
        ltiConsumerId: "session-consumer-id",
        ltiContextId: "session-context-id",
      })
    );
  });

  it("ブックマーク経由: クエリにコンテキストIDがある場合、セッション情報よりもクエリを優先すること", async () => {
    const req = {
      session: mockSession,
      params: mockParams,
      query: {
        book_id: 100,
        lti_consumer_id: "query-consumer-id",
        lti_context_id: "query-context-id",
      },
      body: mockBody,
    } as unknown as UpdateRequest;

    jest.mocked(upsertLtiContextActivity).mockResolvedValue(mockUpsertResult);
    jest.mocked(upsertTopicActivity).mockResolvedValue(mockUpsertResult);

    await update(req);

    expect(upsertLtiContextActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        ltiConsumerId: "query-consumer-id",
        ltiContextId: "query-context-id",
      })
    );
  });

  it("トピックが存在しない場合、404を返すこと", async () => {
    jest.mocked(topicExists).mockResolvedValue(null);

    const req = {
      session: mockSession,
      params: mockParams,
      query: { book_id: 100 },
      body: mockBody,
    } as unknown as UpdateRequest;

    const result = await update(req);
    expect(result.status).toBe(404);
  });

  it("セッションと異なる book_id かつコンテキスト指定がない場合、LTI保存をスキップすること", async () => {
    const req = {
      session: mockSession,
      params: mockParams,
      query: { book_id: 200 },
      body: mockBody,
    } as unknown as UpdateRequest;

    const result = await update(req);

    expect(upsertLtiContextActivity).not.toHaveBeenCalled();
    expect(result.status).toBe(400);
  });
});
