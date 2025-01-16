import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import TextField from "$atoms/TextField";
import type { ReleaseProps, ReleaseSchema } from "$server/models/book/release";
import gray from "$theme/colors/gray";
import useCardStyles from "styles/card";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";
import InputLabel from "$atoms/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import makeStyles from "@mui/styles/makeStyles";

export type ReleaseFormProps = {
  release: ReleaseSchema;
  onSubmit?(release: ReleaseProps): void;
};

const useStyles = makeStyles((theme) => ({
  labelDescription: {
    marginLeft: theme.spacing(0.75),
    color: gray[600],
  },
}));

export default function ReleaseForm({ release, onSubmit }: ReleaseFormProps) {
  const { register, handleSubmit, setValue, formState, reset } =
    useForm<ReleaseProps>({
      values: release,
    });
  const cardClasses = useCardStyles();
  const releasedAt = release.releasedAt
    ? getLocaleDateString(release.releasedAt, "ja")
    : "不明";
  const update = Boolean(onSubmit);
  const classes = useStyles();
  async function submitHandler(release: ReleaseProps) {
    if (onSubmit) {
      await onSubmit(release);
    }
    reset(release);
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
      onSubmit={handleSubmit(submitHandler)}
    >
      <div className="release-form-row">
        <TextField
          inputProps={register("version")}
          required={update}
          label="バージョン"
          fullWidth
          disabled={!update}
        />
        {update && (
          <Typography
            component="span"
            variant="caption"
            sx={{ color: gray[700] }}
          >
            リリースを識別するための数字や文字列を入力してください (入力例:
            1.0.0 など)
          </Typography>
        )}
      </div>
      <TextField
        inputProps={register("comment")}
        label="コメント"
        fullWidth
        disabled={!update}
      />
      <div>
        <InputLabel htmlFor="shared">
          ブックを共有する
          <Typography
            className={classes.labelDescription}
            variant="caption"
            component="span"
          >
            他の教材作成者とブックを共有します
          </Typography>
        </InputLabel>
        <Checkbox
          id="shared"
          name="shared"
          onChange={(_, checked) =>
            setValue("shared", checked, { shouldDirty: true })
          }
          defaultChecked={release.shared}
          color="primary"
          disabled={!update}
        />
      </div>
      {release.version && (
        <DescriptionList
          value={[
            {
              key: "リリース日",
              value: releasedAt,
            },
          ]}
        />
      )}
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
              {release.version ? "更新" : "作成"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
