import { useSession, SessionResponse } from "./api";

const lmsUrl = process.env.NEXT_PUBLIC_LMS_URL || "";

export function useLmsSession(): SessionResponse | undefined {
  // TODO: for development
  if (process.env.NODE_ENV === "development")
    return { id: "user5", role: "instructor" };

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
