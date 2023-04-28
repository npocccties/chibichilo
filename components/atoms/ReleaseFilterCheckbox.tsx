import Checkbox, { type CheckboxProps } from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";

function ReleaseFilterCheckbox({ sx, ...props }: CheckboxProps) {
  return (
    <FormControl component="fieldset" sx={sx}>
      <FormLabel component="legend">リリース</FormLabel>
      <FormControlLabel
        sx={sx}
        control={<Checkbox defaultChecked {...props} />}
        label="最新版のみ"
      />
    </FormControl>
  );
}

export default ReleaseFilterCheckbox;
