import { update } from "./update";
import { show } from "./show";
import { getGradeTargets } from "$server/utils/ltiv1p3/getGradeTargets";
import { publishScore } from "$server/utils/ltiv1p3/grade";
import findBook from "$server/utils/book/findBook";
import findClient from "$server/utils/ltiv1p3/findClient";
import type { FastifyRequest } from "fastify";
import type { BookParams } from "$server/validators/bookParams";
import type { ActivityQuery } from "$server/validators/activityQuery";
import type { ActivitySchema } from "$server/models/activity";
import type { BookSchema } from "$server/models/book";
import { getDisplayableBook } from "$server/utils/displayableBook";

type ClientType = NonNullable<Awaited<ReturnType<typeof findClient>>>;
type ShowResponse = Awaited<ReturnType<typeof show>>;

jest.mock("./show");
jest.mock("$server/utils/ltiv1p3/getGradeTargets");
jest.mock("$server/utils/ltiv1p3/grade");
jest.mock("$server/utils/book/findBook");
jest.mock("$server/utils/ltiv1p3/findClient");
jest.mock("$server/utils/displayableBook", () => ({
  getDisplayableBook: jest.fn(() => ({
    sections: [{ topics: [{ id: 101 }, { id: 102 }] }],
  })),
}));
jest.mock("$server/utils/prisma", () => ({ __esModule: true }));

const createMockTopic = (
  overrides: Partial<ActivitySchema["topic"]>
): ActivitySchema["topic"] => ({
  id: 0,
  name: "Default Topic",
  timeRequired: 0,
  ...overrides,
});

const createMockBook = (overrides: Partial<BookSchema>): BookSchema => ({
  id: 0,
  name: "Test Book",
  description: "",
  language: "ja",
  timeRequired: null,
  shared: false,
  license: "",
  licenser: "",
  zoomMeetingId: null,
  ltiResourceLinks: [],
  keywords: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date(),
  authors: [],
  sections: [],
  details: {},
  ...overrides,
});

const createMockActivity = (
  overrides: Partial<Omit<ActivitySchema, "topic">> & {
    topic?: Partial<ActivitySchema["topic"]>;
  }
): ActivitySchema => ({
  id: 0,
  bookId: 0,
  completed: false,
  totalTimeMs: 0,
  timeRanges: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  learner: {
    id: 1,
    name: "test learner",
    email: "test@example.com",
    ltiUserId: "user-A",
    ltiConsumerId: "consumer-A",
  },
  ...overrides,
  topic: createMockTopic(overrides.topic ?? {}),
});

describe("update() - LTI成績送信ロジックの検証", () => {
  type UpdateRequest = FastifyRequest<{
    Params: BookParams;
    Querystring: ActivityQuery;
  }>;

  const mockReq = {
    params: { book_id: 1 } as BookParams,
    query: {
      lti_context_id: "context-A",
      lti_consumer_id: "consumer-A",
    } as ActivityQuery,
    session: {
      ltiVersion: "1.3.0",
      user: { id: 1, ltiUserId: "user-LTI-ID" },
      oauthClient: { id: "consumer-session" },
      ltiContext: { id: "context-session" },
    },
    log: { error: jest.fn() },
  } as unknown as UpdateRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(findBook).mockResolvedValue(createMockBook({ id: 1 }));
    jest
      .mocked(findClient)
      .mockResolvedValue({ id: "client-id" } as unknown as ClientType);
  });

  it("クエリで指定されたコンテキストの活動内容に基づいて成績を算出し、正しい宛先に送信すること", async () => {
    jest.mocked(show).mockResolvedValue({
      status: 200,
      body: {
        activity: [createMockActivity({ topic: { id: 101 }, completed: true })],
      },
    } as ShowResponse);
    jest.mocked(getGradeTargets).mockResolvedValue([
      {
        consumerId: "consumer-A",
        contextId: "context-A",
        lineItem: "url-A",
        label: "",
      },
    ]);

    await update(mockReq);

    expect(publishScore).toHaveBeenCalledWith(
      expect.anything(),
      "url-A",
      expect.objectContaining({ scoreGiven: 1, scoreMaximum: 2 })
    );
  });

  it("リソースリンク由来とブックマーク由来のターゲットが共存する場合、その両方に送信すること", async () => {
    jest.mocked(show).mockResolvedValue({
      status: 200,
      body: {
        activity: [createMockActivity({ topic: { id: 101 }, completed: true })],
      },
    } as ShowResponse);

    const mockTargets = [
      { consumerId: "LMS-A", contextId: "ctx-A", lineItem: "url-A", label: "" },
      { consumerId: "LMS-B", contextId: "ctx-B", lineItem: "url-B", label: "" },
    ];
    jest.mocked(getGradeTargets).mockResolvedValue(mockTargets);

    await update(mockReq);

    expect(publishScore).toHaveBeenCalledTimes(2);
    expect(publishScore).toHaveBeenCalledWith(
      expect.anything(),
      "url-A",
      expect.anything()
    );
    expect(publishScore).toHaveBeenCalledWith(
      expect.anything(),
      "url-B",
      expect.anything()
    );
  });

  it("送信失敗時にエラーログを記録し、他の送信を継続すること", async () => {
    const mockTargets = [
      { consumerId: "L1", contextId: "ctx-OK", lineItem: "url-OK", label: "" },
      {
        consumerId: "L2",
        contextId: "ctx-FAIL",
        lineItem: "url-FAIL",
        label: "",
      },
    ];
    jest.mocked(getGradeTargets).mockResolvedValue(mockTargets);
    jest
      .mocked(publishScore)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("LTI Error"));

    await update(mockReq);

    expect(mockReq.log.error).toHaveBeenCalledWith(
      expect.any(Error),
      expect.stringContaining("ctx-FAIL")
    );
    expect(publishScore).toHaveBeenCalledTimes(2);
  });

  it("コンテキストごとのトピック構成に応じた満点を算出すること", async () => {
    jest.mocked(getDisplayableBook).mockReturnValue({
      sections: [{ topics: [{ id: 101 }, { id: 102 }, { id: 103 }] }],
    } as ReturnType<typeof getDisplayableBook>);

    jest.mocked(show).mockResolvedValue({
      status: 200,
      body: {
        activity: [createMockActivity({ topic: { id: 101 }, completed: true })],
      },
    } as ShowResponse);

    await update(mockReq);

    expect(publishScore).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ scoreGiven: 1, scoreMaximum: 3 })
    );
  });
});
