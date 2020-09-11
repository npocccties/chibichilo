export default { title: "Player" };
import { Player } from "./Player";

export const YouTube = () => (
  <Player
    type="youtube"
    src="3yfen-t49eI"
    subtitles={[{ lang: "en", file: new File([], "sample_file.vtt") }]}
    autoplay
  />
);
