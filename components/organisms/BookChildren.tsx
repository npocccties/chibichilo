import { ReactNode, MouseEvent, Fragment, useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Collapse from "@material-ui/core/Collapse";
import { ExpandLess, ExpandMore, EditOutlined } from "@material-ui/icons";
import { SectionSchema } from "$server/models/book/section";

type Props = {
  className?: string;
  sections: SectionSchema[];
  onItemClick(event: MouseEvent<HTMLElement>, index: ItemIndex): void;
  onItemEditClick?(event: MouseEvent<HTMLElement>, index: ItemIndex): void;
};

function Section({
  key,
  section,
  sectionItemIndex,
  onSectionClick,
  open,
  children,
}: {
  key: string | number;
  section: Pick<SectionSchema, "name">;
  sectionItemIndex: number;
  onSectionClick(): void;
  open: boolean;
  children: ReactNode;
}) {
  if (section.name == null) return <Fragment key={key}>{children}</Fragment>;

  return (
    <Fragment key={key}>
      <ListItem button onClick={onSectionClick}>
        <ListItemText>
          {sectionItemIndex + 1} {section.name}
        </ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open}>{children}</Collapse>
    </Fragment>
  );
}

export default function BookChildren(props: Props) {
  const { className, sections, onItemClick, onItemEditClick } = props;
  const [open, setOpen] = useState<boolean[]>(sections.map(() => true));
  const handleItemClick = (event: MouseEvent<HTMLElement>) => {
    const { section, topic } = event.currentTarget.dataset;
    onItemClick(event, [section, topic].map(Number) as ItemIndex);
  };
  const handleSectionClick = (sectionItemIndex: number) => () => {
    setOpen((open) => {
      const newOpen = open.slice();
      newOpen[sectionItemIndex] = !newOpen[sectionItemIndex];
      return newOpen;
    });
  };
  const handleItemEditClick = (...index: ItemIndex) => (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    onItemEditClick?.(event, index);
  };
  return (
    <List disablePadding className={className}>
      {sections.map((section, sectionItemIndex) => (
        <Section
          key={section.id}
          section={section}
          sectionItemIndex={sectionItemIndex}
          onSectionClick={handleSectionClick(sectionItemIndex)}
          open={open[sectionItemIndex]}
        >
          {section.topics.map((topic, topicItemIndex) => (
            <ListItem
              key={topic.id}
              button
              data-section={sectionItemIndex}
              data-topic={topicItemIndex}
              onClick={handleItemClick}
            >
              <ListItemText>
                {sectionItemIndex + 1}
                {section.name && `.${topicItemIndex + 1}`} {topic.name}
              </ListItemText>
              {onItemEditClick && (
                <ListItemSecondaryAction>
                  <IconButton
                    color="primary"
                    onClick={handleItemEditClick(
                      sectionItemIndex,
                      topicItemIndex
                    )}
                  >
                    <EditOutlined />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </Section>
      ))}
    </List>
  );
}
