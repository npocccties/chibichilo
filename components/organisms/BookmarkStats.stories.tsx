import type { Meta, StoryObj } from "@storybook/react";
import BookmarkStats from "./BookmarkStats";
import { book, bookmark, bookmarkTagMenu } from "$samples";

export default {
  title: "organisms/BookmarkStats",
  component: BookmarkStats,
} satisfies Meta<typeof BookmarkStats>;

type Story = StoryObj<typeof BookmarkStats>;

export const Default: Story = {
  render: () => (
    <BookmarkStats book={book}>
      <BookmarkStats.List>
        <BookmarkStats.ListItem
          name={book.sections[0].topics[0].name}
          bookmarks={[bookmark]}
          bookmarkTagMenu={bookmarkTagMenu}
        />
      </BookmarkStats.List>
    </BookmarkStats>
  ),
};
