import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import TextField from "$atoms/TextField";
import MenuItem from "@mui/material/MenuItem";
import useCardStyles from "styles/card";
import languages from "$utils/languages";
import licenses from "$utils/licenses";
import type { MetainfoProps } from "$server/models/metainfo";

export type MetainfoFormProps = {
  metainfo: MetainfoProps;
  onSubmit?(metainfo: MetainfoProps): void;
};

export default function MetainfoForm({
  metainfo,
  onSubmit,
}: MetainfoFormProps) {
  const { register, handleSubmit, formState } = useForm<MetainfoProps>({
    values: metainfo,
  });
  const cardClasses = useCardStyles();
  const update = Boolean(onSubmit);
  if (!onSubmit) {
    onSubmit = () => {};
  }
  return (
    <Card
      classes={cardClasses}
      sx={
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          rowGap: 2.5,
        } as const
      }
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        label="教材の主要な言語"
        select
        defaultValue={metainfo.language}
        inputProps={register("language")}
        disabled={!update}
      >
        {Object.entries(languages).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="ライセンス"
        select
        defaultValue={metainfo.license}
        inputProps={{ displayEmpty: true, ...register("license") }}
        disabled={!update}
      >
        <MenuItem value="">未設定</MenuItem>
        {Object.entries(licenses).map(([value, { name }]) => (
          <MenuItem key={value} value={value}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        inputProps={register("licenser")}
        label="著作権者"
        fullWidth
        disabled={!update}
      />
      {update && (
        <>
          <Divider sx={{ mx: "-50%" }} />
          <div className="release-form-row">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!formState.isDirty}
            >
              更新
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
