import Bookmarks from "$templates/Bookmarks";
import { useBookmarkTagMenu } from "$utils/bookmark/useBookmarkTagMenu";

function Index() {
  const { bookmarkTagMenu, isLoading } = useBookmarkTagMenu();
  if (isLoading) return null;
  return <Bookmarks bookmarkTagMenu={bookmarkTagMenu} />;
}

export default Index;
