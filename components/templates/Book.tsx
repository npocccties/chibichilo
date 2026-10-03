import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import LinkIcon from "@mui/icons-material/Link";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import EditButton from "$atoms/EditButton";
import SharedIndicator from "$atoms/SharedIndicator";
import DescriptionList from "$atoms/DescriptionList";
import Sections from "$organisms/Sections";
import TopicViewer from "$organisms/TopicViewer";
import ActionHeader from "$organisms/ActionHeader";
import BookInfo from "$organisms/BookInfo";
import CollapsibleContent from "$organisms/CollapsibleContent";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import { useSessionAtom } from "$store/session";
import useSticky from "$utils/useSticky";
import useAppBarOffset from "$utils/useAppBarOffset";
import getLocaleDateString from "$utils/getLocaleDateString";
import { authors } from "$utils/descriptionList";
import extractNumberFromPx from "$utils/extractNumberFromPx";
import sumPixels from "$utils/sumPixels";
import type { ActivitySchema } from "$server/models/activity";
import Chip from "@mui/material/Chip";
import formatInterval from "$utils/formatInterval";
import type { ReleaseItemSchema } from "$server/models/releaseResult";
import License from "$atoms/License";
import type { ContentSchema } from "$server/models/content";

const headerSx = {
  display: "flex",
  alignItems: "center",
  m: 0,
  width: "100%",
  "& > *": {
    mr: 1,
  },
  "& > h4 ~ *": {
    flexShrink: 0,
  },
};

const headerHiddenSx = {
  visibility: "hidden",
};

const titleSx = {
  fontSize: "1.75rem",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  // NOTE: IconButtonの有無で高さが変わることへの対処
  minHeight: 40,
};

const descriptionSx = {
  display: "flex",
  alignItems: "baseline",
  "& > dl": {
    mr: 2,
  },
  "& > button": {
    fontSize: "0.75rem",
    flexShrink: 0,
  },
};

const infoSx = {
  mb: 2,
};

const getInnerSx = (matches: boolean): SxProps<Theme> => ({
  display: "grid",
  gap: 2,
  ...(matches
    ? {
        gridTemplateAreas: `
        "side main"
      `,
        gridTemplateColumns: "30% minmax(0, 1fr)",
        gridAutoRows: "min-content",
      }
    : {
        gridTemplateAreas: `
        "main"
        "side"
      `,
      }),
});

const getMainSx = (matches: boolean): SxProps<Theme> => ({
  gridArea: "main",
  minWidth: 0,
  ...(matches ? { mb: 2 } : {}),
});

const getSideSx = (matches: boolean, offset: string): SxProps<Theme> => ({
  gridArea: "side",
  overflowY: "auto",
  ...(matches
    ? {
        height: `calc(100vh - ${offset})`,
      }
    : { mb: 2 }),
});

type Props = {
  linked?: boolean;
  book: BookSchema | null;
  parent?: ReleaseItemSchema;
  bookActivity?: ActivitySchema[];
  index: ItemIndex;
  isPrivateBook?: boolean;
  isBookPage?: boolean;
  onBookEditClick?(book: BookSchema): void;
  onOtherBookLinkClick?(): void;
  onTopicEditClick?(topic: TopicSchema): void;
  onTopicEnded(): void;
  onItemClick(index: ItemIndex): void;
  considerAppBar?: boolean;
  onContentLinkClick?(
    content: Pick<BookSchema, "id"> | ContentSchema,
    checked: boolean,
    topicId?: TopicSchema["id"]
  ): void;
};

