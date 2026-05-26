import fs from "fs";
import path from "path";
import { Buffer } from "buffer";
import { buffer } from "node:stream/consumers";
import type { Readable } from "node:stream";
import yauzl from "yauzl";
import type { Entry } from "yauzl";
// @ts-expect-error Could not find a declaration file for module 'recursive-readdir-synchronous'
import recursive from "recursive-readdir-synchronous";
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
import { importLog } from "./importLog";

const ZIP_ENTRY_EXTRACT_TIMEOUT_MS = 10 * 60 * 1000;

function readZipEntryStream(
  readStream: Readable,
  uncompressedSize: number
): Promise<Buffer> {
  if (uncompressedSize <= 0) {
    readStream.resume();
    return buffer(readStream);
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let received = 0;
    let settled = false;

    const removeListeners = () => {
      readStream.off("data", onData);
      readStream.off("error", onError);
      readStream.off("end", onEnd);
    };

    const stopStream = () => {
      removeListeners();
      readStream.on("error", () => {});
      readStream.destroy();
    };

    const finish = (buf: Buffer) => {
      if (settled) return;
      settled = true;
      stopStream();
      resolve(buf);
    };

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      stopStream();
      reject(err);
    };

    const onData = (chunk: Buffer) => {
      chunks.push(chunk);
      received += chunk.length;
      if (received >= uncompressedSize) {
        finish(Buffer.concat(chunks).subarray(0, uncompressedSize));
      }
    };

    const onError = (err: Error) => {
      fail(err);
    };

    const onEnd = () => {
      if (received >= uncompressedSize) {
        finish(Buffer.concat(chunks).subarray(0, uncompressedSize));
        return;
      }
      fail(
        new Error(`zip解凍が不完全です (${received}/${uncompressedSize} bytes)`)
      );
    };

    readStream.on("data", onData);
    readStream.on("error", onError);
    readStream.on("end", onEnd);
    readStream.resume();
  });
}

async function importBooksUtil(
  user: UserSchema,
  params: BooksImportParams
): Promise<BooksImportResult> {
  importLog("importBooksUtil:start", {
    userId: user.id,
    hasFile: Boolean(params.file),
  });
  const util = new ImportBooksUtil(user, params);
  await util.importBooks();
  const result = util.result();
  importLog("importBooksUtil:done", {
    errorCount: result.errors.length,
    bookCount: result.books.length,
  });
  return result;
}

export async function importTopicUtil(
  user: UserSchema,
  params: BooksImportParams,
  topicId: Topic["id"]
): Promise<BooksImportResult> {
  importLog("importTopicUtil:start", {
    topicId,
    userId: user.id,
    hasFile: Boolean(params.file),
  });
  const util = new ImportBooksUtil(user, params);
  await util.importTopic(topicId);
  const result = util.result();
  importLog("importTopicUtil:done", {
    topicId,
    errorCount: result.errors.length,
  });
  return result;
}

