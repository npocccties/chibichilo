import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useForm, Controller } from "react-hook-form";
import clsx from "clsx";
import TextField from "$atoms/TextField";
import useCardStyles from "styles/card";
import useInputLabelStyles from "styles/inputLabel";
import gray from "theme/colors/gray";
import { BookProps, BookSchema } from "$server/models/book";
import languages from "$utils/languages";

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
}));

type Props = {
  book?: BookSchema;
  className?: string;
  submitLabel?: string;
  onSubmit?: (book: BookProps) => void;
};

export default function BookForm(props: Props) {
  const {
    book,
    className,
    submitLabel = "更新",
    onSubmit = () => undefined,
  } = props;
  const cardClasses = useCardStyles();
  const inputLabelClasses = useInputLabelStyles();
  const classes = useStyles();
  const defaultValues: BookProps = {
    name: book?.name ?? "",
    description: book?.description ?? "",
    shared: Boolean(book?.shared),
    language: book?.language ?? Object.getOwnPropertyNames(languages)[0],
    sections: book?.sections,
  };
  const { handleSubmit, register, control } = useForm<BookProps>({
    defaultValues,
  });

  return (
    <Card
      classes={cardClasses}
      className={clsx(classes.margin, className)}
      component="form"
      onSubmit={handleSubmit((values: BookProps) => {
        onSubmit({ ...defaultValues, ...values });
      })}
    >
      <TextField
        name="name"
        inputRef={register}
        label={
          <>
            タイトル
            <Typography
              className={classes.labelDescription}
              variant="caption"
              component="span"
            >
              学習者が学習範囲を簡潔に理解できるタイトルを設定できます
            </Typography>
          </>
        }
        required
        fullWidth
      />
      <div>
        <InputLabel classes={inputLabelClasses} htmlFor="shared">
          他の編集者にシェア
        </InputLabel>
        <Checkbox
          id="shared"
          name="shared"
          inputRef={register}
          defaultChecked={defaultValues.shared}
          color="primary"
        />
      </div>
      <Controller
        name="language"
        control={control}
        defaultValue={defaultValues.language}
        render={(props) => (
          <TextField label="教材の主要な言語" select inputProps={props}>
            {Object.entries(languages).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <TextField
        label="解説"
        fullWidth
        multiline
        name="description"
        inputRef={register}
      />
      <Button variant="contained" color="primary" type="submit">
        {submitLabel}
      </Button>
    </Card>
  );
}
