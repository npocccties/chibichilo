import { useState, ComponentProps } from "react";
import MuiAppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";
import MenuBookOutlinedIcon from "@material-ui/icons/MenuBookOutlined";
import LibraryBooksOutlinedIcon from "@material-ui/icons/LibraryBooksOutlined";
import AssessmentOutlinedIcon from "@material-ui/icons/AssessmentOutlined";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import AppBarNavButton from "$atoms/AppBarNavButton";
import LtiItemDialog from "$organisms/LtiItemDialog";
import useAppBarStyles from "$styles/appBar";
import { Session } from "$server/utils/session";
import { gray } from "$theme/colors";
import { isAdministrator, isInstructor } from "$utils/session";

const useHomeIconStyles = makeStyles({
  root: {
    width: "auto",
    height: 14,
  },
});

function LogoIcon(props: SvgIconProps) {
  const homeIconClasses = useHomeIconStyles();
  return (
    <SvgIcon
      classes={homeIconClasses}
      viewBox="0 0 81 14"
      titleAccess="ちびチロ"
      {...props}
    >
      <path d="M5.65927 0.802C6.98927 0.802 8.05327 1.19467 8.85127 1.98C9.66194 2.75267 10.0673 3.918 10.0673 5.476H7.76827C7.76827 4.57667 7.57827 3.89267 7.19827 3.424C6.81827 2.95533 6.30527 2.721 5.65927 2.721C4.83594 2.721 4.2216 3.05667 3.81627 3.728C3.41094 4.39933 3.20827 5.34933 3.20827 6.578V7.452C3.20827 8.68067 3.41727 9.63067 3.83527 10.302C4.26594 10.9607 4.89927 11.29 5.73527 11.29C6.4066 11.29 6.93227 11.062 7.31227 10.606C7.69227 10.1373 7.88227 9.45333 7.88227 8.554H10.0673C10.0673 10.074 9.66194 11.233 8.85127 12.031C8.05327 12.8163 6.98927 13.209 5.65927 13.209C4.1266 13.209 2.9486 12.696 2.12527 11.67C1.30194 10.6313 0.89027 9.07967 0.89027 7.015C0.89027 4.93767 1.30194 3.386 2.12527 2.36C2.9486 1.32133 4.1266 0.802 5.65927 0.802ZM13.7522 4.792C13.9929 4.45 14.3032 4.165 14.6832 3.937C15.0632 3.709 15.5002 3.595 15.9942 3.595C16.7416 3.595 17.3306 3.83567 17.7612 4.317C18.2046 4.78567 18.4262 5.533 18.4262 6.559V13H16.3362V7.129C16.3362 6.559 16.2286 6.14733 16.0132 5.894C15.8106 5.64067 15.5129 5.514 15.1202 5.514C14.7149 5.514 14.3729 5.69133 14.0942 6.046C13.8282 6.388 13.6952 6.825 13.6952 7.357V13H11.6052V0.365H13.6952V4.792H13.7522ZM20.344 0.365H22.434V2.265H20.344V0.365ZM20.344 3.804H22.434V13H20.344V3.804ZM26.5183 4.754C26.683 4.39933 26.949 4.12067 27.3163 3.918C27.6963 3.70267 28.1206 3.595 28.5893 3.595C29.438 3.595 30.122 4.00033 30.6413 4.811C31.1606 5.609 31.4203 6.806 31.4203 8.402C31.4203 10.0107 31.1606 11.214 30.6413 12.012C30.122 12.81 29.3936 13.209 28.4563 13.209C28.013 13.209 27.614 13.1013 27.2593 12.886C26.9046 12.658 26.6133 12.3223 26.3853 11.879H26.3093L26.0813 13H24.3523V0.365H26.4423V4.754H26.5183ZM27.8293 5.514C27.348 5.514 26.9933 5.73567 26.7653 6.179C26.55 6.60967 26.4423 7.24933 26.4423 8.098V8.725C26.4423 9.58633 26.55 10.2323 26.7653 10.663C26.9806 11.0937 27.3353 11.309 27.8293 11.309C28.3233 11.309 28.678 11.0937 28.8933 10.663C29.1213 10.2323 29.2353 9.58633 29.2353 8.725V8.079C29.2353 7.21767 29.1213 6.578 28.8933 6.16C28.678 5.72933 28.3233 5.514 27.8293 5.514ZM33.0911 0.365H35.1811V2.265H33.0911V0.365ZM33.0911 3.804H35.1811V13H33.0911V3.804ZM41.4884 0.802C42.8184 0.802 43.8824 1.19467 44.6804 1.98C45.491 2.75267 45.8964 3.918 45.8964 5.476H43.5974C43.5974 4.57667 43.4074 3.89267 43.0274 3.424C42.6474 2.95533 42.1344 2.721 41.4884 2.721C40.665 2.721 40.0507 3.05667 39.6454 3.728C39.24 4.39933 39.0374 5.34933 39.0374 6.578V7.452C39.0374 8.68067 39.2464 9.63067 39.6644 10.302C40.095 10.9607 40.7284 11.29 41.5644 11.29C42.2357 11.29 42.7614 11.062 43.1414 10.606C43.5214 10.1373 43.7114 9.45333 43.7114 8.554H45.8964C45.8964 10.074 45.491 11.233 44.6804 12.031C43.8824 12.8163 42.8184 13.209 41.4884 13.209C39.9557 13.209 38.7777 12.696 37.9544 11.67C37.131 10.6313 36.7194 9.07967 36.7194 7.015C36.7194 4.93767 37.131 3.386 37.9544 2.36C38.7777 1.32133 39.9557 0.802 41.4884 0.802ZM53.5143 13V7.87H49.7523V13H47.5103V1.03H49.7523V5.875H53.5143V1.03H55.7563V13H53.5143ZM57.7503 0.365H59.8403V2.265H57.7503V0.365ZM57.7503 3.804H59.8403V13H57.7503V3.804ZM69.1496 10.91V13H61.8346V1.03H64.0766V10.91H69.1496ZM75.1144 0.802C76.6977 0.802 77.92 1.32133 78.7814 2.36C79.6554 3.386 80.0924 4.93767 80.0924 7.015C80.0924 9.07967 79.6554 10.6313 78.7814 11.67C77.92 12.696 76.6977 13.209 75.1144 13.209C73.531 13.209 72.3024 12.696 71.4284 11.67C70.567 10.6313 70.1364 9.07967 70.1364 7.015C70.1364 4.95033 70.567 3.39867 71.4284 2.36C72.3024 1.32133 73.531 0.802 75.1144 0.802ZM75.1144 2.721C74.2404 2.721 73.5754 3.063 73.1194 3.747C72.676 4.41833 72.4544 5.362 72.4544 6.578V7.452C72.4544 8.668 72.676 9.61167 73.1194 10.283C73.5754 10.9543 74.2404 11.29 75.1144 11.29C75.9884 11.29 76.6534 10.9543 77.1094 10.283C77.5654 9.61167 77.7934 8.668 77.7934 7.452V6.578C77.7934 5.362 77.5654 4.41833 77.1094 3.747C76.6534 3.063 75.9884 2.721 75.1144 2.721Z" />
    </SvgIcon>
  );
}

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
  margin: {
    marginRight: theme.spacing(1),
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
  grow: {
    flexGrow: 1,
  },
}));

