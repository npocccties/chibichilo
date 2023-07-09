import type { ComponentProps, Ref } from "react";
import { useState, forwardRef } from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import LinkIcon from "@mui/icons-material/Link";
import CellTowerIcon from "@mui/icons-material/CellTower";
import SettingsIcon from "@mui/icons-material/Settings";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import AppBarNavButton from "$atoms/AppBarNavButton";
import LtiItemDialog from "$organisms/LtiItemDialog";
import useAppBarStyles from "$styles/appBar";
import type { SessionSchema } from "$server/models/session";
import type { UserSettingsProps } from "$server/models/userSettings";
import { gray } from "$theme/colors";
import { isAdministrator, isInstructor } from "$utils/session";
import { updateUserSettings } from "$utils/userSettings";
import { NEXT_PUBLIC_BASE_PATH } from "$utils/env";
import { useRouter } from "next/router";
import { pagesPath } from "$utils/$path";

const useStyles = makeStyles((theme) => ({
  inner: {
    display: "flex",
    alignItems: "center",
    maxWidth: theme.breakpoints.values.lg,
    width: "100%",
    margin: "0 auto",
    padding: theme.spacing(0, 3),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0, 2),
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
  onCoursesClick?(): void;
  onBookClick?(): void;
  onDashboardClick?(): void;
};

const role = (session: SessionSchema) => {
  if (isAdministrator(session)) return "管理者";
  if (isInstructor(session)) return "教員";
  return "学生";
};

function AppBar(props: Props, ref: Ref<HTMLDivElement>) {
  const isDeepLink = true; // TODO:sessionに保存したDeepLinkのtarget_urlで判定する

  const {
    session,
    onBooksClick,
    onTopicsClick,
    onCoursesClick,
    onBookClick,
    onDashboardClick,
    ...others
  } = props;
  const appBarClasses = useAppBarStyles();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpenUserSettings = () => {
    setShowZoomImportNotice(false);
    return router.push(pagesPath.userSettings.$url());
  };
  const handleDisableZoomImport = async () => {
    await updateUserSettings({ zoomImportEnabled: false });
    setShowZoomImportNotice(false);
  };
  const userSettings = session?.user?.settings as UserSettingsProps;
  const [showZoomImportNotice, setShowZoomImportNotice] = useState(
    session?.systemSettings?.zoomImportEnabled &&
      userSettings?.zoomImportEnabled == undefined
  );
  const actionZoomImportNotice = (
    <>
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={handleOpenUserSettings}
      >
        設定
      </Button>
      <Button size="small" color="primary" onClick={handleDisableZoomImport}>
        後で
      </Button>
    </>
  );

  return (
    <MuiAppBar classes={appBarClasses} color="default" {...others} ref={ref}>
      <Toolbar color="inherit" disableGutters>
        <div className={classes.inner}>
          <img
            src={`${NEXT_PUBLIC_BASE_PATH}/logo.png`}
            alt="CHiBi-CHiLO"
            className={clsx(classes.margin, classes.logo)}
          />
          {!isDeepLink && (
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
                label="リンク"
                onClick={onCoursesClick}
                disabled={!onCoursesClick}
              />
              <AppBarNavButton
                color="inherit"
                icon={<CellTowerIcon />}
                label="配信中のブック"
                onClick={onBookClick}
                disabled={
                  !onBookClick ||
                  !Number.isFinite(session?.ltiResourceLink?.bookId)
                }
              />
              {session?.systemSettings?.zoomImportEnabled && ( // TODO: zoomインポート以外の設定値が実装されたら常時表示する
                <AppBarNavButton
                  color="inherit"
                  icon={<SettingsIcon />}
                  label="設定"
                  onClick={handleOpenUserSettings}
                />
              )}
              {onDashboardClick && (
                <AppBarNavButton
                  color="inherit"
                  icon={<AssessmentOutlinedIcon />}
                  label="学習分析"
                  onClick={onDashboardClick}
                />
              )}
            </div>
          )}
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
      <Snackbar
        open={showZoomImportNotice}
        action={actionZoomImportNotice}
        message="zoomインポート機能が利用できます"
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      />
    </MuiAppBar>
  );
}

export default forwardRef(AppBar);
