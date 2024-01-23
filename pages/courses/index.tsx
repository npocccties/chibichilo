import { useRouter } from "next/router";
import CoursesTemplate from "$templates/Courses";
import Book from "$templates/Book";
import BookPreviewDialog from "$organisms/BookPreviewDialog";
import type { LinkSchema } from "$server/models/link/content";
import type { BookSchema } from "$server/models/book";
import { useLinkSearchAtom } from "$store/linkSearch";
import { destroyLtiResourceLink } from "$utils/ltiResourceLink";
import { useSessionAtom } from "$store/session";
import { useBook } from "$utils/book";
import useClientIds from "$utils/courses/useClientIds";
import useLinks, { revalidateLinks } from "$utils/courses/useLinks";
import useDialogProps from "$utils/useDialogProps";
import { pagesPath } from "$utils/$path";

function PreviewDialog({
  previewBookId,
  ...dialogProps
}: {
  previewBookId: number | undefined;
  open: boolean;
  onClose: React.MouseEventHandler;
}) {
  const { isContentEditable, session } = useSessionAtom();
  const { book } = useBook(
    previewBookId,
    isContentEditable,
    session?.ltiResourceLink
  );

  if (!book) return null;
  return (
    <BookPreviewDialog {...dialogProps} book={book}>
      {Book}
    </BookPreviewDialog>
  );
}

function Index() {
  const clientIds = useClientIds();
  const contents = useLinks();
  const linkSearchProps = useLinkSearchAtom();
  const dialogProps = useDialogProps<BookSchema["id"]>();
  const router = useRouter();
  const handlers = {
    async onLinksDeleteClick(
      links: Array<Pick<LinkSchema, "oauthClientId" | "ltiResourceLink">>
    ) {
      await Promise.all(
        links.map((link) => {
          if (!link?.ltiResourceLink?.id) {
            return;
          }
          return destroyLtiResourceLink({
            consumerId: link.oauthClientId,
            id: link.ltiResourceLink.id,
          });
        })
      );
      await revalidateLinks(linkSearchProps.query);
    },
    onBookPreviewClick(book: Pick<BookSchema, "id">) {
      dialogProps.dispatch(book.id);
    },
    onBookEditClick(book: Pick<BookSchema, "id" | "authors">) {
      return router.push(
        pagesPath.book.edit.$url({
          query: { context: "courses", bookId: book.id },
        })
      );
    },
  };

  return (
    <>
      <CoursesTemplate clientIds={clientIds} {...contents} {...handlers} />
      {dialogProps.data != null && (
        <PreviewDialog previewBookId={dialogProps.data} {...dialogProps} />
      )}
    </>
  );
}

export default Index;
