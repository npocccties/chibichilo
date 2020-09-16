import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { PlayerProps } from "./Player";
import { usePlayer } from "./VideoJs";
import { sendVideoId, trackingStart } from "./log";
import { useLmsSession, isLmsInstructor } from "./session";
import { VideoPlayerProps, VideoPlayer } from "./VideoPlayer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    flex: {
      [theme.breakpoints.up("md")]: {
        display: "flex",
      },
    },
    player: {
      [theme.breakpoints.up("md")]: {
        order: 2,
        flexGrow: 1,
      },
    },
    playList: {
      [theme.breakpoints.up("md")]: {
        order: 1,
        flexBasis: "320px",
        flexShrink: 0,
        maxHeight: "calc(100vh - 72px)",
        marginRight: theme.spacing(1),
        overflowY: "auto",
      },
    },
  })
);

/**
 * playlist を順番に再生するコンポーネント
 */
export function ContentsPlayer(props: {
  contents: Contents;
  playlist: Video[];
}) {
  const player = usePlayer();

  // NOTE: トラッキング用
  const session = useLmsSession();
  React.useEffect(() => {
    if (!isLmsInstructor(session) && player) trackingStart(player);
  }, [session, player]);

  const [playerState, setPlayerState] = React.useState<
    {
      index: number; // NOTE: playlist index number
    } & PlayerProps
  >();
  React.useEffect(() => {
    if (props.playlist.length === 0) return;
    const index = 0;
    const { type, src, subtitles } = props.playlist[index];
    setPlayerState({ index, type, src, subtitles, autoplay: true });
  }, [setPlayerState, props.playlist]);
  const endedHandler = React.useCallback(() => {
    setPlayerState((prev) => {
      if (!prev) return prev;
      const next = prev.index + 1;
      if (next < props.playlist.length) {
        return {
          index: next,
          ...props.playlist[next],
          autoplay: true,
        };
      } else {
        return prev;
      }
    });
  }, [setPlayerState, props.playlist]);
  React.useEffect(() => {
    if (!player) return;
    player.on("ended", endedHandler);
    return () => player.off("ended", endedHandler);
  }, [player, endedHandler]);

  const playlistClickHandler: (
    index: number
  ) => (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = React.useCallback(
    (index: number) => {
      const video = props.playlist[index];
      return () => {
        // NOTE: トラッキング用
        if (!isLmsInstructor(session) && player) sendVideoId(player, video.id);

        setPlayerState((prev) => prev && { index, ...video, autoplay: true });
      };
    },
    [setPlayerState, props.playlist, session, player]
  );

  const classes = useStyles();
  const videoPlayerProps: VideoPlayerProps | undefined = playerState && {
    ...playerState,
    ...props.playlist[playerState.index],
  };
  return (
    <>
      <Box my={2}>
        <Typography component="h2" variant="h5">
          {props.contents.title}
        </Typography>
      </Box>
      <Box className={classes.flex}>
        <Box className={classes.player}>
          {videoPlayerProps && <VideoPlayer {...videoPlayerProps} />}
        </Box>
        <Paper className={classes.playList}>
          <List component="nav" aria-label="secondary mailbox folders">
            {props.playlist.map(({ id, title, description }, index) => {
              const playing = playerState?.index === index;
              return (
                <ListItem
                  key={index}
                  button
                  selected={playing}
                  onClick={playlistClickHandler(index)}
                >
                  {playing && (
                    <ListItemIcon>
                      <PlayArrowIcon />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={title}
                    secondary={`#${id} : ${description}`}
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                    inset={!playing}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Box>
    </>
  );
}
