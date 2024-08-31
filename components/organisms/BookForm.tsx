import { useCallback, useState } from "react";
import Card from "@mui/material/Card";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import type { AccordionProps } from "@mui/material/Accordion";
import MuiAccordion from "@mui/material/Accordion";
import type { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import type { AccordionDetailsProps } from "@mui/material/AccordionDetails";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import PublicIcon from "@mui/icons-material/Public";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { styled } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import ja from "date-fns/locale/ja";
import InputLabel from "$atoms/InputLabel";
import TextField from "$atoms/TextField";
import AuthorsInput from "$organisms/AuthorsInput";
import KeywordsInput from "$organisms/KeywordsInput";
import DomainsInput from "$organisms/DomainsInput";
import useCardStyles from "styles/card";
import gray from "theme/colors/gray";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { PublicBookSchema } from "$server/models/book/public";
import type { BookPropsWithSubmitOptions } from "$types/bookPropsWithSubmitOptions";
import type { AuthorSchema } from "$server/models/author";
import { useAuthorsAtom } from "store/authors";
import languages from "$utils/languages";
import useKeywordsInput from "$utils/useKeywordsInput";
import useDomainsInput from "$utils/useDomainsInput";

const useStyles = makeStyles((theme) => ({
  margin: {
    "& > :not(:first-child)": {
      marginTop: theme.spacing(2.5),
    },
  },
  labelDescription: {
    marginLeft: theme.spacing(0.75),
    color: gray[600],
  },
  inlineIcon: {
    verticalAlign: "middle",
  },
  divider: {
    margin: theme.spacing(0, -3, 0),
  },
  marginLeft: {
    marginLeft: theme.spacing(0.75),
  },
}));

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion {...props} />
))({
  boxShadow: "none",
  "&:before": {
    display: "none",
  },
});

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  padding: 0,
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper": {
    margin: theme.spacing(1),
  },
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
}));

const AccordionDetails = styled((props: AccordionDetailsProps) => (
  <MuiAccordionDetails {...props} />
))(({ theme }) => ({
  "& > :not(:first-child)": {
    marginTop: theme.spacing(2.5),
  },
}));

const label = {
  create: {
    submit: "作成",
    submitWithLink: "作成したブックを配信",
  },
  update: {
    submit: "更新",
    submitWithLink: "更新したブックを配信",
  },
} as const;

type Props = {
  book?: BookSchema;
  topics?: TopicSchema[];
  id?: string;
  linked?: boolean;
  hasLtiTargetLinkUri?: boolean;
  className?: string;
  variant?: "create" | "update";
  onSubmit?: (book: BookPropsWithSubmitOptions) => void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
};

