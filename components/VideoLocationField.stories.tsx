export default { title: "VideoUrlField" };
import { useState } from "react";
import {
  VideoLocationField,
  VideoLocation,
} from "./VideoLocationField";

export function Basic() {
  const name = "VideoUrlField";
  const [location, setLocation] = useState<VideoLocation>({
    type: "youtube",
    src: "3yfen-t49eI",
  });

  console.log(location);

  return (
    <VideoLocationField name={name} location={location} setLocation={setLocation} />
  );
}
