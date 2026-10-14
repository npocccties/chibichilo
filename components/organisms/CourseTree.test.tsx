import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
// @ts-expect-error: Ignored because there is no type definition.
import { renderToString } from "react-dom/server";
import CourseTree from "./CourseTree";
import { useSessionAtom, useLtiContextAtom } from "$store/session";
import type { LtiContextSchema } from "$server/models/ltiContext";
import type { LinkSchema } from "$server/models/link/content";

vi.mock("$store/session", () => ({
  useSessionAtom: vi.fn(),
  useLtiContextAtom: vi.fn(),
}));

vi.mock("@mui/lab/TreeView", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@mui/lab/TreeItem", () => ({
  default: ({ label }: { label: React.ReactNode }) => <div>{label}</div>,
}));
vi.mock("$atoms/PreviewButton", () => ({
  default: () => <button data-testid="preview-button">プレビュー</button>,
}));
vi.mock("$atoms/EditButton", () => ({
  default: () => <button data-testid="edit-button">編集</button>,
}));
vi.mock("$atoms/SharedIndicator", () => ({
  default: () => <span>[共有]</span>,
}));
vi.mock("$atoms/DescriptionList", () => ({
  default: () => <div>DescriptionList</div>,
}));
vi.mock("./Accordion", () => ({
  default: ({ details }: { details: React.ReactNode }) => <div>{details}</div>,
}));

const mockLtiContext: LtiContextSchema = {
  id: "context-CURRENT",
  title: "現在のコース",
  label: "Test-101",
};

const mockLinks: LinkSchema[] = [
  {
    id: 1,
    oauthClientId: "consumer-A",
    ltiContext: mockLtiContext,
    ltiResourceLink: { id: "link-1", title: "現在のコースのリンク" },
    book: { id: 101, name: "現在のコースのブック", shared: false, authors: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as LinkSchema,
  {
    id: 2,
    oauthClientId: "consumer-A",
    ltiContext: {
      id: "context-OTHER",
      title: "過去のコース",
      label: "Test-099",
    },
    ltiResourceLink: { id: "link-2", title: "過去のコースのリンク" },
    book: { id: 102, name: "過去のコースのブック", shared: false, authors: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as LinkSchema,
];

describe("CourseTree におけるプレビューボタンの表示制御", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("【学生】現在のタブのコンテキストと一致するブックのみプレビューボタンが表示されること（別タブのセッションは無視される）", () => {
    // 1. バックエンドセッション (別タブの影響をシミュレート)
    // 別タブで "context-OTHER" を開いたため、バックエンドセッションが上書きされている
    vi.mocked(useSessionAtom).mockReturnValue({
      session: {
        ltiResourceLink: {
          bookId: 102,
          consumerId: "consumer-A",
          contextId: "context-OTHER",
        },
      },
      isInstructor: false,
    } as unknown as ReturnType<typeof useSessionAtom>);

    // 2. 現在のタブのLTIコンテキスト (修正後の実装が参照する情報)
    // 現在のタブは "context-CURRENT" で開かれている
    vi.mocked(useLtiContextAtom).mockReturnValue({
      ltiConsumerId: "consumer-A",
      ltiContextId: "context-CURRENT",
      isLtiContextReady: true,
    } as unknown as ReturnType<typeof useLtiContextAtom>);

    const html = renderToString(
      <CourseTree
        ltiContext={mockLtiContext}
        links={mockLinks}
        selected={new Set()}
        select={vi.fn()}
        onTreeChange={vi.fn()}
        onBookPreviewClick={vi.fn()}
        onBookEditClick={vi.fn()}
        isContentEditable={() => false} // 学生（編集権限なし）
      />
    );
    // 現在のコースのブック名の直後にプレビューボタンがレンダリングされているか
    expect(html).toMatch(
      /現在のコースのブック.*<button data-testid="preview-button">プレビュー<\/button>/
    );
    // 過去のコースのブック名の後には、プレビューボタンが存在しないか
    expect(html).not.toMatch(
      /過去のコースのブック.*<button data-testid="preview-button">プレビュー<\/button>/
    );
  });

  it("【教員】コンテキストに関わらず、すべてのブックにプレビューボタンが表示されること", () => {
    vi.mocked(useSessionAtom).mockReturnValue({
      session: {},
      isInstructor: true,
    } as unknown as ReturnType<typeof useSessionAtom>);
    vi.mocked(useLtiContextAtom).mockReturnValue({
      ltiConsumerId: "consumer-A",
      ltiContextId: "context-CURRENT",
      isLtiContextReady: true,
    } as unknown as ReturnType<typeof useLtiContextAtom>);

    const html = renderToString(
      <CourseTree
        ltiContext={mockLtiContext}
        links={mockLinks}
        selected={new Set()}
        select={vi.fn()}
        onTreeChange={vi.fn()}
        onBookPreviewClick={vi.fn()}
        onBookEditClick={vi.fn()}
        isContentEditable={() => true}
      />
    );
    expect(html).toMatch(
      /現在のコースのブック.*<button data-testid="preview-button">プレビュー<\/button>/
    );
    expect(html).toMatch(
      /過去のコースのブック.*<button data-testid="preview-button">プレビュー<\/button>/
    );
  });
});
