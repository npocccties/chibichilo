import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import type { DropResult } from "react-beautiful-dnd";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "$atoms/IconButton";
import Input from "$atoms/Input";
import InputLabel from "$atoms/InputLabel";
import type { KeywordPropSchema } from "$server/models/keyword";
import reorder, { remove } from "$utils/reorder";

const Keywords = styled("div")(({ theme }) => ({
  display: "flex",
  overflowX: "auto",
  marginBottom: theme.spacing(1.5),
}));

type Props = {
  id?: string;
  keywords: KeywordPropSchema[];
  value: string;
  error?: boolean;
  helperText?: React.ReactNode;
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
  onInput,
  onReset,
  onKeywordsUpdate,
  onKeywordSubmit,
}: Props) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onKeywordsUpdate(
      reorder(keywords, result.source.index, result.destination.index)
    );
  };
  const handleKeywordRemove = (keyword: KeywordPropSchema) => () => {
    const index = keywords.findIndex(({ name }) => name === keyword.name);
    onKeywordsUpdate(remove(keywords, index));
  };
  const handleReset = () => onReset?.();
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) =>
    onInput?.(event.target.value);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // NOTE: このコンポーネントをform要素でラップしている場合にsubmitさせない目的
    event.key === "Enter" && event.preventDefault();
  };
  const handleKeywordSubmit = () => onKeywordSubmit({ name: value });
  return (
    <div>
      <InputLabel htmlFor={id} sx={{ mb: 1 }}>
        キーワード
      </InputLabel>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable-keywords" direction="horizontal">
          {(provided) => (
            <Keywords ref={provided.innerRef} {...provided.droppableProps}>
              {keywords.map((keyword, index) => (
                <Draggable
                  key={keyword.name}
                  draggableId={keyword.name}
                  index={index}
                >
                  {(provided) => (
                    <Chip
                      variant="outlined"
                      color="primary"
                      label={keyword.name}
                      size="small"
                      sx={{ mr: 0.5, borderRadius: 1 }}
                      onDelete={handleKeywordRemove(keyword)}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Keywords>
          )}
        </Droppable>
      </DragDropContext>
      <FormControl error={error}>
        <Input
          id={id}
          type="email"
          placeholder="ちびチロ"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          startAdornment={<LabelOutlinedIcon />}
          endAdornment={
            <>
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
            </>
          }
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </div>
  );
}
