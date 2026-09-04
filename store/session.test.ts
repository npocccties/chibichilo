import { createStore } from "jotai";
import {
  vi,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import {
  isLtiContextReadyAtom,
  loadLtiContext,
  ltiContextAtom,
  updateBaseLtiContextAtom,
  updateOverrideLtiContextAtom,
} from "./session";

const createStorageMock = () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
});

const storageMock = createStorageMock();

describe("session.ts の包括的な検証", () => {
  let originalWindow: unknown;
  let originalSessionStorage: unknown;

  beforeAll(() => {
    originalWindow = global.window;
    originalSessionStorage = global.sessionStorage;
    // @ts-expect-error: environment spoofing
    global.window = global;
    // @ts-expect-error: inject mock storage
    global.sessionStorage = storageMock;
  });

  afterAll(() => {
    // @ts-expect-error: cleanup
    global.window = originalWindow;
    // @ts-expect-error: cleanup
    global.sessionStorage = originalSessionStorage;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    storageMock.getItem.mockReturnValue(null);
  });

  describe("LTI Context Atoms (Jotai Store)", () => {
    it("初期状態では、ready判定がfalseになること", () => {
      const store = createStore();
      const isReady = store.get(isLtiContextReadyAtom);
      expect(isReady).toBe(false);
    });

    it("BaseLtiContext を更新すると、ltiContextAtom からその値が取得でき、ready になること", () => {
      const store = createStore();
      store.set(updateBaseLtiContextAtom, {
        ltiConsumerId: "base-consumer",
        ltiContextId: "base-context",
        pathname: "/base",
      });

      const state = store.get(ltiContextAtom);
      expect(state).toEqual({
        ltiConsumerId: "base-consumer",
        ltiContextId: "base-context",
        pathname: "/base",
      });
      expect(store.get(isLtiContextReadyAtom)).toBe(true);
    });

    it("OverrideLtiContext がセットされると、Base の値よりも優先して取得されること", () => {
      const store = createStore();

      // まず Base をセット
      store.set(updateBaseLtiContextAtom, {
        ltiConsumerId: "base-consumer",
        ltiContextId: "base-context",
      });

      // 次に Override をセット (別タブのURLパラメータ等で上書きされた想定)
      store.set(updateOverrideLtiContextAtom, {
        ltiConsumerId: "override-consumer",
        ltiContextId: "override-context",
      });

      // Override の値が優先して返される
      const state = store.get(ltiContextAtom);
      expect(state).toMatchObject({
        ltiConsumerId: "override-consumer",
        ltiContextId: "override-context",
        pathname: null,
      });
      expect(store.get(isLtiContextReadyAtom)).toBe(true);
    });

    it("Override を null でクリアすると、再び Base の値が取得されるようになること", () => {
      const store = createStore();

      store.set(updateBaseLtiContextAtom, {
        ltiConsumerId: "base-consumer",
        ltiContextId: "base-context",
      });
      store.set(updateOverrideLtiContextAtom, {
        ltiConsumerId: "override-consumer",
        ltiContextId: "override-context",
      });

      // オーバーライドを解除
      store.set(updateOverrideLtiContextAtom, null);

      // Base に戻る
      const state = store.get(ltiContextAtom);
      expect(state).toEqual({
        ltiConsumerId: "base-consumer",
        ltiContextId: "base-context",
      });
    });

    it("Override の一部プロパティのみを更新した場合、既存の Override の他のプロパティが維持されること", () => {
      const store = createStore();

      store.set(updateOverrideLtiContextAtom, {
        ltiConsumerId: "override-consumer-1",
        ltiContextId: "override-context-1",
      });

      // contextId だけを更新
      store.set(updateOverrideLtiContextAtom, {
        ltiContextId: "override-context-2",
      });

      const state = store.get(ltiContextAtom);
      expect(state).toMatchObject({
        ltiConsumerId: "override-consumer-1",
        ltiContextId: "override-context-2",
        pathname: null,
      });
    });

    it("値が確定(null)したとき、ready判定がtrueになること", () => {
      const store = createStore();
      // LTI経由でない通常アクセスの場合は null がセットされる
      store.set(updateBaseLtiContextAtom, {
        ltiConsumerId: null,
        ltiContextId: null,
      });
      const state = store.get(ltiContextAtom);
      expect(state.ltiConsumerId).toBeNull();

      // undefined ではない (null である) ため ready とみなす仕様
      expect(store.get(isLtiContextReadyAtom)).toBe(true);
    });
  });

  describe("loadLtiContext() の検証", () => {
    it("引数に storage を渡した場合 (DI)、その内容を正しくパースして返すこと", () => {
      const mockData = {
        ltiConsumerId: "cons-123",
        ltiContextId: "ctx-456",
        pathname: "/bookmark",
      };
      const manualStorage = createStorageMock();
      manualStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = loadLtiContext(manualStorage);

      expect(result).toEqual(mockData);
      expect(manualStorage.getItem).toHaveBeenCalledWith("ltiContext");
      expect(storageMock.getItem).not.toHaveBeenCalled();
    });

    it("引数なしで呼んだ場合、捏造した window.sessionStorage を使用すること", () => {
      const mockData = { pathname: "/from-window" };
      storageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = loadLtiContext();

      expect(result).toMatchObject(mockData);
      expect(storageMock.getItem).toHaveBeenCalledWith("ltiContext");
    });

    it("storage が空(null)を返す場合、undefined を返すこと", () => {
      const manualStorage = createStorageMock();
      manualStorage.getItem.mockReturnValue(null);
      expect(loadLtiContext(manualStorage)).toBeUndefined();
    });

    it("JSONのパースに失敗した場合、undefined を返すこと", () => {
      const manualStorage = createStorageMock();
      manualStorage.getItem.mockReturnValue("invalid-json");
      expect(loadLtiContext(manualStorage)).toBeUndefined();
    });
  });
});
