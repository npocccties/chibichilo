import type { ReactNode, MouseEvent, ChangeEvent } from "react";
import clsx from "clsx";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Typography from "@mui/material/Typography";
import { makeStyles, createStyles } from "@mui/styles";
import type { Theme } from "@mui/material/styles";
import EditButton from "$atoms/EditButton";
import type { ContentAuthors, ContentSchema } from "$server/models/content";
import type { SectionSchema } from "$server/models/book/section";
import { primary, gray } from "$theme/colors";
import { isNamedSection, getOutlineNumber } from "$utils/outline";
import { useActivityAtom } from "$store/activity";
import LearningStatusChip from "$atoms/LearningStatusChip";
import formatInterval from "$utils/formatInterval";
import TagCount from "$molecules/TagCount";
import { Box } from "@mui/material";
import LinkSwitch from "$atoms/LinkSwitch";

import { NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK } from "$utils/env";
import type { TopicSchema } from "$server/models/topic";
import type { BookSchema } from "$server/models/book";

function SectionItem({
  section,
  sectionItemIndex,
  children,
}: {
  section: Pick<SectionSchema, "name" | "topics">;
  sectionItemIndex: number;
  children: ReactNode;
}) {
  const classes = useStyles();
  if (!isNamedSection(section)) return <List disablePadding>{children}</List>;

  return (
    <List className={classes.indent}>
      <ListItem dense>
        <span className={clsx(classes.outline, classes.outlineNumber)}>
          {getOutlineNumber(section, sectionItemIndex)}
        </span>
        <ListItemText
          className={clsx(classes.ellipsis, classes.outline)}
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
    ellipsis: {
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    columns: {
      display: "flex",
      flexDirection: "column",
    },
    topic: {
      fontSize: "0.875rem",
    },
    indent: {
      "& > :not(:first-child) $outlineNumber": {
        marginLeft: `${0.875 * 1.2}rem`,
      },
    },
    active: {
      backgroundColor: primary[50],
    },
  })
);

type Props = {
  className?: string;
  bookId?: number | undefined;
  sections: SectionSchema[];
  index: ItemIndex;
  isContentEditable(topic: ContentAuthors): boolean;
  isPrivateBook: boolean;
  onItemClick(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
  onContentLinkClick?(
    content: Pick<BookSchema, "id"> | ContentSchema,
    checked: boolean,
    topicId?: TopicSchema["id"]
  ): void;
};

export default function Sections({
  className,
  bookId,
  sections,
  index: [sectionIndex, topicIndex],
  isContentEditable,
  isPrivateBook,
  onItemClick,
  onItemEditClick,
  onContentLinkClick,
}: Props) {
  const classes = useStyles();
  const handleItemClick = (index: ItemIndex) => () => onItemClick(index);
  const handleItemEditClick =
    (index: ItemIndex) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onItemEditClick?.(index);
    };
  const handleItemLinkClick =
    (topic: TopicSchema) =>
    (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      event.stopPropagation();
      if (bookId) {
        onContentLinkClick?.({ id: bookId }, checked, topic.id);
      }
    };
  const { isCompleted } = useActivityAtom();
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
              <ListItemText className={classes.columns} disableTypography>
                <span className={clsx(classes.topic, classes.ellipsis)}>
                  {topic.name}
                </span>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      marginRight: "4px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatInterval(0, topic.timeRequired * 1000)}
                  </Typography>
                  {NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK && isPrivateBook && (
                    <TagCount topicId={topic.id} bookId={bookId ?? 0} />
                  )}
                </Box>
              </ListItemText>
              {onContentLinkClick && (
                <LinkSwitch
                  sx={{
                    position: "absolute",
                    bottom: 30,
                    right: 8,
                    transform: "translateY(50%)",
                    filter: "none",
                  }}
                  disabled={false}
                  checked={false}
                  onChange={handleItemLinkClick(topic)}
                />
              )}
              {!isContentEditable(topic) && isCompleted(topic.id) && (
                <LearningStatusChip type="completed" size="small" />
              )}
              {isContentEditable(topic) && onItemEditClick && (
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
