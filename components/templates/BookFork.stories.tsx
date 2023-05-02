import type { StoryObj } from "@storybook/react";
import BookFork from "./BookFork";
import { book } from "$samples";

export default {
  component: BookFork,
  parameters: {
    layout: "fullscreen",
  },
};

export const Default: StoryObj<typeof BookFork> = {
  args: {
    book,
  },
};
