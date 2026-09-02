import { describe, it, expect } from "vitest";
import { isDisplayableBook } from "./displayableBook";

describe("isDisplayableBook", () => {
  const defaultBook = {
    id: 1,
    shared: false,
    authors: [],
    release: { shared: false },
    ltiContextBookAccesses: [],
  };
  const defaultLink = {
    bookId: 1,
    creatorId: 1,
    consumerId: "consumer1",
    contextId: "context1",
  };

  it("【管理者/作成者】編集権限があれば、配信停止のコースでも閲覧(true)できること", () => {
    const book = {
      ...defaultBook,
      // 配信停止設定
      ltiContextBookAccesses: [
        {
          bookId: 1,
          consumerId: "consumer1",
          contextId: "context1",
          allowViewing: false,
        },
      ],
    };
    // isContentEditable が true を返すモックを渡す
    const result = isDisplayableBook(book, () => true, defaultLink);
    expect(result).toBe(true);
  });

  it("【受講生】現在のLTIコンテキストで配信停止(allowViewing: false)なら閲覧不可(false)になること", () => {
    const book = {
      ...defaultBook,
      ltiContextBookAccesses: [
        {
          bookId: 1,
          consumerId: "consumer1",
          contextId: "context1",
          allowViewing: false,
        },
      ],
    };
    // 編集権限なし (false)
    const result = isDisplayableBook(book, () => false, defaultLink);
    expect(result).toBe(false);
  });

  it("【受講生】別のコースが配信停止でも、現在のコースが許可されていてリンクされていれば閲覧(true)できること", () => {
    const book = {
      ...defaultBook,
      ltiContextBookAccesses: [
        // context2 は配信停止だが、アクセスしているのは context1
        {
          bookId: 1,
          consumerId: "consumer1",
          contextId: "context2",
          allowViewing: false,
        },
      ],
    };
    const result = isDisplayableBook(book, () => false, defaultLink);
    expect(result).toBe(true); // defaultLinkのbookIdと一致しているためtrue
  });

  it("【受講生】リクエストのクエリ(currentLtiContext)のコンテキスト情報が優先して判定されること", () => {
    const book = {
      ...defaultBook,
      ltiContextBookAccesses: [
        {
          bookId: 1,
          consumerId: "consumer1",
          contextId: "context-override",
          allowViewing: false,
        },
      ],
    };
    // currentLtiContext としてオーバーライドされた情報を渡す
    const currentLtiContext = {
      ltiConsumerId: "consumer1",
      ltiContextId: "context-override",
    };
    const result = isDisplayableBook(
      book,
      () => false,
      defaultLink,
      undefined,
      currentLtiContext
    );
    expect(result).toBe(false);
  });

  it("【受講生: シナリオE】全体シェア(release.shared)されていても、現在のコースで配信停止なら閲覧不可(false)になること", () => {
    const book = {
      ...defaultBook,
      release: { shared: true }, // 全体シェアを有効化
      ltiContextBookAccesses: [
        // 現在のコースでは配信停止
        {
          bookId: 1,
          consumerId: "consumer1",
          contextId: "context1",
          allowViewing: false,
        },
      ],
    };
    // 編集権限なし、対象のコース(context1)からアクセス
    const result = isDisplayableBook(book, () => false, defaultLink);
    expect(result).toBe(false);
  });

  it("【受講生: シナリオF】クエリ(currentLtiContext)が空でも、セッション(ltiResourceLink)のコースが配信停止なら閲覧不可(false)になること", () => {
    const book = {
      ...defaultBook,
      ltiContextBookAccesses: [
        {
          bookId: 1,
          consumerId: "consumer1",
          contextId: "context1",
          allowViewing: false,
        },
      ],
    };
    // currentLtiContext を意図的に undefined（空）として渡す
    const result = isDisplayableBook(
      book,
      () => false,
      defaultLink,
      undefined,
      undefined
    );
    expect(result).toBe(false);
  });

  it("【受講生】配信停止設定がなく、全体シェア(release.shared)されていれば閲覧(true)できること", () => {
    const book = {
      ...defaultBook,
      release: { shared: true },
    };
    // リンクされていない(bookIdが違う)が、シェアされている
    const result = isDisplayableBook(book, () => false, {
      ...defaultLink,
      bookId: 999,
    });
    expect(result).toBe(true);
  });

  it("【受講生】権限なし、リンクなし、シェアなし、パブリックでもない場合は閲覧不可(false)になること", () => {
    const book = { ...defaultBook };
    const result = isDisplayableBook(book, () => false, {
      ...defaultLink,
      bookId: 999,
    });
    expect(result).toBe(false);
  });
});
