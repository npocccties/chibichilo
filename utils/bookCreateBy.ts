import { BookSchema } from "$server/models/book";
import { UserSchema } from "$server/models/user";

/**
 * トピックの作成者の判定
 * @param topic トピック
 * @param by ユーザー
 * @returns トピックの作成者がユーザーの場合: true、それ以外: false
 */
function bookCreateBy(
  book: Pick<BookSchema, "author">,
  by?: Pick<UserSchema, "id">
): boolean {
  return book.author.id === by?.id;
}

export default bookCreateBy;
