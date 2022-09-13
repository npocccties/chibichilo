import { useState, useEffect } from "react";
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

function Index() {
  const clientIds = useClientIds();
  const contents = useLinks();
  const [previewBookId, setPreviewBookId] = useState<
    BookSchema["id"] | undefined
  >();
  const linkSearchProps = useLinkSearchAtom();
  const { isContentEditable, session } = useSessionAtom();
  const { book } = useBook(
    previewBookId,
    isContentEditable,
    session?.ltiResourceLink
  );
  const dialogProps = useDialogProps<BookSchema>();
  const { setOpen, setData } = dialogProps;
  useEffect(() => {
    if (book) setData(book);
  }, [setData, book]);
  const onOpen = (id: number) => {
    setPreviewBookId(id);
    setOpen(true);
  };
  const router = useRouter();
  const handlers = {
    async onLinksDeleteClick(
      links: Array<Pick<LinkSchema, "oauthClientId" | "ltiResourceLink">>
    ) {
      await Promise.all(
        links.map((link) =>
          destroyLtiResourceLink({
            consumerId: link.oauthClientId,
            id: link.ltiResourceLink.id,
          })
        )
      );
      await revalidateLinks(linkSearchProps.query);
    },
    onBookPreviewClick(book: Pick<BookSchema, "id">) {
      onOpen(book.id);
    },
    onBookEditClick(book: Pick<BookSchema, "id" | "authors">) {
      const action = isContentEditable(book) ? "edit" : "generate";
      return router.push(
        pagesPath.book[action].$url({
          query: { context: "courses", bookId: book.id },
        })
      );
    },
  };

  return (
    <>
      <CoursesTemplate clientIds={clientIds} {...contents} {...handlers} />
      {dialogProps.data && (
        <BookPreviewDialog {...dialogProps} book={dialogProps.data}>
          {(props) => <Book {...props} />}
        </BookPreviewDialog>
      )}
    </>
  );
}

export default Index;
