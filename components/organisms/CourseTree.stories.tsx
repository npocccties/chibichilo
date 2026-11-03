import type { Story } from "@storybook/react";
import CourseTree from "./CourseTree";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ltiResourceLink, book } from "$samples";

export default {
  title: "organisms/CourseTree",
  component: CourseTree,
};

const Template: Story<Parameters<typeof CourseTree>[0]> = (args) => {
  return (
    <SimpleTreeView
      slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
    >
      <CourseTree {...args} />
    </SimpleTreeView>
  );
};

export const Default = Template.bind({});

const ltiContext = {
  id: ltiResourceLink.contextId,
  label: ltiResourceLink.contextLabel,
  title: ltiResourceLink.contextTitle,
};

Default.args = {
  ltiContext,
  links: [
    {
      oauthClientId: ltiResourceLink.consumerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ltiContext,
      ltiResourceLink: {
        id: ltiResourceLink.id,
        title: ltiResourceLink.title,
      },
      book,
    },
  ],
  selected: new Set(),
  select: console.log,
  isContentEditable: () => true,
};
