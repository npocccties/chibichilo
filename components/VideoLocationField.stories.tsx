export default { title: "VideoLocationField" };
import { useState } from "react";
import { VideoLocationField, VideoLocation } from "./VideoLocationField";

export function Basic() {
  const [location, setLocation] = useState<VideoLocation>({
    type: "youtube",
    src: "3yfen-t49eI",
  });

  console.log(location);

  return <VideoLocationField location={location} setLocation={setLocation} />;
}
