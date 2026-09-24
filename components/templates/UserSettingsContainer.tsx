import { useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import ZoomImportEnabledSwitch from "$organisms/ZoomImportEnabledSwitch";
import Container from "$atoms/Container";
import { useSessionAtom } from "$store/session";
import type { UserSettingsProps } from "$server/models/userSettings";
import { updateUserSettings } from "$utils/userSettings";

const containerSx: SxProps<Theme> = {
  mt: 1,
  "& > :not(.user-settings-title):not(.user-settings-form)": {
    mb: 2,
  },
};

const titleSx: SxProps<Theme> = {
  mb: 4,
};

const formSx: SxProps<Theme> = {
  mb: 4,
};

export default function UserSettingsContainer() {
  const { session } = useSessionAtom();
  const userSettings = session?.user.settings as UserSettingsProps;
  const onChange = useCallback(async (userSettings: UserSettingsProps) => {
    await updateUserSettings(userSettings);
  }, []);

  return (
    <Container sx={containerSx} maxWidth="md">
      <Typography className="user-settings-title" sx={titleSx} variant="h4">
        設定
      </Typography>
      {session?.systemSettings?.zoomImportEnabled && (
        <Box className="user-settings-form" sx={formSx}>
          <ZoomImportEnabledSwitch
            userSettings={userSettings}
            onChange={onChange}
          />
        </Box>
      )}
    </Container>
  );
}
