import { useEffect } from "react";
import { useAppRouter } from "$utils/useAppRouter";
import Placeholder from "$templates/Placeholder";
import { paths } from "$utils/routes";

function Router() {
  const router = useAppRouter();
  useEffect(() => {
    void router.replace(paths.books);
  }, [router]);
  return <Placeholder />;
}

export default Router;
