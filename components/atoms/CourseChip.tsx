import { MouseEvent, useState } from "react";
import Chip from "@material-ui/core/Chip";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";
import { LtiResourceLinkProps } from "$server/models/ltiResourceLink";

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

type Props = {
  ltiResourceLink: LtiResourceLinkProps;
  onClick?: React.MouseEventHandler;
};

export default function CourseChip(props: Props) {
  const classes = useStyles();
  const { ltiResourceLink, onClick } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Chip
        aria-haspopup="true"
        variant="outlined"
        size="small"
        color="primary"
        label={ltiResourceLink.contextLabel}
        onClick={onClick}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      />
      <Popover
        className={classes.popover}
        classes={{ paper: classes.paper }}
        open={open}
        onClose={handlePopoverClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        disableRestoreFocus
      >
        {ltiResourceLink.contextTitle}
      </Popover>
    </>
  );
}
