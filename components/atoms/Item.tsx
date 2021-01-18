import { ElementType } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import gray from "theme/colors/gray";

const useStyles = makeStyles({
  item: {
    color: gray[700],
  },
});

type Props = {
  itemKey: string;
  value: string;
  component?: ElementType;
};

export default function Item(props: Props) {
  const classes = useStyles();
  const { itemKey, value, component = "span" } = props;
  return (
    <Typography
      className={classes.item}
      variant="caption"
      component={component}
    >
      {itemKey}: {value}
    </Typography>
  );
}
