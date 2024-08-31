import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import KeywordChip from "$atoms/KeywordChip";
import IconButton from "$atoms/IconButton";
import Input from "$atoms/Input";
import InputLabel from "$atoms/InputLabel";
import type { KeywordPropSchema } from "$server/models/keyword";
import { remove } from "$utils/reorder";

const Keywords = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
}));

type Props = {
  id?: string;
  keywords: KeywordPropSchema[];
  value: string;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  onInput?(value: string): void;
  onReset?(): void;
  onKeywordsUpdate(keywords: KeywordPropSchema[]): void;
  onKeywordSubmit(keyword: KeywordPropSchema): void;
};
export default function KeywordsInput({
  id,
  keywords,
  value,
  error,
  helperText,
  disabled = false,
  onInput,
  onReset,
  onKeywordsUpdate,
  onKeywordSubmit,
}: Props) {
  const handleKeywordRemove = (keyword: KeywordPropSchema) => () => {
    const index = keywords.findIndex(({ name }) => name === keyword.name);
    onKeywordsUpdate(remove(keywords, index));
  };
  const handleReset = () => onReset?.();
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) =>
    onInput?.(event.target.value);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // NOTE: このコンポーネントをform要素でラップしている場合にsubmitさせない目的
    if (event.key === "Enter") {
      event.preventDefault();
      handleKeywordSubmit();
    }
  };
  const handleKeywordSubmit = () => onKeywordSubmit({ name: value });
  return (
    <div>
      <InputLabel htmlFor={id} sx={{ mb: 1 }}>
        キーワード
      </InputLabel>
      <Keywords>
        {keywords.map((keyword) => (
          <KeywordChip
            key={keyword.name}
            keyword={keyword}
            sx={{ mr: 0.5 }}
            onDelete={handleKeywordRemove(keyword)}
            disabled={disabled}
          />
        ))}
      </Keywords>
      {!disabled && (
        <FormControl error={error}>
          <Input
            id={id}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            startAdornment={
              <InputAdornment position="start">
                <LabelOutlinedIcon />
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
                  onClick={handleKeywordSubmit}
                  color="primary"
                  tooltipProps={{ title: "このキーワードを追加" }}
                >
                  <AddIcon />
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