type Props = ComponentProps<typeof MuiAppBar> & {
  session: Session;
  onBooksClick(): void;
  onTopicsClick(): void;
  onDashboardClick?(): void;
};

const role = (session: Session) => {
  if (isAdministrator(session)) return "管理者";
  if (isInstructor(session)) return "教員";
  return "学生";
};

export default function AppBar(props: Props) {
  const {
    session,
    onBooksClick,
    onTopicsClick,
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
    <MuiAppBar classes={appBarClasses} color="default" {...others}>
      <Toolbar color="inherit" disableGutters>
        <div className={classes.inner}>
          <LogoIcon className={classes.margin} />
          <AppBarNavButton
            color="inherit"
            icon={<MenuBookOutlinedIcon />}
            label="マイブック"
            onClick={onBooksClick}
          />
          <AppBarNavButton
            color="inherit"
            icon={<LibraryBooksOutlinedIcon />}
            label="マイトピック"
            onClick={onTopicsClick}
          />
          <AppBarNavButton
            color="inherit"
            icon={<AssessmentOutlinedIcon />}
            label="学習分析"
            onClick={onDashboardClick}
            disabled // TODO: 学習分析機能を実装したら有効化して
          />
          <div className={classes.grow} />
          <div className={clsx(classes.user, classes.margin)}>
            {session.user && <p>{session.user.name}</p>}
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
