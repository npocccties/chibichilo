import type { Meta, StoryObj } from "@storybook/react";

import Tag from "./Tag";
import { bookmark } from "$samples";

export default {
  component: Tag,
} satisfies Meta<typeof Tag>;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  render: () => <Tag tag={bookmark.tag} />,
};
