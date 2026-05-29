import fs from "fs";
import path from "path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Buffer } from "buffer";
import { buffer } from "node:stream/consumers";
import { Transform } from "node:stream";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
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
const ZIP_STREAM_HEARTBEAT_MS = 2_000;

const execFileAsync = promisify(execFile);

type ZipEntryByteLimitState = {
  written: number;
  draining: boolean;
};

function createZipEntryByteLimitTransform(maxBytes: number): {
  stream: Transform;
  state: ZipEntryByteLimitState;
} {
  const state: ZipEntryByteLimitState = { written: 0, draining: false };

  const stream = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      if (state.draining) {
        callback();
        return;
      }
      const remaining = maxBytes - state.written;
      if (chunk.length <= remaining) {
        state.written += chunk.length;
        callback(null, chunk);
        if (state.written >= maxBytes) {
          state.draining = true;
        }
        return;
      }
      state.written = maxBytes;
      state.draining = true;
      callback(null, chunk.subarray(0, remaining));
    },
  });

  return { stream, state };
}

type ImportFileParseContext = {
  errors: string[];
  tmpdir: string;
  unzippedFiles: string[];
  params: BooksImportParams;
};

async function tryExtractZipWithSystemUnzip(
  zipPath: string,
  destDir: string
): Promise<boolean> {
  try {
    const startedAtMs = getPerfNowMs();
    await execFileAsync("unzip", ["-qq", "-o", zipPath, "-d", destDir]);
    importLog("parseJsonFromFile:systemUnzip:done", {
      elapsedMs: getPerfNowMs() - startedAtMs,
      ...getMemoryUsageMB(),
    });
    return true;
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as NodeJS.ErrnoException).code)
        : undefined;
    importLog("parseJsonFromFile:systemUnzip:skip", {
      message: err instanceof Error ? err.message : String(err),
      code,
    });
    return false;
  }
}

function getPerfNowMs(): number {
  return Number(process.hrtime.bigint() / 1_000_000n);
}

function bytesToMB(bytes: number): number {
  return Number((bytes / (1024 * 1024)).toFixed(2));
}

function safeThroughputMBps(bytes: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return Number((((bytes / 1024 / 1024) * 1000) / elapsedMs).toFixed(2));
}

function getMemoryUsageMB() {
  const m = process.memoryUsage();
  return {
    rssMB: bytesToMB(m.rss),
    heapUsedMB: bytesToMB(m.heapUsed),
    heapTotalMB: bytesToMB(m.heapTotal),
    externalMB: bytesToMB(m.external),
    arrayBuffersMB: bytesToMB(m.arrayBuffers),
  };
}

function getReadStreamDiagnostics(readStream: Readable) {
  return {
    readableFlowing: readStream.readableFlowing,
    readableLength: readStream.readableLength,
    readableEnded: readStream.readableEnded,
    destroyed: readStream.destroyed,
    readable: readStream.readable,
  };
}

