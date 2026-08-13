import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useLmsUrl } from "$store/session";
import Problem from "$organisms/Problem";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import { useBookmarksByTopicId } from "$utils/bookmark/useBookmarks";

type Props = {
  bookId?: BookSchema["id"];
  topicId?: TopicSchema["id"];
};

function MemoDisplay({
  topicId,
  bookId,
}: {
  topicId: number;
  bookId?: number;
}) {
  const { bookmarks } = useBookmarksByTopicId({ topicId, bookId });
  const validBookmarks = bookmarks.filter((bm) => bm.memoContent);
  if (!validBookmarks || validBookmarks.length === 0) return null;
  return (
    <Box
      mt={4}
      p={2}
      border={1}
      borderColor="grey.300"
      borderRadius={1}
      textAlign="left"
    >
      <Typography variant="h6" gutterBottom>
        教材についてのコメント
      </Typography>
      {validBookmarks.map((bm, index) => (
        <Box key={index} mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="body2" whiteSpace="pre-wrap">
            {bm.memoContent}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function BookViewingNotAllowedProblem({
  bookId,
  topicId,
}: Props) {
  const url = useLmsUrl();
  return (
    <Problem title="閲覧できません">
      このブックは現在、このコースでの配信が停止されています。
      {topicId !== undefined && Number.isFinite(topicId) && (
        <MemoDisplay topicId={topicId} bookId={bookId} />
      )}
      {url && (
        <Box mt={3}>
          <p>
            <Link href={url}>LMSに戻る</Link>
          </p>
        </Box>
      )}
    </Problem>
  );
}