export default function Book(props: Props) {
  const {
    linked,
    book,
    parent,
    bookActivity,
    index: [sectionIndex, topicIndex],
    isPrivateBook = false,
    isBookPage = false,
    onBookEditClick,
    onOtherBookLinkClick,
    onTopicEditClick,
    onTopicEnded,
    onItemClick,
    considerAppBar = true,
    onContentLinkClick,
  } = props;

  const topic = book?.sections[sectionIndex]?.topics[topicIndex];
  const { isInstructor, isContentEditable } = useSessionAtom();
  const [expanded, setExpanded] = useState(false);
  const handleLinkClick = () => setExpanded(!expanded);
  const theme = useTheme();
  const trigger = useScrollTrigger({
    threshold: extractNumberFromPx(theme.spacing(4)),
    disableHysteresis: true,
  });
  const sideOffset = sumPixels(
    theme.spacing(2),
    trigger ? "0px" : theme.spacing(4)
  );
  const actionHeaderOffset = sumPixels("40px", theme.spacing(2));
  const appBarOffset = useAppBarOffset();
  const offset = sumPixels(
    actionHeaderOffset,
    considerAppBar ? appBarOffset : "0px"
  );
  const scrollOffset = sumPixels(offset, sideOffset);
  const sticky = useSticky({ offset });
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const handleBookEditClick = () => book && onBookEditClick?.(book);
  const handleOtherBookLinkClick = () => onOtherBookLinkClick?.();
  const handleItemClick = (index: ItemIndex) => onItemClick(index);
  const handleItemEditClick =
    isInstructor && onTopicEditClick
      ? ([sectionIndex, topicIndex]: ItemIndex) => {
          const topic = book?.sections[sectionIndex]?.topics[topicIndex];
          if (topic) onTopicEditClick?.(topic);
        }
      : undefined;

  return (
    <Container maxWidth={matches ? "lg" : false} disableGutters={!matches}>
      <ActionHeader sx={{ pb: 0 }} considerAppBar={considerAppBar}>
        <Box component="header" sx={[headerSx, trigger && headerHiddenSx]}>
          <Typography sx={titleSx} variant="h4">
            {book?.name}
          </Typography>
          <Chip
            sx={{ mr: 1, mb: 0.5 }}
            label={`学習時間 ${formatInterval(
              0,
              (book?.timeRequired ?? 0) * 1000
            )}`}
          />
          {book?.license && <License license={book?.license} />}
          {book?.release?.shared && <SharedIndicator />}
          {isInstructor &&
            book &&
            onBookEditClick &&
            isContentEditable(book) && (
              <EditButton
                variant="book"
                size="medium"
                onClick={handleBookEditClick}
              />
            )}
          {isInstructor && linked && onOtherBookLinkClick && (
            <Button
              size="small"
              color="primary"
              onClick={handleOtherBookLinkClick}
            >
              <LinkIcon sx={{ mr: 0.5 }} />
              他のブックを配信
            </Button>
          )}
        </Box>
      </ActionHeader>
      {book && (
        <>
          <Box sx={descriptionSx}>
            <DescriptionList
              inline
              nowrap
              value={[
                ...(book.release?.releasedAt
                  ? [
                      {
                        key: "バージョン",
                        value: book.release.version,
                      },
                      {
                        key: "リリース日",
                        value: getLocaleDateString(
                          book.release.releasedAt,
                          "ja"
                        ),
                      },
                    ]
                  : []),
                {
                  key: "作成日",
                  value: getLocaleDateString(book.createdAt, "ja"),
                },
                {
                  key: "更新日",
                  value: getLocaleDateString(book.updatedAt, "ja"),
                },
                // 著作権者または作成者
                ...(book.licenser
                  ? [{ key: "", value: book.licenser }]
                  : authors(book)),
              ]}
            />
            <Link
              component="button"
              aria-expanded={expanded}
              aria-controls="book-info"
              onClick={handleLinkClick}
            >
              ブックの詳細
            </Link>
          </Box>
          <CollapsibleContent expanded={expanded}>
            <Box sx={infoSx}>
              <BookInfo id="book-info" book={book} parent={parent} />
            </Box>
          </CollapsibleContent>
        </>
      )}
      <Box sx={getInnerSx(matches)}>
        <Box sx={getMainSx(matches)}>
          {topic && (
            <TopicViewer
              topic={topic}
              book={book}
              bookActivity={bookActivity}
              onEnded={onTopicEnded}
              offset={offset}
              isPrivateBook={isPrivateBook}
              isBookPage={isBookPage}
            />
          )}
        </Box>
        <Box sx={getSideSx(matches, scrollOffset)} className={sticky}>
          <Sections
            index={[sectionIndex, topicIndex]}
            bookId={book?.id ?? -1}
            sections={book?.sections ?? []}
            onItemClick={handleItemClick}
            onItemEditClick={handleItemEditClick}
            isContentEditable={isContentEditable}
            isPrivateBook={isPrivateBook}
            onContentLinkClick={onContentLinkClick}
          />
        </Box>
      </Box>
    </Container>
  );
}
