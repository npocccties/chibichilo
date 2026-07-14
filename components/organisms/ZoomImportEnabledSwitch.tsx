import { useState } from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { FormGroup, FormControlLabel } from "@mui/material";
import Switch from "@mui/material/Switch";
import card from "$styles/card";
import type { UserSettingsProps } from "$server/models/userSettings";

const marginSx = {
  "& > :not(:first-of-type)": {
    mt: 2.5,
  },
};

type Props = {
  className?: string;
  userSettings: UserSettingsProps;
  onChange: (userSettings: UserSettingsProps) => void;
};

export default function ZoomImportEnabledSwitch(props: Props) {
  const { className, userSettings, onChange } = props;
  const [zoomImportEnabled, setZoomImportEnabled] = useState(
    userSettings.zoomImportEnabled
  );

  return (
    <Card sx={[card, marginSx]} className={className}>
      <Typography variant="h6">
        Zoomクラウドレコーディングのインポート
      </Typography>
      一定の時間間隔でZoomのビデオレコーディングをWowzaにアップロードし、トピック単位でちびチロにインポートします。
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              size="small"
              defaultChecked={zoomImportEnabled}
              onChange={async (e, bool) => {
                await onChange({ zoomImportEnabled: bool });
                setZoomImportEnabled(bool);
              }}
            />
          }
          label={zoomImportEnabled ? "有効" : "無効"}
        />
      </FormGroup>
    </Card>
  );
}
