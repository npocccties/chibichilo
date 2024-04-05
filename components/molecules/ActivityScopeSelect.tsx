import { useCallback } from "react";
import MenuItem from "@mui/material/MenuItem";
import type { SelectChangeEvent } from "@mui/material/Select";
import Select from "$atoms/Select";
import type { ActivityScope } from "$types/activityScope";

const options: ReadonlyArray<{
  value: ActivityScope;
  label: string;
}> = [
  {
    value: "topic",
    label: "他のコースを含めた活動を分析",
  },
  {
    value: "current-lti-context-only",
    label: "このコースでの活動を分析",
  },
];

type Props = Parameters<typeof Select>[0] & {
  defaultValue?: ActivityScope;
  value?: ActivityScope;
  onActivityScopeChange(value: ActivityScope): void;
};

function ActivityScopeSelect(props: Props) {
  const { onActivityScopeChange, ...other } = props;
  const handleChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      onActivityScopeChange(event.target.value as ActivityScope);
    },
    [onActivityScopeChange]
  );
  return (
    <Select onChange={handleChange} {...other}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
}

export default ActivityScopeSelect;
