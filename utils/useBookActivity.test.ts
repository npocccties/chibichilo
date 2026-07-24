import useBookActivity, { checkIsReady } from "./useBookActivity";
import useSWR, { type SWRResponse } from "swr";
import type { ActivitySchema } from "$server/models/activity";
import type { SessionSchema } from "$server/models/session";
import { useLtiContextAtom, useSessionAtom } from "$store/session";
import { useActivityAtom } from "$store/activity";
import { isInstructor } from "./session";
import { api } from "$utils/api";

type MockSession = {
  session: {
    user?: Partial<SessionSchema["user"]>;
  };
};
const mockUseSessionAtom = useSessionAtom as unknown as jest.Mock<MockSession>;

type MockLtiContext = Pick<
  ReturnType<typeof useLtiContextAtom>,
  "isLtiContextReady" | "ltiConsumerId" | "ltiContextId"
>;
const mockUseLtiContextAtom =
  useLtiContextAtom as unknown as jest.Mock<MockLtiContext>;

type MockSWR = Pick<
  SWRResponse<ActivitySchema[], Error>,
  "data" | "error" | "mutate" | "isValidating" | "isLoading"
>;

const mockUseSWR = useSWR as unknown as jest.Mock<MockSWR>;

jest.mock("swr");
jest.mock("$store/session");
jest.mock("$store/activity");
jest.mock("./session", () => ({
  isInstructor: jest.fn(),
}));
jest.mock("$utils/api");

describe("useBookActivity の準備状態（isReady）ロジックの検証", () => {
  it("全ての条件が揃っている場合、Ready（true）になること", () => {
    const result = checkIsReady({
      isLearner: true,
      bookId: 100,
      isLtiContextReady: true,
    });
    expect(result).toBe(true);
  });

  it("教員（isLearner: false）の場合は、Ready にならないこと", () => {
    const result = checkIsReady({
      isLearner: false,
      bookId: 100,
      isLtiContextReady: true,
    });
    expect(result).toBe(false);
  });

  it("LTIコンテキストが準備中（isLtiContextReady: false）の間は、Ready にならないこと", () => {
    const result = checkIsReady({
      isLearner: true,
      bookId: 100,
      isLtiContextReady: false,
    });
    expect(result).toBe(false);
  });

  it("ブックIDが不正（undefined）な場合は、Ready にならないこと", () => {
    const result = checkIsReady({
      isLearner: true,
      bookId: undefined,
      isLtiContextReady: true,
    });
    expect(result).toBe(false);
  });

  it("学習者判定が不確定（null/undefined）な場合は、Ready にならないこと", () => {
    const result = checkIsReady({
      isLearner: undefined,
      bookId: 100,
      isLtiContextReady: true,
    });
    expect(result).toBe(false);
  });

  it.each([
    ["空文字", "" as const],
    ["数値の0", 0 as const],
    ["null", null],
  ])("学習者判定が %s の場合は、Ready（false）にならないこと", (_, value) => {
    const result = checkIsReady({
      // 型定義 boolean | "" | 0 | undefined | null に適合
      isLearner: value as "" | 0 | null,
      bookId: 100,
      isLtiContextReady: true,
    });
    expect(result).toBe(false);
  });

  describe("useBookActivity 統合検証 (Hooks Logic)", () => {
    const mockBookId = 123;

    beforeEach(() => {
      jest.clearAllMocks();
      const mockResponse = {
        data: undefined,
        error: undefined,
        isValidating: false,
        isLoading: false,
        mutate: jest.fn(),
      } as SWRResponse;
      mockUseSWR.mockReturnValue(mockResponse);
    });

    it("isReady が true のとき、正しいキーで useSWR が呼び出されること", () => {
      mockUseSessionAtom.mockReturnValue({
        session: { user: { id: 1 } },
      });
      mockUseLtiContextAtom.mockReturnValue({
        ltiConsumerId: "cons-1",
        ltiContextId: "ctx-1",
        isLtiContextReady: true,
      });
      jest.mocked(isInstructor).mockReturnValue(false);

      useBookActivity(mockBookId);
      expect(useSWR).toHaveBeenCalledWith(
        expect.objectContaining({
          bookId: mockBookId,
          ltiConsumerId: "cons-1",
          ltiContextId: "ctx-1",
        }),
        expect.any(Function), // fetcher: updateBookActivity
        expect.any(Object) // options
      );
    });

    it("isReady が false のとき、useSWR の第一引数が null になること", () => {
      mockUseLtiContextAtom.mockReturnValue({
        isLtiContextReady: false,
        ltiConsumerId: undefined,
        ltiContextId: undefined,
      });
      useBookActivity(mockBookId);
      expect(useSWR).toHaveBeenCalledWith(
        null,
        expect.any(Function),
        expect.any(Object)
      );
    });

    it("SWR から返ったデータが useActivityAtom に渡されること", () => {
      const mockData = [
        { topic: { id: 1 }, completed: true },
      ] as ActivitySchema[];
      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });
      useBookActivity(mockBookId);
      expect(useActivityAtom).toHaveBeenCalledWith(mockData);
    });
  });
});

describe("updateBookActivity (fetcher logic) の検証", () => {
  const mockBookId = 123;

  const useGetUpdateBookActivity = () => {
    useBookActivity(mockBookId);
    const call = 0;
    const arg = 1;
    return jest.mocked(useSWR).mock.calls[call][arg] as (
      args: Record<string, unknown>
    ) => Promise<{ activity: unknown[] } | undefined>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("LTI ID が null の場合、API クライアントには undefined として渡されること", async () => {
    const updateBookActivity = useGetUpdateBookActivity();
    const mockResponse: Awaited<
      ReturnType<typeof api.apiV2BookBookIdActivityPut>
    > = {
      activity: [],
    };
    const spy = jest
      .spyOn(api, "apiV2BookBookIdActivityPut")
      .mockResolvedValue(mockResponse);

    await updateBookActivity({
      bookId: mockBookId,
      ltiConsumerId: null,
      ltiContextId: null,
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        ltiConsumerId: undefined,
        ltiContextId: undefined,
      })
    );
  });

  it("LTI ID が存在する場合、その値が API クライアントにそのまま渡されること", async () => {
    const updateBookActivity = useGetUpdateBookActivity();
    const mockResponse: Awaited<
      ReturnType<typeof api.apiV2BookBookIdActivityPut>
    > = {
      activity: [],
    };
    const spy = jest
      .spyOn(api, "apiV2BookBookIdActivityPut")
      .mockResolvedValue(mockResponse);

    await updateBookActivity({
      bookId: mockBookId,
      ltiConsumerId: "cons-123",
      ltiContextId: "ctx-456",
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        ltiConsumerId: "cons-123",
        ltiContextId: "ctx-456",
      })
    );
  });

  it("bookId が undefined の場合、API を呼び出さずに終了すること", async () => {
    const updateBookActivity = useGetUpdateBookActivity();
    const spy = jest.spyOn(api, "apiV2BookBookIdActivityPut");

    const result = await updateBookActivity({
      bookId: undefined,
      ltiConsumerId: "cons",
      ltiContextId: "ctx",
    });

    expect(result).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });
});
