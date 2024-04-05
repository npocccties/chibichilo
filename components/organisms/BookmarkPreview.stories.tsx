import type { Meta, StoryObj } from "@storybook/react";

import BookmarkPreview from "./BookmarkPreview";
import { bookmark } from "$samples";

export default {
  component: BookmarkPreview,
} satisfies Meta<typeof BookmarkPreview>;

type Story = StoryObj<typeof BookmarkPreview>;

export const Default: Story = {
  args: {
    bookmark,
  },
};
