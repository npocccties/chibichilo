import type { StoryObj } from "@storybook/react";
import BookNew from "./BookNew";

export default {
  component: BookNew,
  parameters: { layout: "fullscreen" },
};

export const Default: StoryObj<typeof BookNew> = {};
