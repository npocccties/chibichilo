import upsertActivity from "./upsertActivity";
import prisma from "$server/utils/prisma";

jest.mock("$server/utils/prisma", () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn((promises) => Promise.all(promises)),
    activity: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    topic: {
      findUnique: jest.fn(),
    },
    activityTimeRange: {
      deleteMany: jest.fn(),
    },
    activityTimeRangeLog: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    activityTimeRangeCount: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("upsertActivity() - DB操作の整合性検証", () => {
  const mockProps = {
    learnerId: 1,
    bookId: 100,
    topicId: 1,
    ltiConsumerId: "consumer-id",
    ltiContextId: "context-id",
    activity: {
      timeRanges: [{ startMs: 0, endMs: 10 }],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("LTIコンテキスト情報がある場合、渡された bookId (100) で upsert されること", async () => {
    jest.mocked(prisma.activity.findUnique).mockResolvedValue(null);

    await upsertActivity(mockProps);

    expect(prisma.activity.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          bookId_topicId_learnerId_ltiConsumerId_ltiContextId:
            expect.objectContaining({
              bookId: 100, // 正しい ID
              ltiConsumerId: "consumer-id",
              ltiContextId: "context-id",
            }),
        },
        create: expect.objectContaining({
          bookId: 100,
        }),
      })
    );
  });

  it("LTIコンテキスト情報が欠けている場合、bookId: 0 として upsert されること", async () => {
    jest.mocked(prisma.activity.findUnique).mockResolvedValue(null);

    await upsertActivity({
      ...mockProps,
      ltiConsumerId: "", // コンテキスト情報なし
      ltiContextId: "",
    });

    expect(prisma.activity.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          bookId_topicId_learnerId_ltiConsumerId_ltiContextId:
            expect.objectContaining({
              bookId: 0, // 匿名/非LTI扱いの ID
            }),
        },
        create: expect.objectContaining({
          bookId: 0,
        }),
      })
    );
  });
});
