import MuiTextField from "@mui/material/TextField";
import type { OutlinedTextFieldProps } from "@mui/material/TextField";
import { inputLabelClasses } from "@mui/material/InputLabel";
import { styled } from "@mui/material/styles";
import RequiredDot from "$atoms/RequiredDot";
import inputLabel from "$styles/inputLabel";
import outlinedInput from "$styles/outlinedInput";
import select from "$styles/select";

const TextField = styled(
  ({
    InputLabelProps,
    label,
    ...other
  }: Omit<OutlinedTextFieldProps, "variant">) => {
    return (
      <MuiTextField
        {...other}
        variant="outlined"
        label={
          <span>
            {label}
            <RequiredDot />
          </span>
        }
        slotProps={{
          inputLabel: { ...InputLabelProps, shrink: true },
        }}
      />
    );
  }
)(({ theme }) => ({
  display: "block",
  [`> .${inputLabelClasses.root}`]: {
    marginBottom: theme.spacing(1.25),
  },
  ...inputLabel(theme),
  ...outlinedInput(theme),
  ...select(theme),
}));

export default TextField;
