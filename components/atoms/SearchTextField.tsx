import { useState, useEffect, useCallback } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { inputLabelClasses } from "@mui/material/InputLabel";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import SearchClearButton from "$atoms/SearchClearButton";
import { grey, common } from "@mui/material/colors";
import IconButton from "$atoms/IconButton";

type Props = Omit<Parameters<typeof TextField>[0], "variant" | "value"> & {
  value: string;
  onSearchInput: (value: string) => void;
  onSearchInputReset: () => void;
  onSearchSubmit: (value: string) => void;
};

const SearchTextField = styled(
  ({
    value,
    onSearchInput,
    onSearchInputReset,
    onSearchSubmit,
    InputProps,
    ...other
  }: Props) => {
    const [valueState, setValueState] = useState(value);
    useEffect(() => {
      setValueState(value);
    }, [setValueState, value]);
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) =>
        setValueState(event.target.value),
      [setValueState]
    );
    const handleBlur = () => onSearchInput(valueState);
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSearchSubmit();
      }
    };
    const handleSearchSubmit = () => onSearchSubmit(valueState);
    return (
      <TextField
        value={valueState}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        variant="outlined"
        {...other}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <SearchClearButton onClick={onSearchInputReset} />
                <IconButton
                  onClick={handleSearchSubmit}
                  size="small"
                  color="primary"
                  tooltipProps={{ title: "検索" }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
            ...InputProps,
          },
        }}
      />
    );
  }
)(({ theme }) => ({
  [`.${outlinedInputClasses.root}`]: {
    backgroundColor: common.white,
    borderRadius: "1.25rem",
    paddingRight: theme.spacing(1),
    [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
      borderColor: grey[300],
      borderWidth: "1px",
    },
    [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]:
      {
        borderColor: theme.palette.primary.main,
        borderWidth: "1px",
      },
  },
  [`.${outlinedInputClasses.notchedOutline}`]: {
    borderColor: grey[300],
    transition: theme.transitions.create(["border-color"]),
  },
  [`.${outlinedInputClasses.input}`]: {
    height: "1.25rem",
    padding: theme.spacing(1, 2),
    paddingRight: 0,
  },
  [`.${inputLabelClasses.outlined}`]: {
    transform: `translate(${theme.spacing(2)}, 6px)`,
    [`&.${inputLabelClasses.shrink}`]: {
      transform: "translate(14px, -9px) scale(0.75)",
    },
  },
}));

export default SearchTextField;
