import { MouseEvent, useState } from "react";
import { format } from "date-fns";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { makeStyles } from "@material-ui/core/styles";
import BookChildrenTree from "$molecules/BookChildrenTree";
import CourseChip from "$atoms/CourseChip";
import Item from "$atoms/Item";
import BookItemDialog from "$organisms/BookItemDialog";
import { BookSchema } from "$server/models/book";
import { TopicSchema } from "$server/models/topic";
import useAccordionStyle from "styles/accordion";
import useAccordionSummaryStyle from "styles/accordionSummary";
import useAccordionDetailStyle from "styles/accordionDetail";

const useStyles = makeStyles((theme) => ({
  chips: {
    padding: theme.spacing(0, 2),
    "& > *": {
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  items: {
    padding: theme.spacing(0, 2),
    "& > *": {
      display: "inline-block",
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  tree: {
    margin: theme.spacing(2),
    marginBottom: 0,
  },
}));

type Props = {
  book: BookSchema;
  onEditClick(book: BookSchema): void;
  onTopicClick(topic: TopicSchema): void;
  onTopicEditClick?(topic: TopicSchema): void;
  isTopicEditable?(topic: TopicSchema): boolean | undefined;
};

export default function BookAccordion(props: Props) {
  const {
    book,
    onEditClick,
    onTopicClick,
    onTopicEditClick,
    isTopicEditable,
  } = props;
  const classes = useStyles();
  const accordionClasses = useAccordionStyle();
  const accordionSummaryClasses = useAccordionSummaryStyle();
  const accordionDetailClasses = useAccordionDetailStyle();
  const [open, setOpen] = useState(false);
  const handleInfoClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleItem = (handler?: (topic: TopicSchema) => void) => ([
    sectionIndex,
    topicIndex,
  ]: ItemIndex) => handler?.(book.sections[sectionIndex].topics[topicIndex]);
  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEditClick(book);
  };
  const handleChipClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };
  return (
    <Accordion classes={accordionClasses}>
      <AccordionSummary
        classes={accordionSummaryClasses}
        IconButtonProps={{ edge: "start" }}
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography variant="h6">{book.name}</Typography>
        <IconButton onClick={handleInfoClick}>
          <InfoOutlinedIcon />
        </IconButton>
        <IconButton color="primary" onClick={handleEditClick}>
          <EditOutlinedIcon />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails classes={accordionDetailClasses}>
        <div className={classes.chips}>
          {book.ltiResourceLinks.map((ltiResourceLink) => (
            <CourseChip
              key={ltiResourceLink.contextId}
              ltiResourceLink={ltiResourceLink}
              onClick={handleChipClick}
            />
          ))}
        </div>
        <div className={classes.items}>
          <Item itemKey="作成日" value={format(book.createdAt, "yyyy.MM.dd")} />
          <Item itemKey="更新日" value={format(book.updatedAt, "yyyy.MM.dd")} />
          <Item itemKey="著者" value={book.author.name} />
        </div>
        <Divider />
        <TreeView
          className={classes.tree}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <BookChildrenTree
            sections={book.sections}
            onItemClick={handleItem(onTopicClick)}
            onItemEditClick={handleItem(onTopicEditClick)}
            isTopicEditable={isTopicEditable}
          />
        </TreeView>
      </AccordionDetails>
      <BookItemDialog open={open} onClose={handleClose} book={book} />
    </Accordion>
  );
}
