import {
  SetStateAction,
  FormEvent,
  KeyboardEvent,
  useCallback,
  Dispatch,
} from "react";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { parse } from "./video/location";

const defaultLabel = "動画URLまたはファイル名";
const label = {
  youtube: "YouTube動画のURLまたはビデオID",
  vimeo: "Vimeo動画のURLまたはビデオID",
  wowza: defaultLabel,
};
const defaultAdornment = null;
const adornment = {
  youtube: "https://www.youtube.com/watch?v=",
  vimeo: "https://vimeo.com/",
  wowza: defaultAdornment,
};

function state(value: string): SetStateAction<VideoLocation> {
  return (prev: VideoLocation) => ({
    ...prev,
    ...parse(value),
  });
}

function useInputHandler(dispatch: Dispatch<SetStateAction<VideoLocation>>) {
  const handler = (event: FormEvent<HTMLInputElement>) => {
    dispatch(state(event.currentTarget.value));
  };
  return useCallback(handler, [dispatch]);
}

function useKeyDownHandler(dispatch: Dispatch<SetStateAction<VideoLocation>>) {
  const handler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace") return;
    if (event.currentTarget.value === "") {
      dispatch({ type: "wowza", src: "" });
    }
  };
  return useCallback(handler, [dispatch]);
}

export function VideoLocationField(props: {
  name?: string;
  location: VideoLocation;
  setLocation: Dispatch<SetStateAction<VideoLocation>>;
}) {
  const inputHandler = useInputHandler(props.setLocation);
  const keyDownHandler = useKeyDownHandler(props.setLocation);

  return (
    <TextField
      name={props.name ?? "VideoLocationField"}
      label={label[props.location.type]}
      value={props.location.src}
      variant="filled"
      required
      fullWidth
      color="secondary"
      inputProps={{
        onInput: inputHandler,
        onKeyDown: keyDownHandler,
      }}
      InputProps={{
        startAdornment: adornment[props.location.type] && (
          <InputAdornment position="start">
            {adornment[props.location.type]}
          </InputAdornment>
        ),
      }}
    />
  );
}
