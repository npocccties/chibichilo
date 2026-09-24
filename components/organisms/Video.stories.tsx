import Video from "./Video";
import VideoPlayerView from "./Video/Video";
import type { StoryFn } from "@storybook/react";
import { topic, resource } from "../../samples";

export default { title: "organisms/Video", component: Video };

const Template: StoryFn<Parameters<typeof Video>[0]> = (args) => {
  return <Video {...args} />;
};

export const YouTube = Template.bind({});
YouTube.args = {
  topic: {
    ...topic,
    resourceId: resource.id,
    resource: {
      ...resource,
      providerUrl: "https://www.youtube.com/",
      url: "https://www.youtube.com/watch?v=3yfen-t49eI",
    },
  },
};

export const Vimeo = Template.bind({});
Vimeo.args = {
  topic: {
    ...topic,
    resourceId: resource.id,
    resource: {
      ...resource,
      providerUrl: "https://vimeo.com/",
      url: "https://vimeo.com/1084537",
    },
  },
};

export const Wowza = Template.bind({});
Wowza.args = {
  topic: {
    ...topic,
    resourceId: resource.id,
    resource: {
      ...resource,
      providerUrl: "https://wowzaec2demo.streamlock.net/",
      url: "https://wowzaec2demo.streamlock.net/vod/mp4/playlist.m3u8",
    },
  },
};

export const WowzaPlayer = () => (
  <VideoPlayerView
    kind="hls"
    src="https://wowzaec2demo.streamlock.net/vod/mp4/playlist.m3u8"
  />
);

export const YouTubePlayer = () => (
  <VideoPlayerView
    kind="youtube"
    src="https://www.youtube.com/watch?v=3yfen-t49eI"
  />
);

export const VimeoPlayer = () => (
  <VideoPlayerView kind="vimeo" src="https://vimeo.com/1084537" />
);
