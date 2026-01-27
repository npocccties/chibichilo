import type { StoryObj } from "@storybook/react";
import ReleaseEdit from "./ReleaseEdit";
import { book } from "$samples";

export default {
  component: ReleaseEdit,
  parameters: {
    layout: "fullscreen",
  },
};

export const Create: StoryObj<typeof ReleaseEdit> = {
  args: {
    book: { ...book, release: undefined },
  },
};
