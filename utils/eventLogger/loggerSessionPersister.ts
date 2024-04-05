import { useEffect } from "react";
import type { SessionSchema } from "$server/models/session";
import { isInstructor } from "$utils/session";

const key = "loggerSessionPersister";

export function load() {
  if (typeof window === "undefined") return;
  const item = sessionStorage.getItem(key);
  if (item == null) return;
  try {
    return JSON.parse(item) as SessionSchema;
  } catch {
    return;
  }
}

function save(session: SessionSchema) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(session));
}

function clear() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
}

/**
 * 初回処理。
 * それぞれ学習者のセッションを
 * ウィンドウごとに区別する目的でsessionStorageに永続化し
 * あとでlogger.tsで使う。
 * もし教員や管理者ならば永続化せず空にする。
 */
export function useLoggerSessionInit(session: SessionSchema | undefined) {
  useEffect(() => {
    if (!session) return;
    if (isInstructor(session)) clear();
    else save(session);
  }, [session]);
}
