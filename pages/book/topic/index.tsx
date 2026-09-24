import { useEffect } from "react";
import { useAppRouter } from "$utils/useAppRouter";
import Placeholder from "$templates/Placeholder";
import { bookUrl } from "$utils/routes";

function Router() {
  const router = useAppRouter();
  useEffect(() => {
    void router.replace(bookUrl({ bookId: Number(router.query.bookId) }));
  }, [router]);
  return <Placeholder />;
}

export default Router;
