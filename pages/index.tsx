import { UrlObject } from "url";
import { useRouter } from "next/router";
import { isInstructor, useSession } from "$utils/session";
import Unknown from "$templates/Unknown";
import Placeholder from "$templates/Placeholder";
import { pagesPath } from "$utils/$path";

function Replace(props: { href: string | UrlObject }) {
  const router = useRouter();
  router.replace(props.href);
  return <Placeholder />;
}

function Router() {
  const session = useSession();

  // TODO: https://github.com/npocccties/ChibiCHiLO/issues/3
  if (!session.data) return <Placeholder />;

  const ltiResourceLink = session.data.ltiResourceLink;

  if (!ltiResourceLink && isInstructor(session.data))
    return <Replace href={pagesPath.link.$url()} />;

  if (!ltiResourceLink)
    return (
      <Unknown header="ブックが未連携です">
        LTIリンクがどのブックとも連携されていません。担当教員にお問い合わせください
      </Unknown>
    );

  return (
    <Replace
      href={pagesPath.book.$url({
        query: { bookId: ltiResourceLink.bookId },
      })}
    />
  );
}

export default Router;
