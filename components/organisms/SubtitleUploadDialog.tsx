import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import MenuItem from "@mui/material/MenuItem";
import type { SxProps, Theme } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import TextField from "$atoms/TextField";
import card from "$styles/card";
import type { VideoTrackProps } from "$server/models/videoTrack";
import languages from "$utils/languages";

const marginSx: SxProps<Theme> = {
  "& > :not(:last-child)": {
    mb: 2,
  },
};

type Props = {
  open: boolean;
  onClose: React.MouseEventHandler;
  onSubmit?(videoTrack: VideoTrackProps): void;
};

export default function SubtitleUploadDialog(props: Props) {
  const { open, onClose, onSubmit = () => undefined } = props;
  const defaultValues = {
    language: Object.getOwnPropertyNames(languages)[0],
    content: "",
  };
  const { handleSubmit, register } = useForm<
    VideoTrackProps & { contentFile?: FileList }
  >({
    defaultValues,
  });
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: card,
        },
      }}
    >
      <form
        onSubmit={handleSubmit(({ contentFile, ...values }) => {
          const content = contentFile?.[0] ?? defaultValues.content;
          onSubmit({ ...values, content });
        })}
      >
        <DialogTitle>字幕のアップロード</DialogTitle>
        <DialogContent sx={marginSx}>
          <TextField
            label="字幕ファイル"
            type="file"
            inputProps={register("contentFile")}
          />
          <TextField
            label="言語"
            select
            defaultValue={defaultValues.language}
            inputProps={register("language")}
          >
            {Object.entries(languages).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" color="primary" type="submit">
            アップロード
          </Button>
        </DialogContent>
      </form>
    </Dialog>
  );
}
