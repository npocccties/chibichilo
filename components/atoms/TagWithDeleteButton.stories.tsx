import type { Meta, StoryObj } from "@storybook/react";

import TagWithDeleteButton from "./TagWithDeleteButton";
import { bookmark } from "$samples";

export default {
  component: TagWithDeleteButton,
} satisfies Meta<typeof TagWithDeleteButton>;

type Story = StoryObj<typeof TagWithDeleteButton>;

export const Default: Story = {
  render: () => (
    <TagWithDeleteButton
      topicId={1}
      bookmark={bookmark}
      onDeleteBookmark={async () => {}}
    />
  ),
};
