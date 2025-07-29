import type { Story } from "@storybook/react";
import Sections from "./Sections";
import { sections, user } from "samples";
import { useActivityAtom } from "$store/activity";

export default { title: "organisms/Sections", component: Sections };

const activityBySections = sections
  .flatMap(({ topics }) => topics)
  .map((topic) => ({
    id: topic.id,
    topic,
    bookId: 1,
    learner: user,
    completed: Math.floor(Math.random() * 2) === 0,
    totalTimeMs: 100_000,
    timeRanges: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

const Template: Story<Parameters<typeof Sections>[0]> = (args) => {
  useActivityAtom(activityBySections);
  return <Sections {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  sections,
  index: [0, 0],
  isContentEditable: () => false,
};
