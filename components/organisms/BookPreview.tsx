import { useState } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import Radio from "@material-ui/core/Radio";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { makeStyles } from "@material-ui/core/styles";
import Video from "$organisms/Video";
import CourseChip from "$atoms/CourseChip";
import Item from "$atoms/Item";
import SharedIndicator from "$atoms/SharedIndicator";
import BookItemDialog from "$organisms/BookItemDialog";
import useCardStyle from "styles/card";
import { BookSchema } from "$server/models/book";
import { TopicSchema } from "$server/models/topic";
import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import { getSectionsOutline } from "$utils/outline";
import { gray, primary } from "$theme/colors";
import useLineClampStyles from "$styles/lineClamp";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  left: {
    flex: 1,
    paddingRight: theme.spacing(1),
  },
  right: {
    flexShrink: 0,
    width: "30%",
  },
  title: {
    display: "flex",
    alignItems: "center",
    fontWeight: 500,
  },
  outline: {
    margin: 0,
    color: gray[700],
  },
  checkbox: {
    marginLeft: theme.spacing(-1.5),
  },
  shared: {
    margin: theme.spacing(0, 1),
  },
  chips: {
    "& > *": {
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  items: {
    "& > *": {
      display: "inline-block",
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  selected: {
    backgroundColor: primary[50],
  },
}));

type Props = Parameters<typeof Radio>[0] & {
  book: BookSchema;
  onEditClick?: ((book: BookSchema) => void) | false | undefined;
  onLtiContextClick?(
    ltiResourceLink: Pick<LtiResourceLinkSchema, "consumerId" | "contextId">
  ): void;
};

export default function BookPreview({
  book,
  onEditClick,
  onLtiContextClick,
  checked,
  ...radioProps
}: Props) {
  const cardClasses = useCardStyle();
  const classes = useStyles();
  const titleClamp = useLineClampStyles({
    fontSize: "1.25rem",
    lineClamp: 2,
    lineHeight: 1.6,
  });
  const outlineClamp = useLineClampStyles({
    fontSize: "0.875rem",
    lineClamp: 3,
    lineHeight: 1.25,
  });
  const [topic] = useState<TopicSchema | undefined>(
    book.sections[0]?.topics[0]
  );
  const [open, setOpen] = useState(false);
  const handleInfoClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handle = (handler?: (book: BookSchema) => void) => () => {
    handler?.(book);
  };
  const id = `${book.id}`;
  return (
    <Card
      classes={cardClasses}
      className={clsx(classes.root, { [classes.selected]: checked })}
    >
      <div className={classes.left}>
        <div className={clsx(classes.title, titleClamp.placeholder)}>
          <Radio
            className={classes.checkbox}
            color="primary"
            checked={checked}
            id={id}
            {...radioProps}
          />
          <label className={titleClamp.clamp} htmlFor={id}>
            {book.name}
          </label>
          {book.shared && <SharedIndicator className={classes.shared} />}
          <IconButton onClick={handleInfoClick}>
            <InfoOutlinedIcon />
          </IconButton>
          {onEditClick && (
            <IconButton color="primary" onClick={handle(onEditClick)}>
              <EditOutlinedIcon />
            </IconButton>
          )}
        </div>
        <div className={classes.chips}>
          {book.ltiResourceLinks.map((ltiResourceLink, index) => (
            <CourseChip
              key={index}
              ltiResourceLink={ltiResourceLink}
              onLtiResourceLinkClick={onLtiContextClick}
            />
          ))}
        </div>
        <div className={classes.items}>
          <Item itemKey="作成日" value={format(book.createdAt, "yyyy.MM.dd")} />
          <Item itemKey="更新日" value={format(book.updatedAt, "yyyy.MM.dd")} />
          <Item itemKey="著者" value={book.author.name} />
        </div>
        <p
          className={clsx(
            classes.outline,
            outlineClamp.clamp,
            outlineClamp.placeholder
          )}
        >
          {getSectionsOutline(book.sections)}
        </p>
        <Button
          size="small"
          color="primary"
          disabled={true /* TODO: BookPreviewDialogを実装したら取り除く */}
        >
          もっと詳しく...
        </Button>
      </div>
      <div className={classes.right}>
        {topic && "providerUrl" in topic.resource && (
          <Video {...topic.resource} />
        )}
      </div>
      {book && <BookItemDialog open={open} onClose={handleClose} book={book} />}
    </Card>
  );
}
