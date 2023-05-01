import { useRouter } from "next/router";
import type { BookPropsWithSubmitOptions } from "$types/bookPropsWithSubmitOptions";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { ContentAuthors } from "$server/models/content";
import type { SectionProps } from "$server/models/book/section";
import type { AuthorSchema } from "$server/models/author";
import { type TopicPreviewDialogProps } from "$organisms/TopicPreviewDialog";
import { useSessionAtom } from "$store/session";
import { destroyBook, updateBook, useBook } from "$utils/book";
import useAuthorsHandler from "$utils/useAuthorsHandler";
import useBookLinkHandler from "$utils/useBookLinkHandler";
import useDialogProps from "$utils/useDialogProps";
import { pagesPath } from "$utils/$path";

type BookEditHandlers = {
  book: BookSchema | undefined;
  error: unknown;
  linked: boolean;
  isContentEditable(content: ContentAuthors): boolean;
  back(): void;
  onUpdateBook(book: BookPropsWithSubmitOptions): void;
  onDeleteBook(): void;
  onSectionsUpdate(sections: SectionProps[]): void;
  onBookImportClick(): void;
  onTopicImportClick(): void;
  onTopicNewClick(): void;
  onTopicEditClick(topic: TopicSchema): void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
  onLinkSwitchClick(checked: boolean): void;
  onForkButtonClick(): void;
  onReleaseButtonClick(): void;
  onTopicPreview(topic: TopicSchema): void;
  topicPreviewDialogProps: TopicPreviewDialogProps | undefined;
};

function useBookEditHandlers({
  bookId,
  context,
}: {
  bookId: BookSchema["id"];
  context?: "books" | "topics" | "courses";
}): BookEditHandlers {
  const { session, isContentEditable } = useSessionAtom();
  const linked = bookId === session?.ltiResourceLink?.bookId;
  const { book, error } = useBook(bookId, isContentEditable);
  const router = useRouter();
  const query = { bookId, ...(context && { context }) };

  async function back() {
    switch (context) {
      case "books":
      case "topics":
      case "courses":
        return await router.push(pagesPath[context].$url());
      default:
        return await router.push(pagesPath.book.$url({ query }));
    }
  }

  const authorsHandler = useAuthorsHandler(book && { type: "book", ...book });
  const bookLinkHandler = useBookLinkHandler();
  const {
    data: previewTopic,
    dispatch: onTopicPreview,
    ...topicPreviewDialogProps
  } = useDialogProps<TopicSchema>();

  const handlers = {
    linked,
    isContentEditable,
    back,
    /** ブックの更新 */
    async onUpdateBook({
      sections: _sections,
      submitWithLink: _submitWithLink,
      ...props
    }: BookPropsWithSubmitOptions) {
      await updateBook({ id: bookId, ...props });
      return await back();
    },
    /** ブックの削除 */
    async onDeleteBook() {
      await destroyBook(bookId);
      switch (context) {
        case "books":
        case "topics":
          return await router.push(pagesPath[context].$url());
        default:
          return await router.push(pagesPath.books.$url());
      }
    },
    /** セクションの編集 */
    async onSectionsUpdate(sections: SectionProps[]) {
      if (!book) return;
      await updateBook({
        ...book,
        sections: sections.filter((section) => section.topics.length > 0),
      });
    },
    /** ブックの再利用 */
    async onBookImportClick() {
      return await router.push(pagesPath.book.import.$url({ query }));
    },
    /** トピックの再利用 */
    async onTopicImportClick() {
      return await router.push(pagesPath.book.topic.import.$url({ query }));
    },
    /** トピックの作成 */
    async onTopicNewClick() {
      return await router.push(pagesPath.book.edit.topic.new.$url({ query }));
    },
    /** トピックの編集 */
    async onTopicEditClick(topic: TopicSchema) {
      const action = isContentEditable(topic) ? "edit" : "generate";
      const url = pagesPath.book.edit.topic[action].$url({
        query: { ...query, topicId: topic.id },
      });
      return await router.push(url);
    },
    /** 作成者一覧の編集 */
    onAuthorsUpdate: authorsHandler.handleAuthorsUpdate,
    /** 作成者の追加 */
    onAuthorSubmit: authorsHandler.handleAuthorSubmit,
    /** リンク */
    async onLinkSwitchClick(checked: boolean) {
      await bookLinkHandler({ id: bookId }, checked);
    },
    /** フォーク */
    onForkButtonClick: () => {
      console.log("fork button");
    },
    /** リリース */
    async onReleaseButtonClick() {
      return router.push(pagesPath.book.release.$url({ query }));
    },
    /** トピックのプレビュー */
    onTopicPreview,
    get topicPreviewDialogProps() {
      if (!previewTopic) return;

      return {
        ...topicPreviewDialogProps,
        topic: previewTopic,
      };
    },
  };

  return {
    book,
    error,
    ...handlers,
  };
}

export default useBookEditHandlers;
