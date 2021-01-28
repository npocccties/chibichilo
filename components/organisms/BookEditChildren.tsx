import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Divider from "@material-ui/core/Divider";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AddIcon from "@material-ui/icons/Add";
import GetAppIcon from "@material-ui/icons/GetApp";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { makeStyles } from "@material-ui/core/styles";
import BookChildrenTree from "$molecules/BookChildrenTree";
import { SectionSchema } from "$server/models/book/section";
import { TopicSchema } from "$server/models/topic";
import useCardStyles from "$styles/card";

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: `0 ${theme.spacing(-3)}px ${theme.spacing(2)}px`,
  },
  items: {
    margin: `0 ${theme.spacing(-1)}px`,
    "& > *": {
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
}));

type Props = {
  sections: SectionSchema[];
  className?: string;
  onBookImportClick?(): void;
  onTopicImportClick?(): void;
  onTopicNewClick?(): void;
  onSectionNewClick?(): void;
  onSortableChange?(): void;
  onTopicClick(topic: TopicSchema): void;
  onTopicEditClick?(topic: TopicSchema): void;
  isTopicEditable?(topic: TopicSchema): boolean | undefined;
};

export default function BookEditChildren(props: Props) {
  const {
    sections,
    className,
    onTopicClick,
    onTopicEditClick,
    isTopicEditable,
  } = props;
  const cardClasses = useCardStyles();
  const classes = useStyles();
  const handleItem = (handler?: (topic: TopicSchema) => void) => ([
    sectionIndex,
    topicIndex,
  ]: ItemIndex) => handler?.(sections[sectionIndex].topics[topicIndex]);
  return (
    <Card classes={cardClasses} className={className}>
      <div className={classes.items}>
        <Button size="small" color="primary" onClick={props.onBookImportClick}>
          <GetAppIcon className={classes.icon} />
          ブックからインポート
        </Button>
        <Button size="small" color="primary" onClick={props.onTopicImportClick}>
          <GetAppIcon className={classes.icon} />
          インポート
        </Button>
        <Button size="small" color="primary" onClick={props.onTopicNewClick}>
          <AddIcon className={classes.icon} />
          トピックの作成
        </Button>
        <Button size="small" color="primary" onClick={props.onSectionNewClick}>
          <AddIcon className={classes.icon} />
          セクションの作成
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={props.onSortableChange}
          disabled // TODO: セクションの並び替え機能を実装したら有効化して
        >
          <DragIndicatorIcon fontSize="small" />
          並び替え
        </Button>
      </div>
      <Divider className={classes.divider} />
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <BookChildrenTree
          sections={sections}
          onItemClick={handleItem(onTopicClick)}
          onItemEditClick={handleItem(onTopicEditClick)}
          isTopicEditable={isTopicEditable}
        />
      </TreeView>
    </Card>
  );
}
