import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import Box from "@mui/material/Box";
import makeStyles from "@mui/styles/makeStyles";
import LinkSwitch from "$atoms/LinkSwitch";
import SectionsEdit from "$organisms/SectionsEdit";
import BookForm from "$organisms/BookForm";
import Container from "$atoms/Container";
import RequiredDot from "$atoms/RequiredDot";
import BackButton from "$atoms/BackButton";
import type { BookSchema } from "$server/models/book";
import type { BookPropsWithSubmitOptions } from "$types/bookPropsWithSubmitOptions";
import type { SectionProps } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import type { AuthorSchema } from "$server/models/author";
import type { IsContentEditable } from "$server/models/content";
import { useConfirm } from "material-ui-confirm";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(1),
    "& > :not($title):not($content)": {
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  content: {
    marginBottom: theme.spacing(4),
  },
  subtitle: {
    "& span": {
      verticalAlign: "middle",
    },
    "& .RequiredDot": {
      marginRight: theme.spacing(0.5),
      marginBottom: theme.spacing(0.75),
      marginLeft: theme.spacing(2),
    },
  },
}));

type Props = {
  book: BookSchema;
  linked?: boolean;
  isContentEditable?: IsContentEditable;
  back(): void;
  onUpdateBook(book: BookPropsWithSubmitOptions): void;
  onDeleteBook(): void;
  onSectionsUpdate(sections: SectionProps[]): void;
  onTopicImportClick(): void;
  onTopicNewClick(): void;
  onTopicEditClick?(topic: TopicSchema): void;
  onBookImportClick(): void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
  onLinkSwitchClick(checked: boolean): void;
  onReleaseButtonClick(): void;
  onBookTreeButtonClick(): void;
  onTopicPreview(topic: TopicSchema): void;
};

export default function BookEdit({
  book,
  linked,
  isContentEditable,
  back,
  onUpdateBook,
  onDeleteBook,
  onSectionsUpdate,
  onTopicImportClick,
  onTopicNewClick,
  onTopicEditClick,
  onBookImportClick,
  onAuthorsUpdate,
  onAuthorSubmit,
  onLinkSwitchClick,
  onReleaseButtonClick,
  onBookTreeButtonClick,
  onTopicPreview,
}: Props) {
  const classes = useStyles();
  const confirm = useConfirm();
  const handleDeleteButtonClick = async () => {
    await confirm({
      title: `ブック「${book.name}」を削除します。よろしいですか？`,
      cancellationText: "キャンセル",
      confirmationText: "OK",
    });
    onDeleteBook();
  };

  return (
    <Container className={classes.container} maxWidth="md">
      <BackButton onClick={back}>戻る</BackButton>
      <Typography className={classes.title} variant="h4">
        ブック「{book.name}」の編集
      </Typography>
      <Typography className={classes.subtitle} variant="h5">
        トピック
      </Typography>
      <SectionsEdit
        className={classes.content}
        sections={book.sections}
        onTopicPreviewClick={onTopicPreview}
        onTopicEditClick={onTopicEditClick}
        onTopicImportClick={onTopicImportClick}
        onTopicNewClick={onTopicNewClick}
        onBookImportClick={onBookImportClick}
        onSectionsUpdate={onSectionsUpdate}
        isContentEditable={isContentEditable}
      />
      <Typography className={classes.subtitle} variant="h5">
        基本情報
        <Typography variant="caption" component="span" aria-hidden="true">
          <RequiredDot />
          は必須項目です
        </Typography>
      </Typography>
      <BookForm
        className={classes.content}
        book={book}
        variant="update"
        onSubmit={onUpdateBook}
        onAuthorsUpdate={onAuthorsUpdate}
        onAuthorSubmit={onAuthorSubmit}
      />
      <Box
        className="book-edit-row"
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <Typography component="label" variant="caption">
          <LinkSwitch
            defaultChecked={linked}
            onChange={(_, checked) => onLinkSwitchClick(checked)}
          />
          コースへ配信
        </Typography>
        <Button size="small" color="primary" onClick={onReleaseButtonClick}>
          <PeopleOutlinedIcon />
          リリース
        </Button>
        <Button size="small" color="primary" onClick={onBookTreeButtonClick}>
          <AccountTreeOutlinedIcon />
          ツリー表示
        </Button>
        <Button size="small" color="primary" onClick={handleDeleteButtonClick}>
          <DeleteOutlinedIcon />
          ブックを削除
        </Button>
      </Box>
    </Container>
  );
}
