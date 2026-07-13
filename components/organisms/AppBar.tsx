import type { ComponentProps, Ref } from "react";
import { useState, forwardRef } from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import StyleIcon from "@mui/icons-material/Style";
import LinkIcon from "@mui/icons-material/Link";
import CellTowerIcon from "@mui/icons-material/CellTower";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import AppBarNavButton from "$atoms/AppBarNavButton";
import LtiItemDialog from "$organisms/LtiItemDialog";
import appBar from "$styles/appBar";
import type { SessionSchema } from "$server/models/session";
import type { UserSettingsProps } from "$server/models/userSettings";
import { gray } from "$theme/colors";
import { isAdministrator, isInstructor } from "$utils/session";
import { updateUserSettings } from "$utils/userSettings";
import { NEXT_PUBLIC_BASE_PATH, NEXT_PUBLIC_NO_DEEP_LINK_UI } from "$utils/env";
import { useAppRouter } from "$utils/useAppRouter";
import { paths } from "$utils/routes";
import MoveDownloadPageDialog from "$organisms/MoveDownloadPageDialog";

import { NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK } from "$utils/env";
import { showDashboard } from "$pages/dashboard";

const innerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  maxWidth: (theme) => theme.breakpoints.values.lg,
  width: "100%",
  margin: "0 auto",
  padding: (theme) => theme.spacing(0, 3),
  [`@media (max-width:600px)`]: {
    padding: (theme) => theme.spacing(0, 2),
  },
};
const logoSx: SxProps<Theme> = {
  maxWidth: 100,
  maxHeight: 48,
  width: "auto",
  height: "auto",
  mr: 1,
};
const navSx: SxProps<Theme> = {
  flex: 1,
  overflowX: "auto",
  whiteSpace: "nowrap",
};
const userSx: SxProps<Theme> = {
  display: "inline-block",
  mr: 1,
  "& > p": {
    margin: 0,
    lineHeight: 1.2,
  },
};

type Props = ComponentProps<typeof MuiAppBar> & {
  session: SessionSchema;
  isInstructor: boolean;
  onBooksClick?(): void;
  onTopicsClick?(): void;
  onCoursesClick?(): void;
  onBookClick?(): void;
  onDashboardClick?(): void;
  onBookmarksClick?(): void;
  onDownloadClick?(): void;
};

const role = (session: SessionSchema) => {
  if (isAdministrator(session)) return "管理者";
  if (isInstructor(session)) return "教員";
  return "学生";
};

function AppBar(props: Props, ref: Ref<HTMLDivElement>) {
  const {
    session,
    isInstructor,
    onBooksClick,
    onTopicsClick,
    onCoursesClick,
    onBookClick,
    onDashboardClick,
    onBookmarksClick,
    onDownloadClick,
    ...others
  } = props;

  const isDeepLink =
    !!session.ltiDlSettings?.deep_link_return_url &&
    !NEXT_PUBLIC_NO_DEEP_LINK_UI;

  const [open, setOpen] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);

  const router = useAppRouter();

  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleDownloadClick = () => {
    setOpenDownload(true);
  };
  const handleDownloadClose = () => {
    setOpenDownload(false);
  };
  const handleOpenUserSettings = () => {
    setShowZoomImportNotice(false);
    return router.push(paths.userSettings);
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

  if (
    !NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK &&
    !isAdministrator(session) &&
    !isInstructor
  ) {
    return <></>;
  }

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
    <MuiAppBar sx={appBar} color="default" {...others} ref={ref}>
      <Toolbar color="inherit" disableGutters>
        <Box sx={innerSx}>
          <Box
            component="img"
            src={`${NEXT_PUBLIC_BASE_PATH}/logo.png`}
            alt="CHiBi-CHiLO"
            sx={logoSx}
          />
          {!isDeepLink && (
            <Box sx={navSx}>
              {isInstructor && (
                <>
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
                </>
              )}
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
              {session?.systemSettings?.zoomImportEnabled &&
                isInstructor && ( // TODO: zoomインポート以外の設定値が実装されたら常時表示する
                  <AppBarNavButton
                    color="inherit"
                    icon={<SettingsIcon />}
                    label="設定"
                    onClick={handleOpenUserSettings}
                  />
                )}
              {onDashboardClick && showDashboard(session) && (
                <AppBarNavButton
                  color="inherit"
                  icon={<AssessmentOutlinedIcon />}
                  label="学習分析"
                  onClick={onDashboardClick}
                />
              )}
              {NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK && (
                <AppBarNavButton
                  color="inherit"
                  icon={<StyleIcon />}
                  label="タグ管理"
                  onClick={onBookmarksClick}
                />
              )}
              {onDownloadClick && isAdministrator(session) && (
                <>
                  <AppBarNavButton
                    color="inherit"
                    icon={<DownloadOutlinedIcon />}
                    label="ダウンロード"
                    onClick={handleDownloadClick}
                  />
                  <MoveDownloadPageDialog
                    open={openDownload}
                    onClose={handleDownloadClose}
                    handleDownload={onDownloadClick}
                  />
                </>
              )}
            </Box>
          )}
          {isInstructor && (
            <div>
              <Box sx={userSx}>
                <p>{session.user.name}</p>
                <p style={{ fontSize: "0.75rem", color: gray[700] }}>
                  {role(session)}
                </p>
              </Box>
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
          )}
        </Box>
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
