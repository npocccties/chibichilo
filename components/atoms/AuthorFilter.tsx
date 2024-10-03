import { useCallback } from "react";
import type { SxProps } from "@mui/system";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import type { AuthorFilterType } from "$server/models/authorFilter";

const options: ReadonlyArray<{
  value: AuthorFilterType;
  label: string;
}> = [
  { value: "edit", label: "編集中" },
  { value: "release", label: "リリース" },
  { value: "other-release", label: "共有されたリリース" },
];

type Props = {
  value?: AuthorFilterType;
  sx?: SxProps;
  disabled?: boolean;
  onFilterChange?: (value: AuthorFilterType) => void;
  row?: boolean | undefined;
};

function AuthorFilter({
  value = options[0].value,
  sx,
  disabled = false,
  onFilterChange,
  row,
}: Props) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange?.(event.target.value as AuthorFilterType);
    },
    [onFilterChange]
  );
  return (
    <FormControl component="fieldset" sx={sx}>
      <RadioGroup value={value} onChange={handleChange} row={row}>
        {options.map(({ value, label }) => (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio color="primary" size="small" />}
            label={label}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

export default AuthorFilter;
