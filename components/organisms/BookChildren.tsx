import { ReactNode, MouseEvent } from "react";
import clsx from "clsx";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import { makeStyles, createStyles } from "@material-ui/styles";
import type { Theme } from "@material-ui/core/styles";
import EditButton from "$atoms/EditButton";
import { TopicSchema } from "$server/models/topic";
import { SectionSchema } from "$server/models/book/section";
import { primary, gray } from "$theme/colors";
import { isNamedSection, getOutlineNumber } from "$utils/outline";

const useListStyles = makeStyles((theme: Theme) =>
  createStyles({
    padding: {
      padding: theme.spacing(3, 0),
    },
  })
);

function SectionItem({
  section,
  sectionItemIndex,
  children,
}: {
  section: Pick<SectionSchema, "name" | "topics">;
  sectionItemIndex: number;
  children: ReactNode;
}) {
  const listClasses = useListStyles();
  const classes = useStyles();
  if (!isNamedSection(section)) return <List disablePadding>{children}</List>;

  return (
    <List classes={listClasses}>
      <ListItem dense>
        <span className={clsx(classes.outline, classes.outlineNumber)}>
          {getOutlineNumber(section, sectionItemIndex)}
        </span>
        <ListItemText
          className={clsx(classes.title, classes.outline)}
          disableTypography
        >
          {section.name}
        </ListItemText>
      </ListItem>
      {children}
    </List>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    outline: {
      color: gray[800],
      fontSize: "0.75rem",
      fontWeight: "bold",
      lineHeight: 1.25,
    },
    outlineNumber: {
      marginRight: theme.spacing(1),
    },
    title: {
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    active: {
      backgroundColor: primary[50],
    },
  })
);

type Props = {
  className?: string;
  sections: SectionSchema[];
  index: ItemIndex;
  isTopicEditable(topic: TopicSchema): boolean;
  onItemClick(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
};

export default function BookChildren({
  className,
  sections,
  index: [sectionIndex, topicIndex],
  isTopicEditable,
  onItemClick,
  onItemEditClick,
}: Props) {
  const classes = useStyles();
  const handleItemClick = (index: ItemIndex) => () => onItemClick(index);
  const handleItemEditClick = (index: ItemIndex) => (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    onItemEditClick?.(index);
  };
  return (
    <div className={className}>
      {sections.map((section, sectionItemIndex) => (
        <SectionItem
          key={section.id}
          section={section}
          sectionItemIndex={sectionItemIndex}
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
              onClick={handleItemClick([sectionItemIndex, topicItemIndex])}
            >
              <span className={clsx(classes.outline, classes.outlineNumber)}>
                {getOutlineNumber(section, sectionItemIndex, topicItemIndex)}
              </span>
              <ListItemText className={classes.title} disableTypography>
                {topic.name}
              </ListItemText>
              {isTopicEditable(topic) && onItemEditClick && (
                <ListItemSecondaryAction>
                  <EditButton
                    variant="topic"
                    size="medium"
                    onClick={handleItemEditClick([
                      sectionItemIndex,
                      topicItemIndex,
                    ])}
                  />
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </SectionItem>
      ))}
    </div>
  );
}
