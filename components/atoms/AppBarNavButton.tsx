import { ComponentProps, ReactNode } from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/styles/makeStyles";

const useButtonStyles = makeStyles({
  label: {
    flexDirection: "column",
  },
});

const useStyles = makeStyles({
  label: {
    fontSize: "0.75rem",
  },
});

type Props = ComponentProps<typeof Button> & {
  icon: ReactNode;
  label: string;
};

export default function AppBarNavButton(props: Props) {
  const buttonClasses = useButtonStyles();
  const classes = useStyles();
  const { icon, label, ...others } = props;
  return (
    <Button classes={buttonClasses} {...others}>
      {icon}
      <span className={classes.label}>{label}</span>
    </Button>
  );
}
