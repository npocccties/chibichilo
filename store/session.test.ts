import { createStore } from "jotai";
import {
  isLtiContextReadyAtom,
  loadLtiContext,
  ltiContextAtom,
  updateLtiContextAtom,
} from "./session";

const createStorageMock = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
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
    jest.clearAllMocks();
    storageMock.getItem.mockReturnValue(null);
  });

  describe("LTI Context Atoms (Jotai Store)", () => {
    it("初期状態では、ready判定がfalseになること", () => {
      const store = createStore();
      const isReady = store.get(isLtiContextReadyAtom);
      expect(isReady).toBe(false);
    });

    it("値が確定したとき、ready判定がtrueになること", async () => {
      const store = createStore();
      store.set(updateLtiContextAtom, {
        ltiConsumerId: "test",
        ltiContextId: "ctx",
      });
      const isReady = store.get(isLtiContextReadyAtom);
      expect(isReady).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(storageMock.setItem).toHaveBeenCalledWith(
        "ltiContext",
        expect.stringContaining('"ltiConsumerId":"test"')
      );
    });

    it("updateLtiContextAtom で値が確定(null)したとき、ready判定がtrueになること", () => {
      const store = createStore();
      store.set(updateLtiContextAtom, {
        ltiConsumerId: null,
        ltiContextId: null,
      });
      const state = store.get(ltiContextAtom);
      expect(state.ltiConsumerId).toBeNull();
      const isReady = store.get(isLtiContextReadyAtom);
      expect(isReady).toBe(true);
    });

    it("片方のプロパティだけが更新された場合、もう一方はnullに補完され、ready判定はtrueになる", () => {
      const store = createStore();
      store.set(updateLtiContextAtom, { ltiConsumerId: "test-consumer" });
      const state = store.get(ltiContextAtom);

      expect(state.ltiConsumerId).toBe("test-consumer");
      expect(state.ltiContextId).toBe(null);
      expect(store.get(isLtiContextReadyAtom)).toBe(true);
    });
  });

  describe("ltiContextAtom の検証", () => {
    it("pathname をセットした場合、正しく保持されること", () => {
      const store = createStore();
      store.set(updateLtiContextAtom, {
        ltiConsumerId: "test-consumer",
        ltiContextId: "test-context",
        pathname: "/bookmark",
      });
      const state = store.get(ltiContextAtom);
      expect(state).toMatchObject({ pathname: "/bookmark" });
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
