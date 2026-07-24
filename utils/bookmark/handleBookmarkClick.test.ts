import { handleBookmarkClick } from "./handleBookmarkClick";
import { pagesPath } from "$utils/$path";
import type { BookmarkSchema } from "$server/models/bookmark";
import type { LtiContextState } from "$store/session";

describe("handleBookmarkClick()", () => {
  const mockBookmark = {
    bookId: 100,
    topicId: 200,
    ltiConsumerId: "test-consumer",
    ltiContext: {
      id: "test-context-id",
    },
  } as BookmarkSchema;

  it("setLtiContext に遷移先ではなく、引数で渡された現在の pathname をセットすること", async () => {
    const mockSetLtiContext = jest.fn((_value: LtiContextState) => {});
    const mockPush = jest.fn().mockResolvedValue(true);
    const currentPath = "/bookmarks";

    await handleBookmarkClick(
      mockBookmark,
      mockSetLtiContext,
      mockPush,
      currentPath
    );

    expect(mockSetLtiContext).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: currentPath,
      })
    );
    const expectedUrl = pagesPath.book.$url({
      query: { bookId: mockBookmark.bookId, topicId: mockBookmark.topicId },
    });
    expect(mockPush).toHaveBeenCalledWith(expectedUrl);
  });
});
