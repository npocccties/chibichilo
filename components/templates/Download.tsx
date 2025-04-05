import { useCallback } from "react";
import { Box, Card, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import GetAppOutlinedIcon from "@mui/icons-material/GetAppOutlined";
import makeStyles from "@mui/styles/makeStyles";
import Container from "$atoms/Container";
import useCardStyles from "$styles/card";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { SessionSchema } from "$server/models/session";
import { gray } from "$theme/colors";
import downloadBookActivity from "$utils/bookLearningActivity/download";
import type { EventType } from "$server/models/event";
import { api } from "$utils/api";

const useStyles = makeStyles(() => ({
  title: {
    fontSize: 32,
    marginBottom: 32,
  },
  card: {
    border: `1px solid ${gray[300]}`,
    borderRadius: 12,
    boxShadow: "none",
  },
  body: {
    backgroundColor: "#FFF",
  },
}));

type Props = {
  session: SessionSchema;
  bookActivities: Array<BookActivitySchema>;
};

export default function Download(props: Props) {
  const { session, bookActivities } = props;
  const classes = useStyles();
  const cardClasses = useCardStyles();
  const handleBookActivityDownloadClick = useCallback(() => {
    void downloadBookActivity(
      bookActivities,
      "全コース視聴分析データ.csv",
      session,
      true // ダウンロードページでは「このコースでの〜」相当のデータを得る
    );
    void send("admin-download", session, "book-activity");
  }, [bookActivities, session]);

  return (
    <Container sx={{ mt: 5, gridArea: "title" }} maxWidth="md">
      <Typography variant="h4" className={classes.title}>
        ダウンロード
      </Typography>
      <Card classes={cardClasses} className={classes.card}>
        <Box className={classes.body}>
          <Button
            onClick={handleBookActivityDownloadClick}
            color="secondary"
            variant="contained"
            size="small"
            disabled={bookActivities.length === 0}
            title="事前に[受講者の同期]ボタンを押してからダウンロードしてください"
          >
            <GetAppOutlinedIcon fontSize="small" />
            全コース視聴分析データをダウンロード
          </Button>
        </Box>
      </Card>
    </Container>
  );
}

/** $utils/eventLoger/logger.tsよりダウンロードページ用に移植 */
function send(eventType: EventType, session: SessionSchema, detail?: string) {
  const idPrefix = session.oauthClient.id;
  const id = (id: string) => [idPrefix, id].join(":");
  const body = {
    event: eventType,
    detail,
    rid: id(session?.ltiResourceLinkRequest?.id || ""),
    uid: id(session.ltiUser.id),
    cid: id(session.ltiContext.id),
    nonce: session.oauthClient.nonce,
    path: location.pathname,
  };
  return api.apiV2EventPost({ body });
}
