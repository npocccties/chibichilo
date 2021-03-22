import { useCallback } from "react";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import { makeStyles } from "@material-ui/core/styles";
import { gray } from "$theme/colors";

const useStyles = makeStyles((theme) => ({
  fieldset: {
    display: "inline-flex",
    marginTop: "-0.375rem",
    padding: theme.spacing(0),
    backgroundColor: "white",
    border: "1px solid",
    borderColor: gray[500],
    borderRadius: 8,
  },
  legend: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(-1),
    color: gray[700],
    fontSize: "0.75rem",
  },
  group: {
    "& > :first-child": {
      marginLeft: 0,
    },
    "& > :not(:last-child)": {
      marginRight: theme.spacing(1.5),
    },
  },
}));

const useFormControlLabelStyles = makeStyles((theme) => ({
  label: {
    color: gray[800],
    fontSize: "0.875rem",
    marginLeft: theme.spacing(-0.5),
  },
}));

const filter = ["all", "self", "other"] as const;

type Filter = typeof filter[number];

const options: ReadonlyArray<{
  value: Filter;
  label: string;
}> = [
  { value: "self", label: "自分" },
  { value: "other", label: "自分以外" },
  { value: "all", label: "すべて" },
];

type Props = {
  disabled?: boolean;
  onFilterChange?: (value: Filter) => void;
};

function CreatorFilter(props: Props) {
  const { disabled = false, onFilterChange } = props;
  const classes = useStyles();
  const formControlLabelClasses = useFormControlLabelStyles();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange?.(event.target.value as Filter);
    },
    [onFilterChange]
  );
  return (
    <fieldset className={classes.fieldset}>
      <legend className={classes.legend}>作成者</legend>
      <RadioGroup
        className={classes.group}
        defaultValue={options[0].value}
        onChange={handleChange}
        row
      >
        {options.map(({ value, label }) => (
          <FormControlLabel
            key={value}
            classes={formControlLabelClasses}
            value={value}
            control={<Radio color="primary" size="small" />}
            label={label}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </fieldset>
  );
}

export default CreatorFilter;