async function writeZipEntryStream(
  readStream: Readable,
  filename: string,
  uncompressedSize: number,
  fileName?: string
): Promise<number> {
  if (uncompressedSize <= 0) {
    readStream.resume();
    const data = await buffer(readStream);
    await fs.promises.writeFile(filename, data);
    return data.length;
  }

  const startedAtMs = getPerfNowMs();
  let heartbeatCount = 0;
  const { stream: limiter, state: limiterState } =
    createZipEntryByteLimitTransform(uncompressedSize);
  const writeStream = fs.createWriteStream(filename);

  importLog("parseJsonFromFile:entryExtract:streamAttached", {
    fileName,
    expectedBytes: uncompressedSize,
    ...getReadStreamDiagnostics(readStream),
    ...getMemoryUsageMB(),
  });

  const heartbeatId = setInterval(() => {
    const elapsedMs = getPerfNowMs() - startedAtMs;
    heartbeatCount += 1;
    importLog("parseJsonFromFile:entryExtract:streamHeartbeat", {
      fileName,
      heartbeatCount,
      writtenBytes: limiterState.written,
      expectedBytes: uncompressedSize,
      draining: limiterState.draining,
      elapsedMs,
      ...getReadStreamDiagnostics(readStream),
      ...getMemoryUsageMB(),
    });
  }, ZIP_STREAM_HEARTBEAT_MS);

  try {
    await pipeline(readStream, limiter, writeStream);
    clearInterval(heartbeatId);
    const elapsedMs = getPerfNowMs() - startedAtMs;
    if (limiterState.written < uncompressedSize) {
      throw new Error(
        `zip解凍が不完全です (${limiterState.written}/${uncompressedSize} bytes)`
      );
    }
    importLog("parseJsonFromFile:entryExtract:streamDone", {
      fileName,
      reason: "pipelineComplete",
      writtenBytes: limiterState.written,
      expectedBytes: uncompressedSize,
      elapsedMs,
      throughputMBps: safeThroughputMBps(limiterState.written, elapsedMs),
      ...getReadStreamDiagnostics(readStream),
      ...getMemoryUsageMB(),
    });
    return limiterState.written;
  } catch (err) {
    clearInterval(heartbeatId);
    const elapsedMs = getPerfNowMs() - startedAtMs;
    importLog("parseJsonFromFile:entryExtract:streamError", {
      fileName,
      reason: "pipelineError",
      message: err instanceof Error ? err.message : String(err),
      writtenBytes: limiterState.written,
      expectedBytes: uncompressedSize,
      elapsedMs,
      ...getReadStreamDiagnostics(readStream),
      ...getMemoryUsageMB(),
    });
    throw err;
  }
}

function collectJsonFromUnzippedDir(
  ctx: ImportFileParseContext,
  parseStartedAtMs: number,
  step: string
) {
  ctx.unzippedFiles = recursive(ctx.tmpdir);
  const jsonfiles: string[] = ctx.unzippedFiles.filter((filename) =>
    filename.toLowerCase().endsWith(".json")
  );
  const totalUnzippedBytes = ctx.unzippedFiles.reduce((total, file) => {
    try {
      return total + fs.statSync(file).size;
    } catch {
      return total;
    }
  }, 0);
  importLog("parseJsonFromFile:unzipped", {
    step,
    fileCount: ctx.unzippedFiles.length,
    jsonFileCount: jsonfiles.length,
    totalUnzippedBytes,
    totalUnzippedMB: bytesToMB(totalUnzippedBytes),
    elapsedMs: getPerfNowMs() - parseStartedAtMs,
    ...getMemoryUsageMB(),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsons: any[] = [];
  if (jsonfiles.length) {
    for (const jsonfile of jsonfiles) {
      try {
        const json = JSON.parse(fs.readFileSync(jsonfile).toString());
        jsons.push(...(Array.isArray(json) ? json : [json]));
      } catch (e) {
        ctx.errors.push(`入力されたjsonテキストを解釈できません。\n${e}`);
      }
    }
  } else {
    ctx.errors.push("jsonファイルがありません。");
  }
  importLog("parseJsonFromFile:collected", {
    step,
    jsonFileCount: jsonfiles.length,
    errorCount: ctx.errors.length,
    elapsedMs: getPerfNowMs() - parseStartedAtMs,
    ...getMemoryUsageMB(),
  });
  if (ctx.errors.length) return {};
  return jsons;
}

async function extractZipEntry(
  ctx: ImportFileParseContext,
  entry: Entry,
  readStream: Readable,
  filename: string,
  dirname: string,
  readNextEntry: () => void
) {
  try {
    const extractStartedAtMs = getPerfNowMs();
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    importLog("parseJsonFromFile:entryExtract:start", {
      fileName: entry.fileName,
      uncompressedSize: entry.uncompressedSize,
      ...getMemoryUsageMB(),
    });
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const bytesWritten = await Promise.race([
      writeZipEntryStream(
        readStream,
        filename,
        entry.uncompressedSize,
        entry.fileName
      ),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          readStream.destroy();
          reject(new Error(`zip解凍がタイムアウトしました: ${entry.fileName}`));
        }, ZIP_ENTRY_EXTRACT_TIMEOUT_MS);
      }),
    ]).finally(() => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    });
    const elapsedMs = getPerfNowMs() - extractStartedAtMs;
    importLog("parseJsonFromFile:entryExtract:done", {
      fileName: entry.fileName,
      bytesWritten,
      elapsedMs,
      throughputMBps: safeThroughputMBps(bytesWritten, elapsedMs),
      ...getMemoryUsageMB(),
    });
  } catch (err) {
    ctx.errors.push(`zip解凍中に例外が発生しました。\n${err}`);
    importLog("parseJsonFromFile:entryExtract:error", {
      fileName: entry.fileName,
      message: err instanceof Error ? err.message : String(err),
      ...getMemoryUsageMB(),
    });
    readStream.destroy();
  } finally {
    importLog("parseJsonFromFile:readEntry:next", {
      fileName: entry.fileName,
      streamDestroyed: readStream.destroyed,
      streamReadableEnded: readStream.readableEnded,
    });
    readNextEntry();
  }
}

