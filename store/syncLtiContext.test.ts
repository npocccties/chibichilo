// @vitest-environment jsdom

import { describe, it, expect, vi } from "vitest";
import { syncLtiContext } from "./session";
import type { SessionSchema } from "$server/models/session";
import type { LtiContextState } from "./session";

describe("pages/_app.tsx URLクエリ優先のLTIコンテキスト同期テスト", () => {
  it("コンテキストが未初期化の場合、セッション情報をフォールバックとして使用すること", () => {
    const baseLtiContext: LtiContextState = {
      ltiConsumerId: undefined,
      ltiContextId: undefined,
      pathname: undefined,
    };

    const sessionFromBackend = {
      oauthClient: { id: "consumer-1" },
      ltiContext: { id: "context-B" },
    } as unknown as SessionSchema;

    const setBaseLtiContextMock = vi.fn();

    syncLtiContext({
      baseLtiContext,
      session: sessionFromBackend,
      pathname: "/book/9",
      setBaseLtiContext: setBaseLtiContextMock,
    });

    // expect.objectContaining を使用してオブジェクトを検証
    expect(setBaseLtiContextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ltiConsumerId: "consumer-1",
        ltiContextId: "context-B",
        pathname: "/book/9",
      })
    );
  });

  it("コンテキストがすでに初期化済みの場合は、セッション情報での上書きを行わないこと", () => {
    const baseLtiContext: LtiContextState = {
      ltiConsumerId: "consumer-1",
      ltiContextId: "context-A",
      pathname: "/book/9",
    };

    const sessionFromBackend = {
      oauthClient: { id: "consumer-1" },
      ltiContext: { id: "context-B" },
    } as unknown as SessionSchema;

    const setBaseLtiContextMock = vi.fn();

    syncLtiContext({
      baseLtiContext,
      session: sessionFromBackend,
      pathname: "/book/9",
      setBaseLtiContext: setBaseLtiContextMock,
    });

    expect(setBaseLtiContextMock).not.toHaveBeenCalled();
  });
});
