import fs from "fs";
import path from "path";
import format from "date-fns/format";
import utcToZoneTime from "date-fns-tz/utcToZonedTime";
import { NodeSSH } from "node-ssh";

import {
  WOWZA_SCP_HOST,
  WOWZA_SCP_PORT,
  WOWZA_SCP_USERNAME,
  WOWZA_SCP_PRIVATE_KEY,
  WOWZA_SCP_PRIVATE_KEY_PATH,
  WOWZA_SCP_PASS_PHRASE,
  WOWZA_SCP_SERVER_PATH,
} from "$server/utils/env";

export async function startWowzaUpload(ltiConsumerId: string, userId: number) {
  const uploadroot = await fs.promises.mkdtemp("/tmp/wowza-upload-");
  // recursive:true が利かない https://github.com/nodejs/node/issues/27293
  const uploaddomain = await fs.promises.mkdir(
    path.join(uploadroot, ltiConsumerId),
    { recursive: true }
  );
  if (!uploaddomain) throw new Error("一時フォルダを作成できませんでした。");
  const uploaddir = await fs.promises.mkdir(
    path.join(uploaddomain, String(userId)),
    { recursive: true }
  );
  if (!uploaddir) throw new Error("一時フォルダを作成できませんでした。");
  return new WowzaUpload(uploadroot, uploaddir);
}

export class WowzaUpload {
  uploadroot: string;
  uploaddir: string;
  pathcache: { [index: string]: string };

  constructor(uploadroot: string, uploaddir: string) {
    this.uploadroot = uploadroot;
    this.uploaddir = uploaddir;
    this.pathcache = {};
  }

  async cleanUp() {
    await fs.promises.rm(this.uploadroot, { recursive: true });
  }

  async moveFileToUpload(fullpath: string, date: Date) {
    const uploadpath = await this.mkdirUploadpath(date);
    const filename = path.basename(fullpath);
    const movedpath = path.join(uploadpath, filename);
    await fs.promises.rename(fullpath, movedpath);
    return movedpath.substring(this.uploadroot.length);
  }

  async mkdirUploadpath(date: Date) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const uploadpath = path.join(
      this.uploaddir,
      format(utcToZoneTime(date, timezone), "yyyyMMdd-HHmm-")
    );
    if (!(uploadpath in this.pathcache)) {
      this.pathcache[uploadpath] = await fs.promises.mkdtemp(uploadpath);
    }
    return this.pathcache[uploadpath];
  }

  async upload() {
    const client = new NodeSSH();
    try {
      await client.connect({
        host: WOWZA_SCP_HOST,
        port: WOWZA_SCP_PORT,
        username: WOWZA_SCP_USERNAME,
        ...(WOWZA_SCP_PRIVATE_KEY
          ? { privateKey: WOWZA_SCP_PRIVATE_KEY }
          : { privateKeyPath: WOWZA_SCP_PRIVATE_KEY_PATH }),
        passphrase: WOWZA_SCP_PASS_PHRASE,
      });
      let scpError;
      await client.putDirectory(this.uploadroot, WOWZA_SCP_SERVER_PATH, {
        tick: (localPath, remotePath, error) => {
          if (error) scpError = error;
        },
      });
      if (scpError) throw scpError;
    } finally {
      if (client.isConnected()) client.dispose();
    }
  }
}
