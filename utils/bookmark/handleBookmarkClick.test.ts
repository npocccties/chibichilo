import { handleBookmarkClick } from "./handleBookmarkClick";
import { paths } from "$utils/routes";
import type { BookmarkSchema } from "$server/models/bookmark";
import { vi } from "vitest";

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
    const mockSetLtiContext =
      vi.fn<Parameters<typeof handleBookmarkClick>[1]>();
    const mockPush = vi.fn().mockResolvedValue(true);
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
    expect(mockPush).toHaveBeenCalledWith({
      pathname: paths.book,
      query: {
        bookId: mockBookmark.bookId,
        topicId: mockBookmark.topicId,
        lti_context_id: mockBookmark.ltiContext.id,
        lti_consumer_id: mockBookmark.ltiConsumerId,
      },
    });
  });
});
