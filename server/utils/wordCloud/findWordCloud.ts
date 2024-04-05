import prisma from "$server/utils/prisma";
import kuromoji from "kuromoji";
import type { WordCloudParams } from "$server/validators/wordCloudParams";
import type { WordCloudSchema } from "$server/models/wordCloud";
import { getBookIncludingArg } from "$server/utils/book/bookToBookSchema";
import findBookmarks from "../bookmark/findBookmarks";

function buildTokenizer() {
  return new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>(
    (resolve, reject) => {
      kuromoji
        .builder({ dicPath: "./utils/wordCloud/dict" })
        .build((err, tokenizer) => {
          if (err) {
            reject(err);
          } else {
            resolve(tokenizer);
          }
        });
    }
  );
}

const tokenize = async (text: string) => {
  const tokenizer = await buildTokenizer();

  return tokenizer.tokenize(text);
};

const TARGET_POS = ["名詞", "動詞", "形容詞"];

const convertToWordCloud = (
  tokens: kuromoji.IpadicFeatures[]
): WordCloudSchema => {
  const wordCountMap = new Map<string, number>();
  for (const token of tokens) {
    if (TARGET_POS.includes(token.pos)) {
      const word = token.surface_form;
      const value = wordCountMap.get(word) || 0;
      wordCountMap.set(word, value + 1);
    }
  }
  const wordCloud = Array.from(wordCountMap.entries()).map(([text, value]) => ({
    text,
    value,
  }));
  return wordCloud;
};

async function findWordCloud(
  bookId: WordCloudParams["bookId"],
  userId: number,
  ltiContextId: string,
  ltiConsumerId: string
): Promise<WordCloudSchema | undefined> {
  const book = await prisma.book.findUnique({
    ...getBookIncludingArg(userId),
    where: { id: bookId },
  });
  const sections = book?.sections || [];
  const topicSections = sections.flatMap(
    (section) => section.topicSections || []
  );

  let tokens: kuromoji.IpadicFeatures[] = [];
  for (const topicSection of topicSections || []) {
    const bookmarks = await findBookmarks({
      ltiContextId,
      ltiConsumerId,
      topicId: topicSection.topic.id,
    });
    for (const bookmark of bookmarks.bookmark) {
      if (!bookmark.memoContent) {
        continue;
      }
      const res = await tokenize(bookmark.memoContent);
      tokens = tokens.concat(res);
    }
  }
  return convertToWordCloud(tokens);
}

export default findWordCloud;
