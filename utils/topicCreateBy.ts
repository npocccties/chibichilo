import { TopicSchema } from "$server/models/topic";
import { UserSchema } from "$server/models/user";

/**
 * トピックの作成者の判定
 * @param topic トピック
 * @param by ユーザー
 * @returns トピックの作成者がユーザーの場合: true、それ以外: false
 */
function topicCreateBy(
  topic: Pick<TopicSchema, "creator">,
  by?: Pick<UserSchema, "id">
): boolean {
  return topic.creator.id === by?.id;
}

export default topicCreateBy;
