import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import BookPreviewDialog from "./BookPreviewDialog";
import { useSessionAtom, useLtiContextAtom } from "$store/session";
import type { BookSchema } from "$server/models/book";
import { ThemeProvider, createTheme } from "@mui/material/styles";

vi.mock("$store/session", () => ({
  useSessionAtom: vi.fn(),
  useLtiContextAtom: vi.fn(),
}));

vi.mock("$store/book", () => ({
  useBookAtom: () => ({
    itemIndex: [0, 0],
    nextItemIndex: [0, 1],
    itemExists: vi.fn(),
    updateItemIndex: vi.fn(),
  }),
}));

vi.mock("@mui/material/Dialog", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
}));
vi.mock("@mui/material/Slide", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("$atoms/IconButton", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));
vi.mock("@mui/icons-material/Close", () => ({
  default: () => <span>Close</span>,
}));

describe("BookPreviewDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("別タブでセッションが上書きされていても、現在のタブのコンテキストに基づいて正しくlinked判定されること", () => {
    // 1. バックエンドセッション (別タブの影響をシミュレート)
    // 別のタブでブックID「999」のLTIリンクを開いたため、セッション上のbookIdが999に上書きされている
    vi.mocked(useSessionAtom).mockReturnValue({
      session: {
        ltiResourceLink: {
          bookId: 999,
          consumerId: "other-consumer",
          contextId: "other-context",
        },
      },
    } as unknown as ReturnType<typeof useSessionAtom>);

    // 2. 現在のタブのLTIコンテキスト (修正後の実装が参照する情報)
    // 現在のタブは元々 consumerId: "consumer-A", contextId: "context-A" で開かれている
    vi.mocked(useLtiContextAtom).mockReturnValue({
      ltiConsumerId: "consumer-A",
      ltiContextId: "context-A",
      isLtiContextReady: true,
    } as unknown as ReturnType<typeof useLtiContextAtom>);

    // 3. 対象のブックデータ
    // ブックIDは「1」。このブックは "consumer-A", "context-A" に配信（リンク）されている
    const mockBook = {
      id: 1,
      ltiResourceLinks: [{ consumerId: "consumer-A", contextId: "context-A" }],
    } as unknown as BookSchema;

    const theme = createTheme();
    const html = renderToString(
      <ThemeProvider theme={theme}>
        <BookPreviewDialog book={mockBook} open={true} onClose={vi.fn()}>
          {(props) => (
            <div id="child-content">
              {`Linked status: ${props.linked ? "true" : "false"}`}
            </div>
          )}
        </BookPreviewDialog>
      </ThemeProvider>
    );
    expect(html).toContain("Linked status: true");
  });
});
