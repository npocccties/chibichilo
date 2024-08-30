import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import TextField from "$atoms/TextField";
import type { ReleaseProps, ReleaseSchema } from "$server/models/book/release";
import gray from "$theme/colors/gray";
import useCardStyles from "styles/card";

export type ReleaseFormProps = {
  release: ReleaseSchema;
  onSubmit(release: ReleaseProps): void;
};

export default function ReleaseForm({ release, onSubmit }: ReleaseFormProps) {
  const { register, handleSubmit } = useForm<ReleaseProps>({ values: release });
  const cardClasses = useCardStyles();

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
      <div className="release-form-row">
        <TextField
          inputProps={register("version")}
          required
          label="バージョン"
          fullWidth
        />
        <Typography
          component="span"
          variant="caption"
          sx={{ color: gray[700] }}
        >
          リリースを識別するための数字や文字列を入力してください (入力例: 1.0.0
          など)
        </Typography>
      </div>
      <TextField inputProps={register("comment")} label="コメント" fullWidth />
      <Divider sx={{ mx: "-50%" }} />
      <div className="release-form-row">
        <Button variant="contained" color="primary" type="submit">
          {release.version ? "更新" : "作成"}
        </Button>
      </div>
    </Card>
  );
}
