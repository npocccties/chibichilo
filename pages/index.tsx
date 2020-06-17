import {
  useLmsSession,
  redirectToLms,
  isLmsInstructor,
} from "components/session";
import { useRouter, Link } from "components/router";
import { saveSessionInStorage } from "components/session";
import { useSnackbar } from "material-ui-snackbar-provider";

export default function () {
  const session = useLmsSession();
  const router = useRouter();
  const { showMessage } = useSnackbar();

  if (!session) return <div>Loading...</div>;

  const nonce = router.query.nonce;
  saveSessionInStorage({
    ...session,
    nonce: Array.isArray(nonce) ? nonce[0] : nonce,
  });

  if (session.contents) {
    const href = {
      pathname: "/contents",
      query: {
        id: session.contents,
        action: "show",
      },
    };
    router.replace(href);
    return <Link href={href}>#{session.contents}</Link>;
  } else {
    if (!isLmsInstructor(session)) redirectToLms();
    const href = "/edit";
    router.replace(href);
    const message =
      "まだ学習管理システムに紐付いていません。紐付ける学習コンテンツを選択してください。";
    showMessage(message);
    return <Link href={href}>{message}</Link>;
  }
}
