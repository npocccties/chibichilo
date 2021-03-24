import { useState, forwardRef, ComponentProps, Ref } from "react";
import MuiAppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import MenuBookOutlinedIcon from "@material-ui/icons/MenuBookOutlined";
import LibraryBooksOutlinedIcon from "@material-ui/icons/LibraryBooksOutlined";
import AssessmentOutlinedIcon from "@material-ui/icons/AssessmentOutlined";
import LinkIcon from "@material-ui/icons/Link";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import AppBarNavButton from "$atoms/AppBarNavButton";
import LtiItemDialog from "$organisms/LtiItemDialog";
import useAppBarStyles from "$styles/appBar";
import { SessionSchema } from "$server/models/session";
import { gray } from "$theme/colors";
import { isAdministrator, isInstructor } from "$utils/session";
import { NEXT_PUBLIC_BASE_PATH } from "$utils/env";

const useStyles = makeStyles((theme) => ({
  inner: {
    display: "flex",
    alignItems: "center",
    maxWidth: theme.breakpoints.width("lg"),
    width: "100%",
    margin: "0 auto",
    padding: `0 ${theme.spacing(3)}px`,
    [theme.breakpoints.down("xs")]: {
      padding: `0 ${theme.spacing(2)}px`,
    },
  },
  logo: {
    maxWidth: 100,
    maxHeight: 48,
    width: "auto",
    height: "auto",
  },
  margin: {
    marginRight: theme.spacing(1),
  },
  nav: {
    flex: 1,
    overflowX: "auto",
    whiteSpace: "nowrap",
  },
  user: {
    display: "inline-block",
    "& > p": {
      margin: 0,
      lineHeight: 1.2,
    },
  },
  roles: {
    fontSize: "0.75rem",
    color: gray[700],
  },
}));

type Props = ComponentProps<typeof MuiAppBar> & {
  session: SessionSchema;
  onBooksClick?(): void;
  onTopicsClick?(): void;
  onBookLinkClick?(): void;
  onDashboardClick?(): void;
};

const role = (session: SessionSchema) => {
  if (isAdministrator(session)) return "管理者";
  if (isInstructor(session)) return "教員";
  return "学生";
};

function AppBar(props: Props, ref: Ref<unknown>) {
  const {
    session,
    onBooksClick,
    onTopicsClick,
    onBookLinkClick,
    onDashboardClick,
    ...others
  } = props;
  const appBarClasses = useAppBarStyles();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <MuiAppBar classes={appBarClasses} color="default" {...others} ref={ref}>
      <Toolbar color="inherit" disableGutters>
        <div className={classes.inner}>
          <img
            src={`${NEXT_PUBLIC_BASE_PATH}/logo.png`}
            alt="Chibi CHiLO"
            className={clsx(classes.margin, classes.logo)}
          />
          <div className={classes.nav}>
            <AppBarNavButton
              color="inherit"
              icon={<MenuBookOutlinedIcon />}
              label="ブック"
              onClick={onBooksClick}
              disabled={!onBooksClick}
            />
            <AppBarNavButton
              color="inherit"
              icon={<LibraryBooksOutlinedIcon />}
              label="トピック"
              onClick={onTopicsClick}
              disabled={!onTopicsClick}
            />
            <AppBarNavButton
              color="inherit"
              icon={<LinkIcon />}
              label="ブックの提供"
              onClick={onBookLinkClick}
              disabled={!onBookLinkClick}
            />
            <AppBarNavButton
              color="inherit"
              icon={<AssessmentOutlinedIcon />}
              label="学習分析"
              onClick={onDashboardClick}
              disabled={!onDashboardClick}
            />
          </div>
          <div className={clsx(classes.user, classes.margin)}>
            <p>{session.user.name}</p>
            <p className={classes.roles}>{role(session)}</p>
          </div>
          {session && (
            <>
              <Button variant="text" color="primary" onClick={handleClick}>
                LTI情報
              </Button>
              <LtiItemDialog
                open={open}
                onClose={handleClose}
                session={session}
              />
            </>
          )}
        </div>
      </Toolbar>
    </MuiAppBar>
  );
}

export default forwardRef(AppBar);
