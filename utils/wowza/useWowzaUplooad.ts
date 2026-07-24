import { useState } from "react";
import { useBeforeUnload } from "react-use";
import { NEXT_PUBLIC_API_BASE_PATH } from "$utils/env";

/**
 * Wowza Streaming Engine へのアップロードするためのエンドポイントからの応答
 * server/services/wowza/create.ts
 */
type WowzaUploadResponse = {
  /** アップロードされた動画URL */
  url: string;
};

/** 開発用サーバーか否か */
const isDev = process.env.NODE_ENV !== "production";

/** Wowza Streaming Engine へのアップロードするためのエンドポイントからの応答 */
const wowzaUploadEndpoint = `${NEXT_PUBLIC_API_BASE_PATH}/api/v2/wowza`;

async function wowzaUpload(file: File): Promise<WowzaUploadResponse | Error> {
  const formData = new FormData();
  formData.append("file", file);
  const res: WowzaUploadResponse | Error = await fetch(wowzaUploadEndpoint, {
    method: "POST",
    credentials: isDev ? "include" : "same-origin",
    body: formData,
  })
    .then((res) =>
      res.ok ? res.json() : new Error(`${res.status} ${res.statusText}`)
    )
    .catch((e) => e);
  return res;
}

/** Wowza Streaming Engine へのアップロード */
export function useWowzaUpload(): {
  data: undefined | WowzaUploadResponse | Error;
  uploadFile(file: File): Promise<undefined | WowzaUploadResponse | Error>;
} {
  const [data, setData] = useState<undefined | WowzaUploadResponse | Error>();
  useBeforeUnload(!data);

  /** ファイルのアップロード */
  async function uploadFile(file: File) {
    setData(undefined);
    const res = await wowzaUpload(file);
    setData(res);
    return res;
  }

  return { data, uploadFile };
}
