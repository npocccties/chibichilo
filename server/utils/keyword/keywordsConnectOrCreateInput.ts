import type { KeywordPropSchema, KeywordSchema } from "$server/models/keyword";

function keywordsConnectOrCreateInput<
  Input extends Array<KeywordPropSchema> | Array<KeywordSchema>
>(keywords: Input) {
  return {
    connectOrCreate: keywords.map(({ name }) => ({
      where: { name },
      create: { name },
    })),
  };
}

export default keywordsConnectOrCreateInput;
