import type { UrlObject } from "url";
import { useRouter } from "next/router";
import { useSessionAtom } from "$store/session";
import UnlinkedProblem from "$templates/UnlinkedProblem";
import Placeholder from "$templates/Placeholder";
import { pagesPath } from "$utils/$path";

function Replace(props: { href: string | UrlObject }) {
  const router = useRouter();
  void router.replace(props.href);
  return <Placeholder />;
}

function Router() {
  const { session, isInstructor } = useSessionAtom();
  const ltiResourceLink = session?.ltiResourceLink;

  if (!ltiResourceLink && isInstructor)
    return <Replace href={pagesPath.books.$url()} />;

  if (!ltiResourceLink) return <UnlinkedProblem />;

  return (
    <Replace
      href={pagesPath.book.$url({
        query: { bookId: ltiResourceLink.bookId },
      })}
    />
  );
}

export default Router;
