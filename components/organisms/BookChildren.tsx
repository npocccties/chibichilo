import { ReactNode, MouseEvent, useState } from "react";
import clsx from "clsx";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Collapse from "@material-ui/core/Collapse";
import { makeStyles } from "@material-ui/styles";
import { ExpandLess, ExpandMore, EditOutlined } from "@material-ui/icons";
import { TopicSchema } from "$server/models/topic";
import { SectionSchema } from "$server/models/book/section";
import { primary } from "$theme/colors";
import { getOutline } from "$utils/outline";

function Section({
  section,
  sectionItemIndex,
  onSectionClick,
  open,
  children,
}: {
  section: Pick<SectionSchema, "name" | "topics">;
  sectionItemIndex: number;
  onSectionClick(): void;
  open: boolean;
  children: ReactNode;
}) {
  if (section.name == null && section.topics.length < 2) return <>{children}</>;

  return (
    <>
      <ListItem button onClick={onSectionClick}>
        <ListItemText>
          {getOutline(section, sectionItemIndex) + " "}
          {section.name ?? "無名のセクション"}
        </ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open}>{children}</Collapse>
    </>
  );
}

const useStyles = makeStyles({
  active: {
    backgroundColor: primary[50],
  },
});

type Props = {
  className?: string;
  sections: SectionSchema[];
  index: ItemIndex;
  isTopicEditable(topic: TopicSchema): boolean;
  onItemClick(event: MouseEvent<HTMLElement>, index: ItemIndex): void;
  onItemEditClick?(event: MouseEvent<HTMLElement>, index: ItemIndex): void;
};

export default function BookChildren(props: Props) {
  const {
    className,
    sections,
    index: [sectionIndex, topicIndex],
    isTopicEditable,
    onItemClick,
    onItemEditClick,
  } = props;
  const classes = useStyles();
  const [open, setOpen] = useState<boolean[]>(sections.map(() => true));
  const handleItemClick = (event: MouseEvent<HTMLElement>) => {
    const { section, topic } = event.currentTarget.dataset;
    onItemClick(event, ([section, topic].map(Number) as unknown) as ItemIndex);
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
              key={`${topic.id}:${topicItemIndex}`}
              className={clsx({
                [classes.active]:
                  sectionIndex === sectionItemIndex &&
                  topicIndex === topicItemIndex,
              })}
              button
              data-section={sectionItemIndex}
              data-topic={topicItemIndex}
              onClick={handleItemClick}
            >
              <ListItemText>
                {getOutline(section, sectionItemIndex, topicItemIndex) + " "}
                {topic.name}
              </ListItemText>
              {isTopicEditable(topic) && (
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
