import fs from "fs";
import path from "path";
import yauzl from "yauzl";
// @ts-expect-error Could not find a declaration file for module 'recursive-readdir-synchronous'
import recursive from "recursive-readdir-synchronous";
import { Buffer } from "buffer";

import type { ValidationError } from "class-validator";
import { validate } from "class-validator";
import type { UserSchema } from "$server/models/user";
import type { BookProps, BookSchema } from "$server/models/book";
import type {
  BooksImportParams,
  BooksImportResult,
  ImportTopic,
  ImportSection,
  ImportBook,
} from "$server/models/booksImportParams";
import { ImportBooks } from "$server/models/booksImportParams";
import prisma from "$server/utils/prisma";
import findBook from "./findBook";
import { parse as parseProviderUrl } from "$server/utils/videoResource";
import { startWowzaUpload } from "$server/utils/wowza/upload";
import { validateWowzaSettings } from "$server/utils/wowza/env";
import findRoles from "$server/utils/author/findRoles";
import insertAuthors from "$server/utils/author/insertAuthors";
import type { Book, Topic } from "@prisma/client";
import findTopic from "$server/utils/topic/findTopic";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import keywordsConnectOrCreateInput from "../keyword/keywordsConnectOrCreateInput";
import keywordsDisconnectInput from "../keyword/keywordsDisconnectInput";
import type { KeywordSchema } from "$server/models/keyword";
import topicInput from "../topic/topicInput";
import resourceConnectOrCreateInput from "../topic/resourceConnectOrCreateInput";
import { topicsWithResourcesArg } from "../topic/topicToTopicSchema";
import updateBookTimeRequired from "../topic/updateBookTimeRequired";
import type { SessionSchema } from "$server/models/session";
import topicExists from "../topic/topicExists";
import { isUsersOrAdmin } from "../session";

async function importBooksUtil(
  user: UserSchema,
  params: BooksImportParams
): Promise<BooksImportResult> {
  const util = new ImportBooksUtil(user, params);
  await util.importBooks();
  return util.result();
}

export async function importTopicUtil(
  user: UserSchema,
  params: BooksImportParams,
  topicId: Topic["id"]
): Promise<BooksImportResult> {
  const util = new ImportBooksUtil(user, params);
  await util.importTopic(topicId);
  return util.result();
}

export async function importBookUtil(
  session: SessionSchema,
  params: BooksImportParams,
  bookId: Book["id"]
): Promise<BooksImportResult> {
  const util = new ImportBooksUtil(session.user, params);
  await util.importBook(session, bookId);
  return util.result();
}

class ImportBooksUtil {
  user: UserSchema;
  params: BooksImportParams;
  books: BookSchema[];
  errors: string[];
  timeRequired: number;
  tmpdir: string;
  unzippedFiles: string[];

  constructor(user: UserSchema, params: BooksImportParams) {
    this.user = user;
    this.params = params;
    this.books = [];
    this.errors = [];
    this.timeRequired = 0;
    this.tmpdir = "";
    this.unzippedFiles = [];
  }

