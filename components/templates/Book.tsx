import { useState } from "react";
import clsx from "clsx";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LinkIcon from "@mui/icons-material/Link";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import EditButton from "$atoms/EditButton";
import ForkButton from "$atoms/ForkButton";
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

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    margin: 0,
    width: "100%",
    "& > *": {
      marginRight: theme.spacing(1),
    },
    "& > $title ~ *": {
      flexShrink: 0,
    },
  },
  title: {
    fontSize: "1.75rem",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    // NOTE: IconButtonの有無で高さが変わることへの対処
    minHeight: 40,
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
  description: {
    display: "flex",
    alignItems: "baseline",
    "& > dl": {
      marginRight: theme.spacing(2),
    },
    "& > button": {
      fontSize: "0.75rem",
      flexShrink: 0,
    },
  },
  inner: {
    display: "grid",
    gap: theme.spacing(2),
    "&$desktop": {
      gridTemplateAreas: `
        "side main"
      `,
      gridTemplateColumns: "30% 1fr",
      gridAutoRows: "min-content",
    },
    "&$mobile": {
      gridTemplateAreas: `
        "main"
        "side"
      `,
    },
  },
  info: {
    marginBottom: theme.spacing(2),
  },
  main: {
    gridArea: "main",
    "&$desktop": {
      marginBottom: theme.spacing(2),
    },
  },
  side: {
    gridArea: "side",
    "&$mobile": {
      marginBottom: theme.spacing(2),
    },
  },
  scroll: ({ offset }: { offset: string }) => ({
    overflowY: "auto",
    height: `calc(100vh - ${offset})`,
  }),
  desktop: {},
  mobile: {},
}));

type Props = {
  linked?: boolean;
  book: BookSchema | null;
  bookActivity?: ActivitySchema[];
  index: ItemIndex;
  onBookEditClick?(book: BookSchema): void;
  onBookForkClick?(): void;
  onOtherBookLinkClick?(): void;
  onTopicEditClick?(topic: TopicSchema): void;
  onTopicEnded(): void;
  onItemClick(index: ItemIndex): void;
  considerAppBar?: boolean;
};

export default function Book(props: Props) {
  const {
    linked,
    book,
    bookActivity,
    index: [sectionIndex, topicIndex],
    onBookEditClick,
    onBookForkClick,
    onOtherBookLinkClick,
    onTopicEditClick,
    onTopicEnded,
    onItemClick,
    considerAppBar = true,
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
  const classes = useStyles({
    offset: sumPixels(offset, sideOffset),
  });
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
    <Container maxWidth="lg">
      <ActionHeader sx={{ pb: 0 }} considerAppBar={considerAppBar}>
        <header className={classes.header}>
          <Typography
            className={clsx(classes.title, { [classes.mobile]: !matches })}
            variant="h4"
          >
            {book?.name}
          </Typography>
          <Chip
            sx={{ mr: 1, mb: 0.5 }}
            label={`学習時間 ${formatInterval(
              0,
              (book?.timeRequired ?? 0) * 1000
            )}`}
          />
          {book?.shared && <SharedIndicator />}
          {onBookEditClick && (
            <EditButton
              variant="book"
              size="medium"
              onClick={handleBookEditClick}
            />
          )}
          {onBookForkClick && (
            <ForkButton size="medium" onClick={onBookForkClick} />
          )}
          {isInstructor && linked && onOtherBookLinkClick && (
            <Button
              size="small"
              color="primary"
              onClick={handleOtherBookLinkClick}
            >
              <LinkIcon className={classes.icon} />
              他のブックを配信
            </Button>
          )}
        </header>
      </ActionHeader>
      {book && (
        <>
          <div className={classes.description}>
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
                ...authors(book),
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
          </div>
          <CollapsibleContent expanded={expanded}>
            <BookInfo id="book-info" className={classes.info} book={book} />
          </CollapsibleContent>
        </>
      )}
      <div
        className={clsx(
          classes.inner,
          matches ? classes.desktop : classes.mobile
        )}
      >
        <div className={clsx(classes.main, { [classes.desktop]: matches })}>
          {topic && (
            <TopicViewer
              topic={topic}
              bookActivity={bookActivity}
              onEnded={onTopicEnded}
              offset={offset}
            />
          )}
        </div>
        <div
          className={clsx(
            classes.side,
            matches ? classes.scroll : classes.mobile,
            sticky
          )}
        >
          <Sections
            index={[sectionIndex, topicIndex]}
            sections={book?.sections ?? []}
            onItemClick={handleItemClick}
            onItemEditClick={handleItemEditClick}
            isContentEditable={isContentEditable}
          />
        </div>
      </div>
    </Container>
  );
}
