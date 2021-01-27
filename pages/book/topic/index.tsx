import { useEffect } from "react";
import { useRouter } from "next/router";
import type { Query } from "$pages/book";
import Placeholder from "$templates/Placeholder";

function Router() {
  const router = useRouter();
  useEffect(() => {
    const query: Query = router.query;
    router.replace({ pathname: "/book", query });
  }, [router]);
  return <Placeholder />;
}

export default Router;
