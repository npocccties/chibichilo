import { UrlObject } from "url";
import { useRouter } from "next/router";
import { isInstructor, useSession } from "$utils/session";
import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import Unknown from "$templates/Unknown";
import Placeholder from "$templates/Placeholder";

function Replace(props: { href: string | UrlObject }) {
  const router = useRouter();
  router.replace(props.href);
  return <Placeholder />;
}

function ReplaceToBook(props: { ltiResourceLink: LtiResourceLinkSchema }) {
  const url = {
    pathname: "/book",
    query: { bookId: props.ltiResourceLink.bookId },
  };

  return <Replace href={url} />;
}

function Router() {
  const session = useSession();

  // TODO: https://github.com/npocccties/ChibiCHiLO/issues/3
  if (!session.data) return <Placeholder />;

  const ltiResourceLink = session.data.ltiResourceLink;

  if (isInstructor(session.data)) {
    const href = ltiResourceLink == null ? "/link" : "/books";
    return <Replace href={href} />;
  }
  if (!ltiResourceLink)
    return (
      <Unknown header="ブックが未連携です">
        LTIリンクがどのブックとも連携されていません。担当教員にお問い合わせください
      </Unknown>
    );

  return <ReplaceToBook ltiResourceLink={ltiResourceLink} />;
}

export default Router;
