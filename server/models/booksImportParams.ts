import type { FromSchema } from "json-schema-to-ts";
import type { ValidatorConstraintInterface } from "class-validator";
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  MinLength,
  IsObject,
  ArrayNotEmpty,
  IsLocale,
  IsISO8601,
  Matches,
  ValidateNested,
  ValidateIf,
  registerDecorator,
} from "class-validator";
import {
  validationMetadatasToSchemas,
  JSONSchema,
} from "class-validator-jsonschema";
import parse from "spdx-expression-parse";
import type { Mutable } from "$server/types/mutable";
import type { BookSchema } from "$server/models/book";
import { bookSchema } from "$server/models/book";
import { AuthorsProps } from "$server/models/authorsProps";

/** ブックのインポートのためのリクエストパラメーター */
export const BooksImportParams = {
  type: "object",
  required: ["authors", "provider", "wowzaBaseUrl"],
  properties: {
    authors: AuthorsProps.properties.authors,
    provider: { type: "string" },
    wowzaBaseUrl: { type: "string" },
    json: { type: "string" },
    file: { type: "string" },
  },
  additionalProperties: false,
} as const;

/** ブックのインポートのためのリクエストパラメーター */
export type BooksImportParams = FromSchema<typeof BooksImportParams>;

export class BooksImportResult {
  @IsOptional()
  @ValidateNested()
  @JSONSchema({
    type: "array",
    // NOTE: SchemaObject は mutable な型なので変換
    items: bookSchema as Mutable<typeof bookSchema>,
  })
  books?: BookSchema[];

  @IsOptional()
  @IsString({ each: true })
  errors?: string[];
}

export const booksImportResultSchema =
  validationMetadatasToSchemas().BooksImportResult;

class IsLicenseConstraint implements ValidatorConstraintInterface {
  message = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any) {
    if (value == null || !value.length) return true;
    try {
      parse(value);
      return true;
    } catch (e) {
      this.message = String(e);
      return false;
    }
  }

  defaultMessage() {
    return `ライセンスを識別できません。https://spdx.org/licenses/ から有効なライセンスを選択してください。\n${this.message}`;
  }
}

function IsLicense() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isLicense",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      validator: new IsLicenseConstraint(),
    });
  };
}

export class ImportTrack {
  @IsString({ message: "文字列ではないか未設定です。" })
  @MinLength(1, { message: "空白です。種別を設定してください。" })
  kind = "subtitles";

  @IsLocale({ message: "正しい言語コードを設定してください。" })
  language = "ja";

  @IsString({ message: "文字列ではないか未設定です。" })
  content = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static init(obj: any) {
    if (typeof obj != "object" || Array.isArray(obj)) return obj;

    return Object.assign(new ImportTrack(), obj);
  }
}

export const importTrackSchema = validationMetadatasToSchemas().ImportTrack;

export class ImportResource {
  @ValidateIf((o) => !o.url)
  @IsString({ message: "ファイル名ではないか未指定です。" })
  @MinLength(1, { message: "空白です。ファイル名を指定してください。" })
  file = "";

  @ValidateIf((o) => !o.file)
  @Matches(
    new RegExp(
      "^https://(.+\\.)?youtube\\.com/watch\\?v=.+|^https://youtu\\.be/.+|^https://vimeo\\.com/.+"
    ),
    {
      message:
        "動画ページのURLを設定してください。対応動画サイトは YouTube, Vimeo です。",
    }
  )
  url = "";

  providerUrl?: string;

  @IsObject({ message: "オブジェクト型のデータを設定してください。" })
  details = {};

  @ValidateNested({
    each: true,
    message: "トラックではないものが含まれています。",
  })
  tracks: ImportTrack[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static init(obj: any) {
    if (typeof obj != "object" || Array.isArray(obj)) return obj;

    const resource = Object.assign(new ImportResource(), obj);
    if (Array.isArray(resource.tracks)) {
      for (const [index, track] of resource.tracks.entries()) {
        resource.tracks[index] = ImportTrack.init(track);
      }
    }
    return resource;
  }
}

export const importResourceSchema =
  validationMetadatasToSchemas().ImportResource;

export class ImportTopic {
  @IsString({ message: "文字列ではないか未設定です。" })
  @MinLength(1, { message: "空白です。名称を設定してください。" })
  name = "";

