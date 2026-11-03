import type { ComponentProps } from "react";
import TextField from "@mui/material/TextField";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { inputLabelClasses } from "@mui/material/InputLabel";
import type { SxProps, Theme } from "@mui/material/styles";
import gray from "$theme/colors/gray";

const textFieldSx: SxProps<Theme> = {
  [`& .${outlinedInputClasses.root}`]: {
    backgroundColor: "#fff",
    [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
      borderColor: gray[200],
      borderWidth: "1px",
    },
    "@media (hover: none)": {
      [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
        borderColor: gray[200],
      },
    },
    [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]:
      {
        borderColor: (theme) => theme.palette.primary.main,
        borderWidth: "1px",
      },
  },
  [`& .${outlinedInputClasses.input}`]: {
    height: "1.25rem",
    padding: (theme) => theme.spacing(1),
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderColor: gray[200],
    transition: (theme) => theme.transitions.create(["border-color"]),
  },
  [`& .${inputLabelClasses.outlined}`]: {
    transform: (theme) => `translate(${theme.spacing(1)}, 6px)`,
    [`&.${inputLabelClasses.shrink}`]: {
      transform: "translate(14px, -9px) scale(0.75)",
    },
  },
};

export default function SectionTextField(
  props: ComponentProps<typeof TextField>
) {
  return (
    <div>
      <TextField variant="outlined" sx={textFieldSx} {...props} />
    </div>
  );
}