function parseJsonFromZipWithYauzl(
  ctx: ImportFileParseContext,
  file: string,
  parseStartedAtMs: number
) {
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
        errorCount: ctx.errors.length,
        elapsedMs: getPerfNowMs() - parseStartedAtMs,
        ...getMemoryUsageMB(),
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
          ctx.errors.push(`ファイルがzipではありません。\n${err}`);
          finish("notZipFailed", {});
        }
        return;
      }
      importLog("parseJsonFromFile:yauzlOpen:ok");
      zipfile
        .on("entry", (entry) => {
          entryCount += 1;
          importLog("parseJsonFromFile:entry", {
            fileName: entry.fileName,
            compressedSize: entry.compressedSize,
            uncompressedSize: entry.uncompressedSize,
            compressionMethod: entry.compressionMethod,
            elapsedMs: getPerfNowMs() - parseStartedAtMs,
          });
          const readNextEntry = () => {
            importLog("parseJsonFromFile:readEntry", {
              afterFileName: entry.fileName,
              entryCount,
              elapsedMs: getPerfNowMs() - parseStartedAtMs,
            });
            zipfile.readEntry();
          };
          // ディレクトリは fileName が '/' で終わっている
          if (/\/$/.test(entry.fileName)) {
            readNextEntry();
          } else {
            const filename = path.join(ctx.tmpdir, entry.fileName);
            const dirname = path.dirname(filename);
            zipfile.openReadStream(entry, async (err, readStream) => {
              if (err) {
                importLog("parseJsonFromFile:openReadStream:error", {
                  fileName: entry.fileName,
                  message: String(err),
                });
                ctx.errors.push(
                  `openReadStreamでエラーが発生しました。\n${err}`
                );
                readNextEntry();
                return;
              }
              importLog("parseJsonFromFile:openReadStream:ok", {
                fileName: entry.fileName,
                compressionMethod: entry.compressionMethod,
                compressedSize: entry.compressedSize,
                uncompressedSize: entry.uncompressedSize,
                ...getReadStreamDiagnostics(readStream),
              });
              await extractZipEntry(
                ctx,
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
          importLog("parseJsonFromFile:zipClose", {
            entryCount,
            elapsedMs: getPerfNowMs() - parseStartedAtMs,
            ...getMemoryUsageMB(),
          });
          const jsons = collectJsonFromUnzippedDir(
            ctx,
            parseStartedAtMs,
            "yauzlZipClose"
          );
          if (ctx.errors.length) {
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
            ctx.errors.push(`ファイルがzipではありません。\n${error}`);
            finish("zipErrorFailed", {});
          }
        });
      zipfile.readEntry();
    });
  });
}

