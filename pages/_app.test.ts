// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { createStore } from "jotai";
import { ltiContextAtom, syncLtiContext } from "../store/session";
import type { SessionSchema } from "$server/models/session";

describe("pages/_app.tsx URLクエリ優先のLTIコンテキスト同期テスト", () => {
  it("URLクエリが存在する場合、セッション情報ではなくURLクエリのコンテキストを最優先でセットすること", () => {
    const store = createStore();
    const sessionFromBackend = {
      oauthClient: { id: "consumer-1" },
      ltiContext: { id: "context-B" },
    } as unknown as SessionSchema;

    const urlQuery = {
      lti_consumer_id: "consumer-1",
      lti_context_id: "context-A",
    };

    syncLtiContext({
      current: store.get(ltiContextAtom),
      query: urlQuery,
      session: sessionFromBackend,
      pathname: "/book/9",
      setLtiContext: (val) => store.set(ltiContextAtom, val),
    });

    const current = store.get(ltiContextAtom);
    expect(current.ltiContextId).toBe("context-A");
  });

  it("URLクエリが存在せず未初期化の場合のみ、セッション情報をフォールバックとして使用すること", () => {
    const store = createStore();
    const sessionFromBackend = {
      oauthClient: { id: "consumer-1" },
      ltiContext: { id: "context-A" },
    } as unknown as SessionSchema;

    syncLtiContext({
      current: store.get(ltiContextAtom),
      query: {},
      session: sessionFromBackend,
      pathname: "/book/9",
      setLtiContext: (val) => store.set(ltiContextAtom, val),
    });

    const current = store.get(ltiContextAtom);
    expect(current.ltiContextId).toBe("context-A");
  });
});
