export default { title: "organisms/AppBar" };

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "./AppBar";
import { session } from "$samples";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

export const Default = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar
        position="static"
        session={session}
        onBooksClick={console.log}
        onTopicsClick={console.log}
        onDashboardClick={console.log}
      />
    </div>
  );
};
