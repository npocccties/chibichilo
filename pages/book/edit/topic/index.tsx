import { useEffect } from "react";
import { useAppRouter } from "$utils/useAppRouter";
import type { Query as BookEditQuery } from "$pages/book/edit";
import Placeholder from "$templates/Placeholder";
import { bookEditUrl } from "$utils/routes";

function Router() {
  const router = useAppRouter();
  useEffect(() => {
    const bookId = Number(router.query.bookId);
    const { context }: Pick<BookEditQuery, "context"> = router.query;
    const query = { bookId, ...(context && { context }) };
    void router.replace(bookEditUrl(query));
  }, [router]);
  return <Placeholder />;
}

export default Router;
