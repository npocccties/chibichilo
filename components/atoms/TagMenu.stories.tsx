import type { Meta, StoryObj } from "@storybook/react";

import TagMenu from "./TagMenu";
import { bookmark, bookmarkTagMenu } from "$samples";

export default {
  component: TagMenu,
} satisfies Meta<typeof TagMenu>;

type Story = StoryObj<typeof TagMenu>;

export const Default: Story = {
  render: () => (
    <TagMenu
      topicId={bookmark.topicId}
      selectedTag={[bookmark.tag]}
      tagMenu={bookmarkTagMenu}
      handleTagChange={() => {}}
      isBookmarkMemoContent={false}
      onSubmitBookmark={async () => {}}
    />
  ),
};
