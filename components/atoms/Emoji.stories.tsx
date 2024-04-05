import type { Meta, StoryObj } from "@storybook/react";

import Emoji from "./Emoji";
import { bookmark } from "$samples";

export default {
  component: Emoji,
} satisfies Meta<typeof Emoji>;

type Story = StoryObj<typeof Emoji>;

export const Default: Story = {
  render: () => <Emoji emoji={bookmark.tag.emoji} />,
};
