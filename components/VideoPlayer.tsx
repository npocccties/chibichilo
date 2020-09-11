import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { VideoSchema } from "./video";
import { PlayerProps, Player } from "./Player";

export type VideoPlayerProps = VideoSchema & PlayerProps;

export function VideoPlayer(props: VideoPlayerProps) {
  return (
    <div>
      <Player
        type={props.type}
        src={props.src}
        subtitles={props.subtitles}
        autoplay={props.autoplay}
      />
      <Box my={2}>
        <Typography component="h3" variant="h6" style={{ marginBottom: 8 }}>
          {props.title}
        </Typography>
        {props.description.split("\n").map((text, i) => (
          <Typography key={i}>{text}</Typography>
        ))}
      </Box>
      <Divider />
      <Box
        my={2}
        component="dl"
        display="grid"
        gridTemplateColumns="4rem 1fr"
        gridColumnGap="1rem"
      >
        <Typography component="dt">スキル</Typography>
        <Typography component="dd">
          {props.skills
            .filter(({ has }) => has)
            .map(({ name }) => name)
            .join(", ") || "-"}
        </Typography>
        <Typography component="dt">職種</Typography>
        <Typography component="dd">
          {props.tasks
            .filter(({ has }) => has)
            .map(({ name }) => name)
            .join(", ") || "-"}
        </Typography>
        <Typography component="dt">レベル</Typography>
        <Typography component="dd">
          {props.levels
            .filter(({ has }) => has)
            .map(({ name }) => name)
            .join(", ") || "-"}
        </Typography>
      </Box>
    </div>
  );
}
