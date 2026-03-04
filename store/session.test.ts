import { createStore } from "jotai";
import {
  isLtiContextReadyAtom,
  ltiContextAtom,
  updateLtiContextAtom,
} from "./session";

const storageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, "sessionStorage", {
  value: storageMock,
  writable: true,
});

describe("LTI Context Atoms (Jotai Store)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storageMock.getItem.mockReturnValue(null);
  });

  it("初期状態では、ready判定がfalseになること", () => {
    const store = createStore();
    const isReady = store.get(isLtiContextReadyAtom);
    expect(isReady).toBe(false);
  });

  it("値が確定したとき、ready判定がtrueになること", () => {
    const store = createStore();
    store.set(updateLtiContextAtom, {
      ltiConsumerId: "test",
      ltiContextId: "ctx",
    });
    const isReady = store.get(isLtiContextReadyAtom);
    expect(isReady).toBe(true);
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

  it("片方のプロパティだけが更新された場合、もう一方はnullに補完され、ready判定はtrueになる(現在の動作仕様)", () => {
    const store = createStore();

    // ltiConsumerId だけ更新
    store.set(updateLtiContextAtom, {
      ltiConsumerId: "test-consumer",
    });
    const state = store.get(ltiContextAtom);

    // 現在の実装では、指定しなかった方は強制的に null になる
    expect(state.ltiConsumerId).toBe("test-consumer");
    expect(state.ltiContextId).toBe(null);

    // その結果、判定は true になる
    const isReady = store.get(isLtiContextReadyAtom);
    expect(isReady).toBe(true);
  });
});
