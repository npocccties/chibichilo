import type { StoryObj } from "@storybook/react";
import ReleaseForm from "./ReleaseForm";
import { release } from "$samples";

export default { component: ReleaseForm };

export const Default: StoryObj<typeof ReleaseForm> = {
  args: {
    release,
  },
};
