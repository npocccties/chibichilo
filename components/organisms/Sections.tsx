import type { ReactNode, MouseEvent, ChangeEvent } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
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

const outlineSx: SxProps<Theme> = {
  color: gray[800],
  fontSize: "0.75rem",
  fontWeight: "bold",
  lineHeight: 1.25,
};
const outlineNumberClass = "SectionsOutlineNumber";
const outlineNumberSx: SxProps<Theme> = { ...outlineSx, mr: 1 };
const ellipsisOutlineSx: SxProps<Theme> = {
  ...outlineSx,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};
const indentSx: SxProps<Theme> = {
  [`& > :not(:first-of-type) .${outlineNumberClass}`]: {
    marginLeft: `${0.875 * 1.2}rem`,
  },
};
const columnsSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};
const topicEllipsisSx: SxProps<Theme> = {
  fontSize: "0.875rem",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

function SectionItem({
  section,
  sectionItemIndex,
  children,
}: {
  section: Pick<SectionSchema, "name" | "topics">;
  sectionItemIndex: number;
  children: ReactNode;
}) {
  if (!isNamedSection(section)) return <List disablePadding>{children}</List>;

  return (
    <List sx={indentSx}>
      <ListItem dense>
        <Box
          component="span"
          className={outlineNumberClass}
          sx={outlineNumberSx}
        >
          {getOutlineNumber(section, sectionItemIndex)}
        </Box>
        <ListItemText sx={ellipsisOutlineSx} disableTypography>
          {section.name}
        </ListItemText>
      </ListItem>
      {children}
    </List>
  );
}

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
              disablePadding
              secondaryAction={
                isContentEditable(topic) && onItemEditClick ? (
                  <EditButton
                    variant="topic"
                    size="medium"
                    onClick={handleItemEditClick([
                      sectionItemIndex,
                      topicItemIndex,
                    ])}
                  />
                ) : undefined
              }
            >
              <ListItemButton
                sx={
                  sectionIndex === sectionItemIndex &&
                  topicIndex === topicItemIndex
                    ? { backgroundColor: primary[50] }
                    : undefined
                }
                onClick={handleItemClick([sectionItemIndex, topicItemIndex])}
              >
                <Box
                  component="span"
                  className={outlineNumberClass}
                  sx={outlineNumberSx}
                >
                  {getOutlineNumber(section, sectionItemIndex, topicItemIndex)}
                </Box>
                <ListItemText sx={columnsSx} disableTypography>
                  <Box component="span" sx={topicEllipsisSx}>
                    {topic.name}
                  </Box>
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
                      bottom: "30px",
                      right: "8px",
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
              </ListItemButton>
            </ListItem>
          ))}
        </SectionItem>
      ))}
    </div>
  );
}
