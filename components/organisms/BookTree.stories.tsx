import type { Story } from "@storybook/react";
import BookTree from "./BookTree";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { book } from "$samples";

export default {
  title: "organisms/BookTree",
  component: BookTree,
};

const Template: Story<Parameters<typeof BookTree>[0]> = (args) => {
  return (
    <SimpleTreeView
      slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
    >
      <BookTree {...args} />
    </SimpleTreeView>
  );
};

export const Default = Template.bind({});
Default.args = {
  book,
};
