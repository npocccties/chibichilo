import { ContentsPlayer } from "./ContentsPlayer";
import { useVideo } from "./video";

/**
 * Contents に紐づくビデオをの情報を取得して playlist を生成しタイトルを書き換えて ContentsPlayer に渡す
 */
export function ShowContents(props: { contents: Contents }) {
  const playlist = usePlaylist(props.contents.videos);
  return <ContentsPlayer contents={props.contents} playlist={playlist} />;
}

function usePlaylist(videos: Contents["videos"]): Video[] {
  return videos.map(({ id, title }) => ({ ...useVideo(id), title }));
}
