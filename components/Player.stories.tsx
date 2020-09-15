export default { title: "Player" };
import { Player, PlayerProps } from "./Player";

const Template = (props: Partial<PlayerProps>) => (
  <Player
    type="youtube"
    src="3yfen-t49eI"
    subtitles={[{ lang: "en", file: new File([], "sample_file.vtt") }]}
    autoplay
    {...props}
  />
);

export const YouTube = Template;

export const Vimeo = () => <Template type="vimeo" src="1084537" />;

export const Wowza = () => <Template type="wowza" src="sample.mp4" />;
