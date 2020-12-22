import { UrlObject } from "url";
import { useRouter } from "next/router";
import Link from "next/link";
import { isInstructor, useSession } from "$utils/session";
import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import BookUnknown from "$templates/BookUnknown";

function Replace(props: { href: string | UrlObject }) {
  const router = useRouter();
  router.replace(props.href);
  return <Link href={props.href}>Link</Link>; // TODO: プレースホルダーがいい加減
}

function ReplaceToBook(props: { ltiResourceLink: LtiResourceLinkSchema }) {
  const url = {
    pathname: "/book",
    query: { id: props.ltiResourceLink.bookId },
  };

  return <Replace href={url} />;
}

function Router() {
  const session = useSession();

  // TODO: https://github.com/npocccties/ChibiCHiLO/issues/3
  if (!session.data) return <div>Loading...</div>; // TODO: プレースホルダーがいい加減
  if (isInstructor(session.data)) return <Replace href="/books" />;
  if (!session.data.ltiResourceLink) return <BookUnknown />;

  return <ReplaceToBook ltiResourceLink={session.data.ltiResourceLink} />;
}

export default Router;
