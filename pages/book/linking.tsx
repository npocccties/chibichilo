import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import type { BookSchema } from "$server/models/book";
import Placeholder from "$templates/Placeholder";
import { useSessionAtom } from "$store/session";
import { useDlResponseJwt } from "$utils/deepLinking";

export type Query = { bookId: BookSchema["id"] };

function Linking() {
  const { query } = useRouter();
  const [bookId] = [query.bookId].flat();
  const { session } = useSessionAtom();
  const jwt = useDlResponseJwt(Number(bookId));
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (jwt && ref.current) ref.current.submit();
  }, [jwt, ref]);

  if (!jwt) return <Placeholder />;

  return (
    <form
      ref={ref}
      style={{ display: "none" }}
      action={session?.ltiDlSettings?.deep_link_return_url}
      method="POST"
    >
      <input type="hidden" name="JWT" value={jwt} />
    </form>
  );
}

export default Linking;
