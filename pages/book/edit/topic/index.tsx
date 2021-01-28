import { useEffect } from "react";
import { useRouter } from "next/router";
import type { Query as BookEditQuery } from "$pages/book/edit";
import Placeholder from "$templates/Placeholder";
import { pagesPath } from "$utils/$path";

function Router() {
  const router = useRouter();
  useEffect(() => {
    const bookId = Number(router.query.bookId);
    const { context }: Pick<BookEditQuery, "context"> = router.query;
    const query = { bookId, ...(context && { context }) };
    router.replace(pagesPath.book.edit.$url({ query }));
  }, [router]);
  return <Placeholder />;
}

export default Router;
