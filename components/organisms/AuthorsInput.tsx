import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import type { SelectChangeEvent } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "$atoms/IconButton";
import Input from "$atoms/Input";
import InputLabel from "$atoms/InputLabel";
import Select from "$atoms/Select";
import { AuthorSchema } from "$server/models/author";
import { update, remove } from "$utils/reorder";
import { useSessionAtom } from "$store/session";

const AuthorItem = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  "& > :not(:last-child)": {
    marginRight: theme.spacing(2),
  },
  marginBottom: theme.spacing(1.5),
}));

const AuthorName = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  ".name": {
    lineHeight: 1,
  },
  ".email": {
    color: grey[700],
    fontSize: theme.typography.caption.fontSize,
  },
  ".lti-consumer-id": {
    color: grey[700],
    fontSize: theme.typography.caption.fontSize,
  },
}));

type Props = {
  id?: string;
  authors: AuthorSchema[];
  value: string;
  error?: boolean;
  helperText?: React.ReactNode;
  onInput?(value: string): void;
  onReset?(): void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
  disabled?: boolean;
};

export default function AuthorsInput({
  id,
  authors,
  value,
  error,
  helperText,
  onInput,
  onReset,
  onAuthorsUpdate,
  onAuthorSubmit,
  disabled = false,
}: Props) {
  const { session } = useSessionAtom();
  const handleAuthorUpdate =
    (author: AuthorSchema) => (event: SelectChangeEvent<unknown>) => {
      const index = authors.findIndex(({ id }) => id === author.id);
      onAuthorsUpdate(
        update(authors, index, {
          ...author,
          roleName: event.target
            .value as (typeof AuthorSchema._roleNames)[keyof typeof AuthorSchema._roleNames],
        })
      );
    };
  const handleAuthorRemove = (author: AuthorSchema) => () => {
    const index = authors.findIndex(({ id }) => id === author.id);
    onAuthorsUpdate(remove(authors, index));
  };
  const handleReset = () => onReset?.();
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) =>
    onInput?.(event.target.value);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // NOTE: このコンポーネントをform要素でラップしている場合にsubmitさせない目的
    if (event.key === "Enter") {
      event.preventDefault();
      handleAuthorSubmit();
    }
  };
  const handleAuthorSubmit = () => onAuthorSubmit({ email: value });

  return (
    <div>
      <InputLabel htmlFor={id} sx={{ mb: 1 }}>
        作成者
      </InputLabel>
      {authors.map((author) => (
        <AuthorItem key={author.id}>
          <AuthorName>
            <span className="name">{author.name}</span>
            <span className="email">{author.email}</span>
            <span className="lti-consumer-id">
              {author.ltiConsumerId} に存在する教員
            </span>
          </AuthorName>
          <Select
            onChange={handleAuthorUpdate(author)}
            value={author.roleName}
            disabled={disabled}
          >
            {Object.values(AuthorSchema._roleNames).map((roleName) => (
              <MenuItem key={roleName} value={roleName}>
                {roleName}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            onClick={handleAuthorRemove(author)}
            color="warning"
            tooltipProps={{ title: "この教員を取り除く" }}
            disabled={disabled || session?.user?.email === author.email}
          >
            <PersonRemoveIcon />
          </IconButton>
        </AuthorItem>
      ))}
      {!disabled && (
        <FormControl error={error}>
          <Input
            id={id}
            type="email"
            placeholder="user@example.com"
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            startAdornment={
              <InputAdornment position="start">
                <EmailOutlinedIcon />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleReset}
                  color="secondary"
                  tooltipProps={{ title: "入力をリセット" }}
                >
                  <CloseIcon />
                </IconButton>
                <IconButton
                  onClick={handleAuthorSubmit}
                  color="primary"
                  tooltipProps={{ title: "このメールアドレスの教員を追加" }}
                >
                  <PersonAddIcon />
                </IconButton>
              </InputAdornment>
            }
          />
          <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
      )}
    </div>
  );
}