export async function importBookUtil(
  session: SessionSchema,
  params: BooksImportParams,
  bookId: Book["id"]
): Promise<BooksImportResult> {
  importLog("importBookUtil:start", {
    bookId,
    userId: session.user.id,
    hasFile: Boolean(params.file),
  });
  const util = new ImportBooksUtil(session.user, params);
  await util.importBook(session, bookId);
  const result = util.result();
  importLog("importBookUtil:done", {
    bookId,
    errorCount: result.errors.length,
  });
  return result;
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
    importLog("importBooks:start", { userId: this.user.id });
    try {
      importLog("importBooks:parseJsonFromFile");
      const importBooks = ImportBooks.init(await this.parseJsonFromFile());
      importLog("importBooks:parseJsonFromFile:done", {
        errorCount: this.errors.length,
        bookCount: importBooks.books?.length ?? 0,
      });
      if (this.errors.length) return;

      importLog("importBooks:validate");
      const results = await validate(importBooks, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      this.parseError(results);
      importLog("importBooks:validate:done", {
        errorCount: this.errors.length,
      });
      if (this.errors.length) return;

      if (this.tmpdir) {
        importLog("importBooks:uploadFiles:start");
        await this.uploadFiles(importBooks);
        importLog("importBooks:uploadFiles:done", {
          errorCount: this.errors.length,
        });
      }
      if (this.errors.length) return;

      importLog("importBooks:dbTransaction:start", {
        bookCount: importBooks.books.length,
      });
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
      importLog("importBooks:success", { bookCount: this.books.length });
    } catch (e) {
      console.error(e);
      importLog("importBooks:error", {
        message: e instanceof Error ? e.message : String(e),
      });
      this.errors.push(...(Array.isArray(e) ? e : [String(e)]));
    } finally {
      await this.cleanUp();
      importLog("importBooks:end", { errorCount: this.errors.length });
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
    {
      sections: _sections,
      publicBooks: _publicBooks,
      ...book
    }: BookProps & Pick<Book, "language">
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
        release: undefined,
      },
    };
  }

  async importTopic(topicId: Topic["id"]) {
    importLog("importTopic:start", { topicId, userId: this.user.id });
    try {
      importLog("importTopic:parseJsonFromFile");
      const importBooks = ImportBooks.init(await this.parseJsonFromFile());
      importLog("importTopic:parseJsonFromFile:done", {
        errorCount: this.errors.length,
      });
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
        importLog("importTopic:uploadFiles:start");
        await this.uploadFiles(importBooks);
        importLog("importTopic:uploadFiles:done", {
          errorCount: this.errors.length,
        });
      }
      if (this.errors.length) return;

      // トピックを上書きする
      importLog("importTopic:dbUpdate:start");
      const updateInput = await this.updateTopic(
        topicId,
        importTopics[0],
        orig
      );
      const created = await prisma.topic.update(updateInput);
      importLog("importTopic:dbUpdate:done", { created: Boolean(created) });
      if (!created) {
        this.errors.push("トピックの上書きに失敗しました。\n");
        return;
      }

      // ブックの timeRequired を調整する
      if (importTopics[0].timeRequired > 0) {
        await updateBookTimeRequired(topicId);
      }
      importLog("importTopic:success", { topicId });
    } catch (e) {
      console.error(e);
      importLog("importTopic:error", {
        message: e instanceof Error ? e.message : String(e),
      });
      this.errors.push(...(Array.isArray(e) ? e : [String(e)]));
    } finally {
      await this.cleanUp();
      importLog("importTopic:end", { topicId, errorCount: this.errors.length });
    }
  }

  async importBook(session: SessionSchema, bookId: Book["id"]) {
    importLog("importBook:start", { bookId, userId: this.user.id });
    try {
      importLog("importBook:parseJsonFromFile");
      const importBooks = ImportBooks.init(await this.parseJsonFromFile());
      importLog("importBook:parseJsonFromFile:done", {
        errorCount: this.errors.length,
        bookCount: importBooks.books?.length ?? 0,
      });
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
        importLog("importBook:uploadFiles:start", { topicCount: jobs.length });
        await this.uploadFiles(importBooks);
        importLog("importBook:uploadFiles:done", {
          errorCount: this.errors.length,
        });
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
      importLog("importBook:dbTransaction:start", {
        topicUpdateCount: topicInputArray.length,
      });
      const created = await prisma.$transaction([
        ...topicInputArray.map((topicInput) => prisma.topic.update(topicInput)),
        prisma.book.update(bookInput),
      ]);
      importLog("importBook:dbTransaction:done", {
        createdCount: Array.isArray(created) ? created.length : 0,
      });
      if (!created) {
        this.errors.push("ブックの上書きに失敗しました。\n");
        return;
      }

      // ブックの timeRequired を調整する
      if (timeRequiredTopicIds.length > 0) {
        await updateBookTimeRequired(timeRequiredTopicIds);
      }
      importLog("importBook:success", { bookId });
    } catch (e) {
      console.error(e);
      importLog("importBook:error", {
        message: e instanceof Error ? e.message : String(e),
      });
      this.errors.push(...(Array.isArray(e) ? e : [String(e)]));
    } finally {
      await this.cleanUp();
      importLog("importBook:end", { bookId, errorCount: this.errors.length });
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
      importLog("cleanUp:start", { tmpdir: this.tmpdir });
      await fs.promises.rm(this.tmpdir, { recursive: true });
      this.tmpdir = "";
      importLog("cleanUp:done");
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

  async extractZipEntry(
    entry: Entry,
    readStream: Readable,
    filename: string,
    dirname: string,
    readNextEntry: () => void
  ) {
    try {
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }
      importLog("parseJsonFromFile:entryExtract:start", {
        fileName: entry.fileName,
        uncompressedSize: entry.uncompressedSize,
      });
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const data = await Promise.race([
        readZipEntryStream(readStream, entry.uncompressedSize),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            readStream.destroy();
            reject(
              new Error(`zip解凍がタイムアウトしました: ${entry.fileName}`)
            );
          }, ZIP_ENTRY_EXTRACT_TIMEOUT_MS);
        }),
      ]).finally(() => {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      });
      await fs.promises.writeFile(filename, data);
      importLog("parseJsonFromFile:entryExtract:done", {
        fileName: entry.fileName,
        bytesWritten: data.length,
      });
    } catch (err) {
      this.errors.push(`zip解凍中に例外が発生しました。\n${err}`);
      readStream.destroy();
    } finally {
      readNextEntry();
    }
  }

  parseJsonFromFile() {
    if (!this.params.file) {
      this.errors.push(`ファイルをアップロードしてください。`);
      return {};
    }

    this.tmpdir = fs.mkdtempSync("/tmp/chibichilo-import-");
    const file = `${this.tmpdir}/file`;
    const fileBuffer = Buffer.from(this.params.file as string, "base64");
    fs.writeFileSync(file, fileBuffer);
    importLog("parseJsonFromFile:start", {
      tmpdir: this.tmpdir,
      fileBytes: fileBuffer.length,
    });

    return new Promise((resolve) => {
      let entryCount = 0;
      let resolved = false;
      const finish = (step: string, value: unknown) => {
        if (resolved) {
          importLog("parseJsonFromFile:resolve:duplicate", { step });
          return;
        }
        resolved = true;
        importLog("parseJsonFromFile:resolve", {
          step,
          entryCount,
          errorCount: this.errors.length,
        });
        resolve(value);
      };

      const options = {
        lazyEntries: true,
      };
      yauzl.open(file, options, (err, zipfile) => {
        if (err) {
          importLog("parseJsonFromFile:yauzlOpen:error", {
            message: String(err),
          });
          try {
            finish("notZip", JSON.parse(fs.readFileSync(file).toString()));
          } catch (e) {
            this.errors.push(`ファイルがzipではありません。\n${err}`);
            finish("notZipFailed", {});
          }
          return;
        }
        importLog("parseJsonFromFile:yauzlOpen:ok");
        zipfile
          .on("entry", (entry) => {
            entryCount += 1;
            importLog("parseJsonFromFile:entry", { fileName: entry.fileName });
            const readNextEntry = () => zipfile.readEntry();
            // ディレクトリは fileName が '/' で終わっている
            if (/\/$/.test(entry.fileName)) {
              readNextEntry();
            } else {
              const filename = path.join(this.tmpdir, entry.fileName);
              const dirname = path.dirname(filename);
              zipfile.openReadStream(entry, async (err, readStream) => {
                if (err) {
                  this.errors.push(
                    `openReadStreamでエラーが発生しました。\n${err}`
                  );
                  readNextEntry();
                  return;
                }
                await this.extractZipEntry(
                  entry,
                  readStream,
                  filename,
                  dirname,
                  readNextEntry
                );
              });
            }
          })
          .on("close", () => {
            importLog("parseJsonFromFile:zipClose", { entryCount });
            this.unzippedFiles = recursive(this.tmpdir);
            const jsonfiles: string[] = this.unzippedFiles.filter((filename) =>
              filename.toLowerCase().endsWith(".json")
            );
            importLog("parseJsonFromFile:unzipped", {
              fileCount: this.unzippedFiles.length,
              jsonFileCount: jsonfiles.length,
            });
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
              finish("zipCloseWithErrors", {});
            } else {
              finish("zipClose", jsons);
            }
          })
          .on("error", (error) => {
            importLog("parseJsonFromFile:zipError", {
              message: String(error),
            });
            try {
              finish(
                "zipErrorFallback",
                JSON.parse(fs.readFileSync(file).toString())
              );
            } catch (e) {
              this.errors.push(`ファイルがzipではありません。\n${error}`);
              finish("zipErrorFailed", {});
            }
          });
        zipfile.readEntry();
      });
    });
  }

  async uploadFiles(importBooks: ImportBooks) {
    const uploadEnabled =
      this.params.provider == "https://www.wowza.com/" &&
      validateWowzaSettings(false);
    importLog("uploadFiles:start", { uploadEnabled });
    const now = new Date();
    const filenames = [];
    let wowzaUpload;

    try {
      importLog("uploadFiles:startWowzaUpload");
      wowzaUpload = await startWowzaUpload(
        this.user.ltiConsumerId,
        this.user.id
      );
      importLog("uploadFiles:startWowzaUpload:done");
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
      if (!filenames.length) {
        importLog("uploadFiles:skipped", { reason: "no video files" });
        return;
      }
      importLog("uploadFiles:wowzaUpload", {
        fileCount: filenames.length,
        filenames,
      });
      await wowzaUpload.upload();
      importLog("uploadFiles:wowzaUpload:done");
    } catch (e) {
      importLog("uploadFiles:error", {
        message: e instanceof Error ? e.message : String(e),
      });
      this.errors.push(`サーバーにアップロードできませんでした。\n${e}`);
    } finally {
      if (wowzaUpload) {
        importLog("uploadFiles:wowzaCleanUp");
        await wowzaUpload.cleanUp();
        importLog("uploadFiles:wowzaCleanUp:done");
      }
      importLog("uploadFiles:end", { errorCount: this.errors.length });
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
