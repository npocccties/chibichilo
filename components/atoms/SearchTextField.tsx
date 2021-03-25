import { ComponentProps, FormEvent, useCallback } from "react";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import gray from "$theme/colors/gray";

// NOTE: https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/OutlinedInput/OutlinedInput.js

const useOutlinedInputStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#fff",
    borderRadius: "1.25rem",
    paddingRight: `${theme.spacing(2)}px`,
    "&:hover $notchedOutline": {
      borderColor: gray[500],
      borderWidth: "1px",
    },
    "@media (hover: none)": {
      "&:hover $notchedOutline": {
        borderColor: gray[500],
      },
    },
    "&$focused $notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: "1px",
    },
  },
  input: {
    height: "1.25rem",
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    paddingRight: 0,
  },
  focused: {},
  notchedOutline: {
    borderColor: gray[500],
    transition: theme.transitions.create(["border-color"]),
  },
}));

const useInputLabelStyles = makeStyles((theme) => ({
  outlined: {
    transform: `translate(${theme.spacing(2)}px, 10px)`,
  },
}));

export default function SearchTextField({
  onSearchInput,
  ...props
}: {
  onSearchInput?: (input: string) => void;
} & ComponentProps<typeof TextField>) {
  const outlinedInputClasses = useOutlinedInputStyles();
  const inputLabelClasses = useInputLabelStyles();
  const handleInput = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      onSearchInput?.(event.currentTarget.value);
    },
    [onSearchInput]
  );
  return (
    <div>
      <TextField
        variant="outlined"
        inputProps={{
          onInput: handleInput,
          ...props.inputProps,
        }}
        InputProps={{
          classes: outlinedInputClasses,
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon style={{ color: gray[700] }} />
            </InputAdornment>
          ),
          ...props.InputProps,
        }}
        InputLabelProps={{
          classes: inputLabelClasses,
          ...props.InputLabelProps,
        }}
        {...props}
      />
    </div>
  );
}
