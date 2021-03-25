import { MouseEvent, useCallback, useState } from "react";
import Chip from "@material-ui/core/Chip";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";
import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

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
  ltiResourceLink: LtiResourceLinkSchema;
  onLtiResourceLinkClick?(ltiResourceLink: LtiResourceLinkSchema): void;
};

export default function CourseChip(props: Props) {
  const classes = useStyles();
  const { ltiResourceLink, onLtiResourceLinkClick } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handlePopoverOpen = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);
  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onLtiResourceLinkClick?.(ltiResourceLink);
    },
    [ltiResourceLink, onLtiResourceLinkClick]
  );

  return (
    <>
      <Chip
        aria-haspopup="true"
        variant="outlined"
        size="small"
        color="primary"
        label={ltiResourceLink.contextLabel}
        clickable
        onClick={handleClick}
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