export default function BookForm({
  book,
  topics,
  className,
  id,
  linked = false,
  hasLtiTargetLinkUri = false,
  variant = "create",
  onSubmit = () => undefined,
  onAuthorsUpdate,
  onAuthorSubmit,
}: Props) {
  const cardClasses = useCardStyles();
  const classes = useStyles();
  const { updateState: _updateState, ...authorsInputProps } = useAuthorsAtom();
  const keywordsInputProps = useKeywordsInput(book?.keywords ?? []);
  const [enablePublicBook, setEnablePublicBook] = useState(
    Boolean(book?.publicBooks?.length)
  );
  const [expireAt, setExpireAt] = useState<Date | null>(
    book?.publicBooks?.[0]?.expireAt ?? null
  );
  const [expireAtError, setExpireAtError] = useState(false);
  const handleExpireAtChange = useCallback(
    (newValue: Date | null) => {
      setExpireAtError(newValue != null && Number.isNaN(newValue.getTime()));
      setExpireAt(newValue);
    },
    [setExpireAt]
  );
  const domainsInputProps = useDomainsInput(
    book?.publicBooks?.[0]?.domains ?? []
  );
  const defaultValues: BookPropsWithSubmitOptions = {
    name: book?.name ?? "",
    description: book?.description ?? "",
    shared: Boolean(book?.shared),
    language: book?.language ?? Object.getOwnPropertyNames(languages)[0],
    sections: book?.sections,
    authors: book?.authors ?? [],
    keywords: book?.keywords ?? [],
    publicBooks: book?.publicBooks ?? [],
    submitWithLink: linked,
    topics: topics?.map((topic) => topic.id),
  };
  const { handleSubmit, register, setValue } =
    useForm<BookPropsWithSubmitOptions>({
      defaultValues,
    });
  const released = Boolean(book?.release);

  return (
    <Card
      classes={cardClasses}
      className={clsx(classes.margin, className)}
      id={id}
      component="form"
      onSubmit={handleSubmit((values) => {
        if (expireAt && Number.isNaN(expireAt.getTime())) return;

        if (enablePublicBook) {
          const publicBook = book?.publicBooks?.[0] ?? ({} as PublicBookSchema);
          // @ts-expect-error TODO: 画面上ではnullでないといけないが、送信時はundefinedでないといけない
          publicBook.expireAt = expireAt ?? undefined;
          publicBook.domains = domainsInputProps.domains;
          values.publicBooks = [publicBook];
        } else {
          values.publicBooks = [];
        }
        values.authors = authorsInputProps.authors;
        values.keywords = keywordsInputProps.keywords;
        onSubmit(values);
      })}
    >
      {released && (
        <div>
          <InputLabel htmlFor="shared">
            ブックをシェアする
            <Typography
              className={classes.labelDescription}
              variant="caption"
              component="span"
            >
              他の教材作成者とブックを共有します
            </Typography>
          </InputLabel>
          <Checkbox
            id="shared"
            name="shared"
            onChange={(_, checked) => setValue("shared", checked)}
            defaultChecked={defaultValues.shared}
            color="primary"
          />
        </div>
      )}

      {released && (
        <div>
          <InputLabel htmlFor="enable-public-book">
            ブックを公開する
            <Typography
              className={classes.labelDescription}
              variant="caption"
              component="span"
            >
              学習者以外もブックを視聴できるようにします
            </Typography>
          </InputLabel>
          <Checkbox
            id="enable-public-book"
            name="enablePublicBook"
            onChange={(_, checked) => setEnablePublicBook(checked)}
            defaultChecked={enablePublicBook}
            color="primary"
          />
        </div>
      )}

      {enablePublicBook && (
        <>
          <div>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ja}
              dateFormats={{ monthAndYear: "yyyy年MM月" }}
              localeText={{
                previousMonth: "前月を表示",
                nextMonth: "次月を表示",
              }}
            >
              <DateTimePicker
                slotProps={{
                  textField: { fullWidth: true, error: expireAtError },
                  toolbar: { toolbarFormat: "yyyy年MM月dd日" },
                }}
                label={
                  <>
                    公開期限
                    <Typography
                      className={classes.labelDescription}
                      variant="caption"
                      component="span"
                    >
                      * 指定しない場合は無期限になります
                    </Typography>
                  </>
                }
                format="yyyy年MM月dd日 HH時mm分"
                value={expireAt}
                onChange={handleExpireAtChange}
              />
            </LocalizationProvider>
          </div>
          <div>
            <DomainsInput {...domainsInputProps} />
          </div>
          <Alert severity="info">
            保存後、ブック一覧の <PublicIcon className={classes.inlineIcon} />{" "}
            をクリックすると、公開用URLをコピーできます。
          </Alert>
        </>
      )}

      <TextField
        inputProps={register("name")}
        label="タイトル"
        required={!released}
        fullWidth
        disabled={released}
      />
      <AuthorsInput
        {...authorsInputProps}
        onAuthorsUpdate={onAuthorsUpdate}
        onAuthorSubmit={onAuthorSubmit}
        disabled={released}
      />
      <KeywordsInput {...keywordsInputProps} disabled={released} />

      <Accordion>
        <AccordionSummary>
          <Typography>詳細を設定する</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="解説"
            fullWidth
            multiline
            inputProps={register("description")}
            disabled={released}
          />
          <Typography
            className={classes.labelDescription}
            variant="caption"
            component="span"
          >
            <Link
              href="https://github.github.com/gfm/"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Flavored Markdown
            </Link>
            {` `}
            に一部準拠しています
          </Typography>
          <TextField
            label="教材の主要な言語"
            select
            defaultValue={defaultValues.language}
            inputProps={register("language")}
            disabled={released}
          >
            {Object.entries(languages).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </AccordionDetails>
      </Accordion>

      <Divider className={classes.divider} />
      <Button variant="contained" color="primary" type="submit">
        {label[variant].submit}
      </Button>
      {!linked && (
        <FormControlLabel
          className={classes.marginLeft}
          label="コースへ配信"
          title={
            hasLtiTargetLinkUri
              ? "ツールURLが指定されているため、リンクの切り替えはできません"
              : "リンクを切り替える"
          }
          disabled={hasLtiTargetLinkUri}
          control={
            <Checkbox
              id="submit-with-link"
              name="submitWithLink"
              onChange={(_, checked) => setValue("submitWithLink", checked)}
              defaultChecked={defaultValues.submitWithLink}
              color="primary"
            />
          }
        />
      )}
    </Card>
  );
}
