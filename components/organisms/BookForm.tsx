import { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
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
  variant?: "create" | "update" | "other";
  onSubmit?: (book: BookPropsWithSubmitOptions) => void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
};

type FormProps = BookPropsWithSubmitOptions & {
  enablePublicBook: boolean;
  expireAt: Date | null;
  domains: string[];
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

  // 初期値の設定
  const defaultKeywords = book?.keywords ?? [];
  const defaultValues: FormProps = {
    name: book?.name ?? "",
    description: book?.description ?? "",
    shared: Boolean(book?.shared),
    authors: book?.authors ?? [],
    keywords: defaultKeywords,
    publicBooks: book?.publicBooks ?? [],
    submitWithLink: linked,
    topics: topics?.map((topic) => topic.id),
    enablePublicBook: Boolean(book?.publicBooks?.length),
    expireAt: book?.publicBooks?.[0]?.expireAt ?? null,
    domains: book?.publicBooks?.[0]?.domains ?? [],
  };
  const keywordsInputProps = useKeywordsInput(defaultKeywords);
  const domainsInputProps = useDomainsInput(defaultValues.domains);
  const { handleSubmit, register, setValue, getValues, formState } =
    useForm<FormProps>({
      values: defaultValues,
    });

  // 更新が必要かどうか、状態を管理する
  useEffect(() => {
    setValue("keywords", keywordsInputProps.keywords, { shouldDirty: true });
  }, [keywordsInputProps.keywords, setValue]);
  useEffect(() => {
    setValue("domains", domainsInputProps.domains, { shouldDirty: true });
  }, [domainsInputProps.domains, setValue]);

  // 公開期限のエラー処理
  const [expireAtError, setExpireAtError] = useState(false);
  const handleExpireAtChange = useCallback(
    (newValue: Date | null) => {
      setExpireAtError(newValue != null && Number.isNaN(newValue.getTime()));
      setValue("expireAt", newValue, { shouldDirty: true });
    },
    [setValue]
  );

  const released = Boolean(book?.release);

  return (
    <Card
      classes={cardClasses}
      className={clsx(classes.margin, className)}
      id={id}
      component="form"
      onSubmit={handleSubmit((values) => {
        if (values.expireAt && Number.isNaN(values.expireAt.getTime())) return;

        if (values.enablePublicBook) {
          const publicBook = book?.publicBooks?.[0] ?? ({} as PublicBookSchema);
          // @ts-expect-error TODO: 画面上ではnullでないといけないが、送信時はundefinedでないといけない
          publicBook.expireAt = values.expireAt ?? undefined;
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
      {!released && book?.shared && (
        <div>
          ブックのシェア機能は廃止されました。第三者にコンテンツを提供する場合は、コンテンツをリリースして、共有を有効にしてください。
          <FormControlLabel
            className={classes.marginLeft}
            label="上記のメッセージを、表示しないようにする"
            title={"メッセージを表示しない"}
            control={
              <Checkbox
                onChange={(_, checked) =>
                  setValue("shared", !checked, { shouldDirty: true })
                }
                defaultChecked={!defaultValues.shared}
                color="primary"
              />
            }
          />
        </div>
      )}

      {variant !== "other" && (
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
            onChange={(_, checked) =>
              setValue("enablePublicBook", checked, { shouldDirty: true })
            }
            defaultChecked={defaultValues.enablePublicBook}
            color="primary"
          />
        </div>
      )}

      {getValues("enablePublicBook") && (
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
                value={getValues("expireAt")}
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
        </AccordionDetails>
      </Accordion>

      {variant !== "other" && (
        <>
          <Divider className={classes.divider} />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!formState.isDirty}
          >
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
                  onChange={(_, checked) =>
                    setValue("submitWithLink", checked, { shouldDirty: true })
                  }
                  defaultChecked={defaultValues.submitWithLink}
                  color="primary"
                />
              }
            />
          )}
        </>
      )}
    </Card>
  );
}
