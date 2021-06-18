import { useState } from "react";
import clsx from "clsx";
import { useTheme, makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import Container from "@material-ui/core/Container";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import PictureInPictureIcon from "@material-ui/icons/PictureInPicture";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import LinkIcon from "@material-ui/icons/Link";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import BookChildren from "$organisms/BookChildren";
import BookItemDialog from "$organisms/BookItemDialog";
import TopicViewer from "$organisms/TopicViewer";
import ActionHeader from "$organisms/ActionHeader";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import { useSessionAtom } from "$store/session";
import useSticky from "$utils/useSticky";
import useAppBarOffset from "$utils/useAppBarOffset";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "baseline",
    width: "100%",
    "& > *": {
      marginRight: theme.spacing(1),
    },
    "&$mobile": {
      fontSize: "1.75rem",
      alignItems: "center",
    },
    "& > $title ~ *": {
      flexShrink: 0,
    },
  },
  title: {
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
  inner: {
    display: "grid",
    gap: `${theme.spacing(2)}px`,
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
  main: {
    gridArea: "main",
    "&$desktop": {
      marginBottom: theme.spacing(2),
    },
  },
  side: {
    gridArea: "side",
    "&$desktop": {
      marginTop: theme.spacing(2),
    },
    "&$mobile": {
      marginBottom: theme.spacing(2),
    },
  },
  scroll: ({ offset }: { offset: number }) => ({
    overflowY: "auto",
    height: `calc(100vh - ${offset}px)`,
  }),
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(3),
    zIndex: 1,
  },
  desktop: {},
  mobile: {},
}));

type Props = {
  linked?: boolean;
  book: BookSchema | null;
  index: ItemIndex;
  onBookEditClick?(book: BookSchema): void;
  onBookLinkClick?(book: BookSchema): void;
  onOtherBookLinkClick(): void;
  onTopicEditClick?(topic: TopicSchema): void;
  onTopicEnded(): void;
  onItemClick(index: ItemIndex): void;
  considerAppBar?: boolean;
};

export default function Book(props: Props) {
  const {
    linked,
    book,
    index: [sectionIndex, topicIndex],
    onBookEditClick,
    onBookLinkClick,
    onOtherBookLinkClick,
    onTopicEditClick,
    onTopicEnded,
    onItemClick,
    considerAppBar = true,
  } = props;
  const topic = book?.sections[sectionIndex]?.topics[topicIndex];
  const { isInstructor, isBookEditable, isTopicEditable } = useSessionAtom();
  const trigger = useScrollTrigger();
  const theme = useTheme();
  const sideOffset = trigger ? theme.spacing(2) : theme.spacing(6);
  const actionHeaderOffset = 80;
  const appBarOffset = useAppBarOffset();
  const offset = (considerAppBar ? appBarOffset : 0) + actionHeaderOffset;
  const classes = useStyles({ offset: offset + sideOffset });
  const sticky = useSticky({ offset });
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);
  const handleInfoClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleBookEditClick = () => book && onBookEditClick?.(book);
  const handleBookLinkClick = () => book && onBookLinkClick?.(book);
  const handleOtherBookLinkClick = () => onOtherBookLinkClick();
  const handleItemClick = (_: never, index: ItemIndex) => {
    onItemClick(index);
  };
  const handleItemEditClick =
    isInstructor && onTopicEditClick
      ? (_: never, [sectionIndex, topicIndex]: ItemIndex) => {
          const topic = book?.sections[sectionIndex]?.topics[topicIndex];
          if (topic) onTopicEditClick?.(topic);
        }
      : undefined;
  const [minimize, setMinimize] = useState(false);
  const handleFabClick = () => setMinimize(!minimize);

  return (
    <Container maxWidth="lg">
      <ActionHeader
        considerAppBar={considerAppBar}
        action={
          <Typography
            className={clsx(classes.header, { [classes.mobile]: !matches })}
            variant="h4"
            gutterBottom={true}
          >
            <span className={classes.title}>{book?.name}</span>
            <IconButton onClick={handleInfoClick}>
              <InfoOutlinedIcon />
            </IconButton>
            {isInstructor &&
              book &&
              onBookEditClick &&
              (isBookEditable(book) || book.shared) && (
                <IconButton color="primary" onClick={handleBookEditClick}>
                  <EditOutlinedIcon />
                </IconButton>
              )}
            {isInstructor && !linked && onBookLinkClick && (
              <Button
                size="small"
                color="primary"
                onClick={handleBookLinkClick}
              >
                <LinkIcon className={classes.icon} />
                このブックを提供
              </Button>
            )}
            {isInstructor && linked && (
              <Button
                size="small"
                color="primary"
                onClick={handleOtherBookLinkClick}
              >
                <LinkIcon className={classes.icon} />
                他のブックを提供
              </Button>
            )}
            {/* TODO: 「このブックを提供解除」ボタンの実装 */}
          </Typography>
        }
      />
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
              onEnded={onTopicEnded}
              offset={offset}
              minimize={matches && minimize}
            />
          )}
        </div>
        <div
          className={clsx(
            classes.side,
            matches ? classes.desktop : classes.mobile,
            { [classes.scroll]: matches },
            sticky
          )}
        >
          <BookChildren
            index={[sectionIndex, topicIndex]}
            sections={book?.sections ?? []}
            onItemClick={handleItemClick}
            onItemEditClick={handleItemEditClick}
            isTopicEditable={isTopicEditable}
          />
        </div>
      </div>
      {matches && (
        <Tooltip title={minimize ? "動画を拡大" : "動画を縮小"}>
          <Fab className={classes.fab} color="primary" onClick={handleFabClick}>
            {minimize ? <FullscreenIcon /> : <PictureInPictureIcon />}
          </Fab>
        </Tooltip>
      )}
      {book && <BookItemDialog open={open} onClose={handleClose} book={book} />}
    </Container>
  );
}
