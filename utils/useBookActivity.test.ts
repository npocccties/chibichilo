import useBookActivity, { checkIsReady } from "./useBookActivity";
import useSWR, { type SWRResponse } from "swr";
import type { ActivitySchema } from "$server/models/activity";
import { useLtiContextAtom, useSessionAtom } from "$store/session";
import { useActivityAtom } from "$store/activity";
import { isInstructor } from "./session";
import { api } from "$utils/api";
import { vi } from "vitest";

const mockUseSessionAtom = vi.mocked(useSessionAtom);
const mockUseLtiContextAtom = vi.mocked(useLtiContextAtom);
const mockUseSWR = vi.mocked(useSWR);

vi.mock("swr");
vi.mock("$store/session");
vi.mock("$store/activity");
vi.mock("./session", () => ({
  isInstructor: vi.fn(),
}));
vi.mock("$utils/api");

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
      isLearner: value as "" | 0 | null,
      bookId: 100,
      isLtiContextReady: true,
    });
    expect(result).toBe(false);
  });

  describe("useBookActivity 統合検証 (Hooks Logic)", () => {
    const mockBookId = 123;

    beforeEach(() => {
      vi.clearAllMocks();
      const mockResponse = {
        data: undefined,
        error: undefined,
        isValidating: false,
        isLoading: false,
        mutate: vi.fn(),
      } as SWRResponse;
      mockUseSWR.mockReturnValue(mockResponse);
    });

    it("isReady が true のとき、正しいキーで useSWR が呼び出されること", () => {
      mockUseSessionAtom.mockReturnValue({
        session: { user: { id: 1 } },
      } as ReturnType<typeof useSessionAtom>);
      mockUseLtiContextAtom.mockReturnValue({
        ltiConsumerId: "cons-1",
        ltiContextId: "ctx-1",
        isLtiContextReady: true,
      });
      vi.mocked(isInstructor).mockReturnValue(false);

      useBookActivity(mockBookId);
      expect(useSWR).toHaveBeenCalledWith(
        expect.objectContaining({
          bookId: mockBookId,
          ltiConsumerId: "cons-1",
          ltiContextId: "ctx-1",
        }),
        expect.any(Function),
        expect.any(Object)
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
        mutate: vi.fn(),
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
    return vi.mocked(useSWR).mock.calls[call][arg] as (
      args: Record<string, unknown>
    ) => Promise<{ activity: unknown[] } | undefined>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("LTI ID が null の場合、API クライアントには undefined として渡されること", async () => {
    const updateBookActivity = useGetUpdateBookActivity();
    const mockResponse: Awaited<
      ReturnType<typeof api.apiV2BookBookIdActivityPut>
    > = {
      activity: [],
    };
    const spy = vi
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
    const spy = vi
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
    const spy = vi.spyOn(api, "apiV2BookBookIdActivityPut");

    const result = await updateBookActivity({
      bookId: undefined,
      ltiConsumerId: "cons",
      ltiContextId: "ctx",
    });

    expect(result).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });
});
