import Bookmarks from "$templates/Bookmarks";
import { useBookmarkTagMenu } from "$utils/bookmark/useBookmarkTagMenu";
import { useSessionAtom } from "$store/session";
import Placeholder from "$templates/Placeholder";

function Index() {
  const { bookmarkTagMenu, isLoading } = useBookmarkTagMenu();
  const { session } = useSessionAtom();
  if (!session) return <Placeholder />;
  if (isLoading) return null;
  return <Bookmarks session={session} bookmarkTagMenu={bookmarkTagMenu} />;
}

export default Index;