  @IsString({ message: "文字列ではないか未設定です。" })
  description = "";

  @IsLocale({ message: "正しい言語コードを設定してください。" })
  language = "ja";

  @IsInt({ message: "整数ではないか未設定です。" })
  @Min(0, { message: "0以上の整数を設定してください。" })
  timeRequired = 0;

  @IsBoolean({ message: "真偽値ではないか未設定です。" })
  shared = false;

  @IsISO8601({}, { message: "ISO8601形式の日時ではないか未設定です。" })
  createdAt = new Date().toISOString();

  @IsOptional()
  updatedAt = new Date().toISOString();

  @IsString({ message: "文字列ではないか未設定です。" })
  @IsLicense()
  license = "";

  @IsString({ each: true, message: "文字列のリストを設定してください。" })
  keywords = [];

  @IsObject({ message: "オブジェクト型のデータを設定してください。" })
  details = {};

  @ValidateNested({ message: "リソースではないものが含まれています。" })
  resource: ImportResource = new ImportResource();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static init(obj: any) {
    if (typeof obj != "object" || Array.isArray(obj)) return obj;

    const topic = Object.assign(new ImportTopic(), obj, {
      updatedAt: new Date().toISOString(),
    });
    topic.resource = ImportResource.init(topic.resource);
    return topic;
  }
}

export const importTopicSchema = validationMetadatasToSchemas().ImportTopic;

export class ImportSection {
  @IsString({ message: "文字列ではないか未設定です。" })
  name = "";

  @ValidateNested({
    each: true,
    message: "トピックではないものが含まれています。",
  })
  @ArrayNotEmpty({ message: "1件以上のトピックが必要です。" })
  topics: ImportTopic[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static init(obj: any) {
    if (typeof obj != "object" || Array.isArray(obj)) return obj;

    const section = Object.assign(new ImportSection(), obj);
    if (Array.isArray(section.topics)) {
      for (const [index, topic] of section.topics.entries()) {
        section.topics[index] = ImportTopic.init(topic);
      }
    }
    return section;
  }
}

export const importSectionSchema = validationMetadatasToSchemas().ImportSection;

export class ImportBook {
  @IsString({ message: "文字列ではないか未設定です。" })
  @MinLength(1, { message: "空白です。題名を設定してください。" })
  name = "";

  @IsString({ message: "文字列ではないか未設定です。" })
  description = "";

  @IsLocale({ message: "正しい言語コードを設定してください。" })
  language = "ja";

  @IsBoolean({ message: "真偽値ではないか未設定です。" })
  shared = false;

  @IsISO8601({}, { message: "ISO8601形式の日時ではないか未設定です。" })
  publishedAt = new Date().toISOString();

  @IsISO8601({}, { message: "ISO8601形式の日時ではないか未設定です。" })
  createdAt = new Date().toISOString();

  @IsOptional()
  updatedAt = new Date().toISOString();

  @IsString({ each: true, message: "文字列のリストを設定してください。" })
  keywords = [];

  @IsObject({ message: "オブジェクト型のデータを設定してください。" })
  details = {};

  @ValidateNested({
    each: true,
    message: "セクションではないものが含まれています。",
  })
  @ArrayNotEmpty({ message: "1件以上のセクションが必要です。" })
  sections: ImportSection[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static init(obj: any) {
    if (typeof obj != "object" || Array.isArray(obj)) return obj;

    const book = Object.assign(new ImportBook(), obj, {
      updatedAt: new Date().toISOString(),
    });
    if (Array.isArray(book.sections)) {
      for (const [index, section] of book.sections.entries()) {
        book.sections[index] = ImportSection.init(section);
      }
    }
    return book;
  }
}

export const importBookSchema = validationMetadatasToSchemas().ImportBook;

export class ImportBooks {
  @ValidateNested({
    each: true,
    message: "ブックではないものが含まれています。",
  })
  @ArrayNotEmpty({ message: "1件以上のブックが必要です。" })
  books: ImportBook[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static init(obj: any) {
    const books = new ImportBooks();
    for (const book of Array.isArray(obj) ? obj : [obj]) {
      books.books.push(ImportBook.init(book));
    }
    return books;
  }
}

export const importBooksSchema = validationMetadatasToSchemas().ImportBooks;
