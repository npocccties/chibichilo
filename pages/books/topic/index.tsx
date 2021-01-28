import { useEffect } from "react";
import { useRouter } from "next/router";
import Placeholder from "$templates/Placeholder";
import { pagesPath } from "$utils/$path";

function Router() {
  const router = useRouter();
  useEffect(() => {
    router.replace(pagesPath.books.$url());
  }, [router]);
  return <Placeholder />;
}

export default Router;