async function parseImportJsonFromFile(ctx: ImportFileParseContext) {
  if (!ctx.params.file) {
    ctx.errors.push(`ファイルをアップロードしてください。`);
    return {};
  }

  ctx.tmpdir = fs.mkdtempSync("/tmp/chibichilo-import-");
  const file = `${ctx.tmpdir}/file`;
  const base64 = ctx.params.file as string;
  importLog("parseJsonFromFile:decodeBase64:start", {
    base64Chars: base64.length,
    base64MB: bytesToMB(base64.length),
    ...getMemoryUsageMB(),
  });
  const decodeStartedAtMs = getPerfNowMs();
  const fileBuffer = Buffer.from(base64, "base64");
  importLog("parseJsonFromFile:decodeBase64:done", {
    elapsedMs: getPerfNowMs() - decodeStartedAtMs,
    fileBytes: fileBuffer.length,
    fileMB: bytesToMB(fileBuffer.length),
    ...getMemoryUsageMB(),
  });
  const writeStartedAtMs = getPerfNowMs();
  fs.writeFileSync(file, fileBuffer);
  importLog("parseJsonFromFile:writeFile:done", {
    elapsedMs: getPerfNowMs() - writeStartedAtMs,
    fileBytes: fileBuffer.length,
    ...getMemoryUsageMB(),
  });
  ctx.params.file = undefined;
  const parseStartedAtMs = getPerfNowMs();
  importLog("parseJsonFromFile:start", {
    tmpdir: ctx.tmpdir,
    fileBytes: fileBuffer.length,
    fileMB: bytesToMB(fileBuffer.length),
    ...getMemoryUsageMB(),
  });

  if (await tryExtractZipWithSystemUnzip(file, ctx.tmpdir)) {
    const jsons = collectJsonFromUnzippedDir(
      ctx,
      parseStartedAtMs,
      "systemUnzip"
    );
    importLog("parseJsonFromFile:resolve", {
      step: "systemUnzip",
      errorCount: ctx.errors.length,
      elapsedMs: getPerfNowMs() - parseStartedAtMs,
      ...getMemoryUsageMB(),
    });
    return jsons;
  }

  return parseJsonFromZipWithYauzl(ctx, file, parseStartedAtMs);
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

  async parseJsonFromFile() {
    return parseImportJsonFromFile(this);
  }

  async uploadFiles(importBooks: ImportBooks) {
    const uploadEnabled =
      this.params.provider == "https://www.wowza.com/" &&
      validateWowzaSettings(false);
    const uploadStartedAtMs = getPerfNowMs();
    importLog("uploadFiles:start", {
      uploadEnabled,
      ...getMemoryUsageMB(),
    });
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
              const moveStartedAtMs = getPerfNowMs();
              const uploadpath = await wowzaUpload.moveFileToUpload(
                fullpath,
                now
              );
              const moveElapsedMs = getPerfNowMs() - moveStartedAtMs;
              let movedFileBytes = 0;
              try {
                movedFileBytes = fs.statSync(fullpath).size;
              } catch {
                // nop
              }
              importLog("uploadFiles:moveFileToUpload:done", {
                filename,
                moveElapsedMs,
                movedFileBytes,
                movedFileMB: bytesToMB(movedFileBytes),
                throughputMBps: safeThroughputMBps(
                  movedFileBytes,
                  moveElapsedMs
                ),
                ...getMemoryUsageMB(),
              });
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
      importLog("uploadFiles:wowzaUpload:done", {
        elapsedMs: getPerfNowMs() - uploadStartedAtMs,
        ...getMemoryUsageMB(),
      });
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
      importLog("uploadFiles:metrics", {
        elapsedMs: getPerfNowMs() - uploadStartedAtMs,
        movedFileCount: filenames.length,
        ...getMemoryUsageMB(),
      });
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
