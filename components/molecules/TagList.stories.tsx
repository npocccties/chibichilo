import type { Meta, StoryObj } from "@storybook/react";

import TagList from "./TagList";
import { bookmark, bookmarkTagMenu } from "$samples";

export default {
  component: TagList,
} satisfies Meta<typeof TagList>;

type Story = StoryObj<typeof TagList>;

export const Default: Story = {
  render: () => (
    <TagList topicId={1} bookmarks={[bookmark]} tagMenu={bookmarkTagMenu} />
  ),
};
