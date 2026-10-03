import type { Story } from "@storybook/react";
import SectionsTree from "./SectionsTree";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { sections } from "$samples";

export default {
  title: "molecules/SectionsTree",
  component: SectionsTree,
  argTypes: { selectable: { control: "boolean" } },
};

type ArgTypes = {
  selectable: boolean;
};

const Template: Story<Parameters<typeof SectionsTree>[0] & ArgTypes> = ({
  selectable,
  onTreeChange,
  ...args
}) => {
  return (
    <SimpleTreeView
      slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
    >
      <SectionsTree
        {...args}
        onTreeChange={selectable ? onTreeChange : undefined}
      />
    </SimpleTreeView>
  );
};

export const Default = Template.bind({});
Default.args = {
  sections,
};

export const Editable = Template.bind({});
Editable.args = {
  ...Default.args,
  isContentEditable: () => true,
};
