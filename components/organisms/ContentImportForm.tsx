import { Buffer } from "buffer";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import TextField from "$atoms/TextField";
import card from "styles/card";
import gray from "theme/colors/gray";
import { useSessionAtom } from "$store/session";
import type { BooksImportParams } from "$server/models/booksImportParams";
import { NEXT_PUBLIC_API_BASE_PATH } from "$utils/env";
import { useAuthorsAtom } from "$store/authors";

const marginSx = {
  "& > :not(:first-child)": {
    mt: 2.5,
  },
};

const labelDescriptionSx = {
  ml: 0.75,
  color: gray[600],
};

type Props = {
  className?: string;
  onSubmit?: (book: BooksImportParams) => void;
};

export default function ContentImportForm(props: Props) {
  const { className, onSubmit = () => undefined } = props;
  const { session } = useSessionAtom();
  const authorsInputProps = useAuthorsAtom();
  const providers: { [key: string]: string } = {};
  if (session?.systemSettings?.wowzaUploadEnabled) {
    providers.wowza = "https://www.wowza.com/";
  }
  const defaultValues: BooksImportParams = {
    authors: [],
    json: "",
    file: "",
    provider: Object.values(providers)[0] ?? "",
    wowzaBaseUrl: `${NEXT_PUBLIC_API_BASE_PATH}/api/v2/wowza`,
  };
  const { handleSubmit, register } = useForm<BooksImportParams>({
    defaultValues,
  });

  return (
    <Card
      sx={[card, marginSx]}
      className={className}
      component="form"
      onSubmit={handleSubmit((values: BooksImportParams) => {
        values.authors = authorsInputProps.authors;

        if (values?.file?.length) {
          const reader = new FileReader();
          reader.addEventListener(
            "load",
            function () {
              onSubmit({
                ...values,
                file: Buffer.from(reader.result as ArrayBuffer).toString(
                  "base64"
                ),
              });
            },
            false
          );
          reader.readAsArrayBuffer(values.file[0] as unknown as File);
        } else {
          onSubmit({ ...values, file: undefined });
        }
      })}
    >
      <TextField
        label="json ファイル、または json ファイルを含む zip ファイル"
        type="file"
        inputProps={register("file")}
      />
      <Typography sx={labelDescriptionSx} variant="caption" component="span">
        <Link
          href="https://github.com/npocccties/chilospeech/blob/main/docs/spec/import.md"
          target="_blank"
          rel="noreferrer"
        >
          json ファイルの仕様
        </Link>
      </Typography>
      {Boolean(Object.entries(providers).length) && (
        <TextField
          label={
            <>
              動画ファイルをアップロードするサービス
              <Typography
                sx={labelDescriptionSx}
                variant="caption"
                component="span"
              >
                動画ファイルのアップロード先です。URL
                による指定の場合は無視されます
              </Typography>
            </>
          }
          select
          defaultValue={defaultValues.provider}
          inputProps={register("provider")}
        >
          {Object.entries(providers).map(([label, value]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Button variant="contained" color="primary" type="submit">
        インポート
      </Button>
    </Card>
  );
}
