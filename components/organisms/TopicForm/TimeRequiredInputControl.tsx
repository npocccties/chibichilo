import type { FieldValues, Control, FieldPath } from "react-hook-form";
import { useController } from "react-hook-form";
import { useToggle } from "react-use";
import Alert from "@mui/material/Alert";
import TextField from "$atoms/TextField";
import type { TopicSchema } from "$server/models/topic";

type Props<TFieldValues extends FieldValues> = {
  topic?: Pick<TopicSchema, "timeRequired">;
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  disabled: boolean;
};

function TimeRequiredInputControl<TFieldValues extends FieldValues>(
  props: Props<TFieldValues>
) {
  const { field } = useController(props);
  const modified =
    props.topic && field.value !== Number(props.topic.timeRequired);
  const [close, toggleClose] = useToggle(false);

  return (
    <>
      <TextField
        label="学習時間 (秒)"
        type="number"
        inputProps={{ ...field, min: 1 }}
        required={!props.disabled}
        disabled={props.disabled}
      />
      {modified && !close && (
        <Alert severity="warning" onClose={() => toggleClose()}>
          学習時間が変更されました。学習分析に影響を及ぼす可能性があります。
        </Alert>
      )}
    </>
  );
}

export default TimeRequiredInputControl;