  async importBooks() {
    try {
      const importBooks = ImportBooks.init(await this.parseJsonFromFile());
      if (this.errors.length) return;

      const results = await validate(importBooks, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      this.parseError(results);
      if (this.errors.length) return;

      if (this.tmpdir) {
        await this.uploadFiles(importBooks);
      }
      if (this.errors.length) return;

      const transactions = [];
      for (const importBook of importBooks.books) {
        transactions.push(
          prisma.book.create({ data: this.getBookProps(importBook) })
        );
      }
      if (this.errors.length) return;

      const books = [];
      for (const book of await prisma.$transaction(transactions)) {
        const res = await findBook(book.id, this.user.id);
        if (res) books.push(res as BookSchema);
      }

      const roles = await findRoles();
      const contents = {
        books,
        topics: books.flatMap((book) =>
          book.sections.flatMap((section) => section.topics)
        ),
      };

      await prisma.$transaction([
        ...contents.books.map((book) =>
          insertAuthors(roles, "book", book.id, this.params.authors)
        ),
        ...contents.topics.map((topic) =>
          insertAuthors(roles, "topic", topic.id, this.params.authors)
        ),
      ]);

      for (const book of books) {
        const res = await findBook(book.id, this.user.id);
        if (res) this.books.push(res as BookSchema);
      }
    } catch (e) {
      console.error(e);
      this.errors.push(...(Array.isArray(e) ? e : [String(e)]));
    } finally {
      await this.cleanUp();
    }
  }

  findTopicFromImportBook(importBook: ImportBook, name: string) {
    const result: ImportTopic[] = [];
    for (const bookSection of importBook.sections) {
      for (const sectionTopic of bookSection.topics) {
        if (sectionTopic.name === name) {
          result.push(sectionTopic);
        }
      }
    }
    return result;
  }

  findTopicFromBook(book: BookSchema, name: string) {
    const result: TopicSchema[] = [];
    for (const bookSection of book.sections) {
      for (const sectionTopic of bookSection.topics) {
        if (sectionTopic.name === name) {
          result.push(sectionTopic);
        }
      }
    }
    return result;
  }

  topicUpdateInput(topic: TopicProps, keywords: KeywordSchema[]) {
    const input = {
      ...topicInput(topic),
      resource: resourceConnectOrCreateInput(topic.resource),
      keywords: {
        ...keywordsConnectOrCreateInput(topic.keywords ?? []),
        ...keywordsDisconnectInput(keywords, topic.keywords ?? []),
      },
    };

    return input;
  }

  async updateTopic(
    topicId: Topic["id"],
    importTopic: ImportTopic,
    orig: TopicSchema
  ) {
    const topic = {
      name: importTopic.name,
      description: importTopic.description,
      language: importTopic.language,
      timeRequired:
        importTopic.timeRequired > 0
          ? importTopic.timeRequired
          : orig.timeRequired,
      shared: orig.shared,
      license: importTopic.license,
      startTime: orig.startTime,
      stopTime: orig.stopTime,
      resource: importTopic.resource,
      keywords: importTopic.keywords.map((str) => {
        return { name: str };
      }),
    };
    const keywordsBeforeUpdate = await prisma.keyword.findMany({
      where: { topics: { some: { id: topicId } } },
    });
    return {
      ...topicsWithResourcesArg,
      where: { id: topicId },
      data: this.topicUpdateInput(topic, keywordsBeforeUpdate),
    };
  }

  async updateBook(
    id: number,
    { sections: _sections, publicBooks: _publicBooks, ...book }: BookProps
  ) {
    const keywordsBeforeUpdate = await prisma.keyword.findMany({
      where: { books: { some: { id } } },
    });
    return {
      where: { id },
      data: {
        ...book,
        keywords: {
          ...keywordsConnectOrCreateInput(book.keywords ?? []),
          ...keywordsDisconnectInput(keywordsBeforeUpdate, book.keywords ?? []),
        },
        updatedAt: new Date(),
      },
    };
  }

  async importTopic(topicId: Topic["id"]) {
    try {
      const importBooks = ImportBooks.init(await this.parseJsonFromFile());
      if (this.errors.length) return;

      const results = await validate(importBooks, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      this.parseError(results);
      if (this.errors.length) return;

      const orig = await findTopic(topicId);
      if (orig === undefined) {
        this.errors.push("トピックが見つかりません。\n");
        return;
      }

      if (importBooks.books.length !== 1) {
        this.errors.push("複数のブックが含まれています。\n");
        return;
      }

      const importTopics = this.findTopicFromImportBook(
        importBooks.books[0],
        orig.name
      );
      if (importTopics.length === 0) {
        this.errors.push("同じタイトルのトピックが見つかりません。\n");
        return;
      } else if (importTopics.length !== 1) {
        this.errors.push("同じタイトルの複数のトピックが含まれています。\n");
        return;
      }

      // 処理するトピックのビデオファイルだけをアップロードする
      importBooks.books[0].sections = [
        {
          name: "",
          topics: importTopics,
        },
      ];
      if (this.tmpdir) {
        await this.uploadFiles(importBooks);
      }
      if (this.errors.length) return;

      // トピックを上書きする
      const updateInput = await this.updateTopic(
        topicId,
        importTopics[0],
        orig
      );
      const created = await prisma.topic.update(updateInput);
      if (!created) {
        this.errors.push("トピックの上書きに失敗しました。\n");
        return;
      }

      // ブックの timeRequired を調整する
      if (importTopics[0].timeRequired > 0) {
        await updateBookTimeRequired(topicId);
      }
    } catch (e) {
      console.error(e);
      this.errors.push(...(Array.isArray(e) ? e : [String(e)]));
    } finally {
      await this.cleanUp();
    }
  }

  async importBook(session: SessionSchema, bookId: Book["id"]) {
    try {
      const importBooks = ImportBooks.init(await this.parseJsonFromFile());
      if (this.errors.length) return;

      const results = await validate(importBooks, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      this.parseError(results);
      if (this.errors.length) return;

      // ブックを探して条件を確認する
      const orig = await findBook(bookId, this.user.id);
      if (orig === undefined) {
        this.errors.push("ブックが見つかりません。\n");
        return;
      }

      if (importBooks.books.length !== 1) {
        this.errors.push("jsonファイルに複数のブックが含まれています。\n");
        return;
      }

      if (orig.name !== importBooks.books[0].name) {
        this.errors.push("jsonファイルとブックのタイトルが一致しません。\n");
        return;
      }

      // インポートするトピックのリストを作成する
      const names: string[] = [];
      const jobs: { import: ImportTopic; orig: TopicSchema }[] = [];
      for (const section of importBooks.books[0].sections) {
        for (const topic of section.topics) {
          if (names.includes(topic.name)) {
            this.errors.push(
              `jsonファイルのトピックタイトル ${topic.name} が重複しています。`
            );
            return;
          }
          names.push(topic.name);
          const origTopics = this.findTopicFromBook(orig, topic.name);
          if (origTopics.length === 0) {
            this.errors.push(
              `指定されたタイトル ${topic.name} のトピックが見つかりません。`
            );
            return;
          } else if (origTopics.length !== 1) {
            this.errors.push(
              `指定されたタイトル ${topic.name} のトピックが複数見つかりました。`
            );
            return;
          }
          jobs.push({ import: topic, orig: origTopics[0] });
        }
      }

      // 処理するトピックが自身の著作であることを確認する
      for (const job of jobs) {
        const found = await topicExists(job.orig.id);
        if (!found) {
          this.errors.push(
            `対象のトピック ${job.import.name} が見つかりませんでした。`
          );
          continue;
        }
        if (!isUsersOrAdmin(session, found.authors)) {
          this.errors.push(
            `対象のトピック ${job.import.name} が自身の著作ではありません。`
          );
        }
      }
      if (this.errors.length) {
        this.errors.push(
          `自身の著作ではないトピックが指定されているため、ブックの上書きを行いませんでした。`
        );
        return;
      }

      // 処理するトピックのビデオファイルだけをアップロードする
      importBooks.books[0].sections = [
        {
          name: "",
          topics: jobs.map((job) => job.import),
        },
      ];
      if (this.tmpdir) {
        await this.uploadFiles(importBooks);
      }
      if (this.errors.length) return;

      // トピックの上書きデータ
      const topicInputArray = [];
      const timeRequiredTopicIds = [];
      for (const job of jobs) {
        topicInputArray.push(
          await this.updateTopic(job.orig.id, job.import, job.orig)
        );
        if (job.import.timeRequired > 0) {
          timeRequiredTopicIds.push(job.orig.id);
        }
      }

      // ブックの上書きデータ
      const { name, description, language, keywords } = importBooks.books[0];
      const bookInput = await this.updateBook(bookId, {
        name,
        description,
        language,
        shared: orig.shared,
        keywords: keywords.map((str) => {
          return { name: str };
        }),
      });

      // DB更新
      const created = await prisma.$transaction([
        ...topicInputArray.map((topicInput) => prisma.topic.update(topicInput)),
        prisma.book.update(bookInput),
      ]);
      if (!created) {
        this.errors.push("ブックの上書きに失敗しました。\n");
        return;
      }

      // ブックの timeRequired を調整する
      if (timeRequiredTopicIds.length > 0) {
        await updateBookTimeRequired(timeRequiredTopicIds);
      }
    } catch (e) {
      console.error(e);
      this.errors.push(...(Array.isArray(e) ? e : [String(e)]));
    } finally {
      await this.cleanUp();
    }
  }

  parseError(results: ValidationError[], parentLabel = "") {
    for (const result of results) {
      const label =
        parentLabel +
        (Number.isNaN(Number(result.property))
          ? parentLabel
            ? `.${result.property}`
            : result.property
          : `[${result.property}]`);
      for (const constraint in result.constraints) {
        if (constraint == "whitelistValidation") {
          this.errors.push(
            `${parentLabel}: 不明なプロパティ "${result.property}" が含まれています。`
          );
        } else if (constraint == "nestedValidation") {
          this.errors.push(`${parentLabel}: ${result.constraints[constraint]}`);
        } else {
          this.errors.push(`${label}: ${result.constraints[constraint]}`);
        }
      }
      if (result.children) {
        this.parseError(result.children, label);
      }
    }
  }

  result() {
    const result: BooksImportResult = {
      books: this.books,
      errors: this.errors,
    };
    return result;
  }

  async cleanUp() {
    if (this.tmpdir) {
      await fs.promises.rm(this.tmpdir, { recursive: true });
    }
  }

  async parseJson() {
    if (this.params.file) {
      return await this.parseJsonFromFile();
    }

    try {
      return JSON.parse(this.params.json || "");
    } catch (e) {
      this.errors.push(`入力されたjsonテキストを解釈できません。\n${e}`);
      return {};
    }
  }

  parseJsonFromFile() {
    if (!this.params.file) {
      this.errors.push(`ファイルをアップロードしてください。`);
      return {};
    }

    this.tmpdir = fs.mkdtempSync("/tmp/chibichilo-import-");
    const file = `${this.tmpdir}/file`;
    fs.writeFileSync(file, Buffer.from(this.params.file as string, "base64"));

    return new Promise((resolve) => {
      const options = {
        lazyEntries: true,
      };
      yauzl.open(file, options, (err, zipfile) => {
        if (err) {
          try {
            resolve(JSON.parse(fs.readFileSync(file).toString()));
          } catch (e) {
            this.errors.push(`ファイルがzipではありません。\n${err}`);
            resolve({});
          }
          return;
        }
        zipfile.readEntry();
        zipfile
          .on("entry", (entry) => {
            // ディレクトリは fileName が '/' で終わっている
            if (/\/$/.test(entry.fileName)) {
              zipfile.readEntry();
            } else {
              const filename = path.join(this.tmpdir, entry.fileName);
              const dirname = path.dirname(filename);
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err) {
                  this.errors.push(
                    `openReadStreamでエラーが発生しました。\n${err}`
                  );
                  zipfile.readEntry();
                  return;
                }
                try {
                  if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname, { recursive: true });
                  }
                  readStream.on("end", () => {
                    zipfile.readEntry();
                  });
                  const ws = fs.createWriteStream(filename);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  readStream.pipe(ws).on("error", (err: any) => {
                    this.errors.push(
                      `zip解凍中にファイルの書き込みに失敗しました。\n${err}`
                    );
                    readStream.destroy();
                    zipfile.readEntry();
                  });
                } catch (err) {
                  this.errors.push(`zip解凍中に例外が発生しました。\n${err}`);
                  readStream.destroy();
                  zipfile.readEntry();
                }
              });
            }
          })
          .on("close", () => {
            this.unzippedFiles = recursive(this.tmpdir);
            const jsonfiles: string[] = this.unzippedFiles.filter((filename) =>
              filename.toLowerCase().endsWith(".json")
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jsons: any[] = [];
            if (jsonfiles.length) {
              for (const jsonfile of jsonfiles) {
                try {
                  const json = JSON.parse(fs.readFileSync(jsonfile).toString());
                  jsons.push(...(Array.isArray(json) ? json : [json]));
                } catch (e) {
                  this.errors.push(
                    `入力されたjsonテキストを解釈できません。\n${e}`
                  );
                }
              }
            } else {
              this.errors.push("jsonファイルがありません。");
            }
            if (this.errors.length) {
              resolve({});
            } else {
              resolve(jsons);
            }
          })
          .on("error", (error) => {
            try {
              resolve(JSON.parse(fs.readFileSync(file).toString()));
            } catch (e) {
              this.errors.push(`ファイルがzipではありません。\n${error}`);
              resolve({});
            }
          });
      });
    });
  }

  async uploadFiles(importBooks: ImportBooks) {
    const uploadEnabled =
      this.params.provider == "https://www.wowza.com/" &&
      validateWowzaSettings(false);
    const now = new Date();
    const filenames = [];
    let wowzaUpload;

    try {
      wowzaUpload = await startWowzaUpload(
        this.user.ltiConsumerId,
        this.user.id
      );
      for (const importBook of importBooks.books) {
        for (const bookSection of importBook.sections) {
          for (const sectionTopic of bookSection.topics) {
            if (sectionTopic.resource.file) {
              if (!uploadEnabled) {
                this.errors.push("動画ファイルのアップロードはできません。");
                return;
              }

              const filename = path.basename(sectionTopic.resource.file);
              if (filenames.indexOf(filename) > -1) {
                this.errors.push(
                  `ファイル ${filename} が重複しています。(サブフォルダはまとめられます)`
                );
              }

              const fullpath = this.unzippedFiles.find(
                (element) => path.basename(element) == filename
              );
              if (!fullpath) {
                this.errors.push(`ファイル ${filename} がありません。`);
                continue;
              }

              filenames.push(filename);
              const uploadpath = await wowzaUpload.moveFileToUpload(
                fullpath,
                now
              );
              sectionTopic.resource.providerUrl = this.params.provider;
              sectionTopic.resource.url = `${this.params.wowzaBaseUrl}${uploadpath}`;
            } else {
              try {
                const parsedResource = parseProviderUrl(
                  sectionTopic.resource.url
                );
                sectionTopic.resource.providerUrl =
                  parsedResource?.providerUrl ??
                  sectionTopic.resource.providerUrl;
                sectionTopic.resource.url =
                  parsedResource?.url ?? sectionTopic.resource.url;
              } catch (e) {
                // nop
              }
            }
          }
        }
      }

      if (this.errors.length) return;
      if (!filenames.length) return;
      await wowzaUpload.upload();
    } catch (e) {
      this.errors.push(`サーバーにアップロードできませんでした。\n${e}`);
    } finally {
      if (wowzaUpload) await wowzaUpload.cleanUp();
    }
  }

  getBookProps(importBook: ImportBook) {
    const sections = [];
    for (const [index, bookSection] of importBook.sections.entries()) {
      sections.push(this.getSection(bookSection, index));
    }

    return {
      ...importBook,
      timeRequired: this.timeRequired,
      publishedAt: new Date(importBook.publishedAt),
      createdAt: new Date(importBook.createdAt),
      updatedAt: new Date(importBook.updatedAt),
      keywords: this.getKeywords(importBook.keywords),
      sections: { create: sections },
      ltiResourceLinks: {},
    };
  }

  getSection(bookSection: ImportSection, order: number) {
    const topicSections = [];
    for (const [index, sectionTopic] of bookSection.topics.entries()) {
      topicSections.push(this.getTopicSection(sectionTopic, index));
    }

    return {
      order,
      name: bookSection.name,
      topicSections: { create: topicSections },
    };
  }

  getTopicSection(sectionTopic: ImportTopic, order: number) {
    this.timeRequired += sectionTopic.timeRequired;

    const video = {
      create: {
        providerUrl: sectionTopic.resource.providerUrl,
        tracks: { create: sectionTopic.resource.tracks },
      },
    };

    const resource = {
      connectOrCreate: {
        create: {
          video,
          url: sectionTopic.resource.url,
          details: sectionTopic.resource.details,
        },
        where: { url: sectionTopic.resource.url },
      },
    };

    const topic = {
      ...sectionTopic,
      createdAt: new Date(sectionTopic.createdAt),
      updatedAt: new Date(sectionTopic.updatedAt),
      keywords: this.getKeywords(sectionTopic.keywords),
      resource,
    };

    return { order, topic: { create: topic } };
  }

  getKeywords(keywords: string[]) {
    return {
      connectOrCreate: keywords.map((name) => {
        return { create: { name }, where: { name } };
      }),
    };
  }
}

export default importBooksUtil;
