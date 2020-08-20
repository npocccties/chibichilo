import { useSession, SessionResponse } from "./api";

const lmsUrl = process.env.NEXT_PUBLIC_LMS_URL || "";

export function useLmsSession(): SessionResponse | undefined {
  // TODO: for development
  if (process.env.NODE_ENV === "development")
    return { id: "user5", role: "instructor", lmsResource: "", lmsCourse: "" };

  const { data, error } = useSession();
  if (error) {
    redirectToLms();
    return;
  }
  return data;
}

export function useLmsInstructor(): SessionResponse | undefined {
  const session = useLmsSession();
  if (session && !isLmsInstructor(session)) {
    redirectToLms();
    return;
  }
  return session;
}

export function redirectToLms() {
  if (typeof window !== "undefined") document.location.href = lmsUrl;
}

export function isLmsInstructor(session?: SessionResponse): boolean {
  if (!session) return false;
  return ["instructor", "administrator"].includes(session.role);
}

const sessionStorageKey = "session";

export function saveSessionInStorage(
  session: SessionResponse & { nonce?: string }
) {
  if (process.env.NODE_ENV === "development") return;
  if (typeof window === "undefined") return;
  sessionStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

export function loadSessionInStorage():
  | undefined
  | (SessionResponse & { nonce?: string }) {
  if (process.env.NODE_ENV === "development") return;
  if (typeof window === "undefined") return;
  const res = sessionStorage.getItem(sessionStorageKey);
  if (res == null) return;
  try {
    return JSON.parse(res);
  } catch {
    return;
  }
}
