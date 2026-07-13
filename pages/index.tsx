import { useAppRouter } from "$utils/useAppRouter";
import { useSessionAtom } from "$store/session";
import UnlinkedProblem from "$templates/UnlinkedProblem";
import Placeholder from "$templates/Placeholder";
import { bookUrl, paths } from "$utils/routes";
import type { AppRouterUrl } from "$utils/toPath";

function Replace(props: { href: AppRouterUrl }) {
  const router = useAppRouter();
  void router.replace(props.href);
  return <Placeholder />;
}

function Router() {
  const { session, isInstructor } = useSessionAtom();
  const ltiResourceLink = session?.ltiResourceLink;

  if (!ltiResourceLink && isInstructor) return <Replace href={paths.books} />;

  if (!ltiResourceLink) return <UnlinkedProblem />;

  const query = ltiResourceLink.topicId
    ? { bookId: ltiResourceLink.bookId, topicId: ltiResourceLink.topicId }
    : { bookId: ltiResourceLink.bookId };
  return <Replace href={bookUrl(query)} />;
}

export default Router;
