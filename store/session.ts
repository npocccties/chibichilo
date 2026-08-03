import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { SessionSchema } from "$server/models/session";
import type { LtiContextSchema } from "$server/models/ltiContext";
import type { ContentAuthors, IsContentEditable } from "$server/models/content";
import {
  isAdministrator as isAdministratorSession,
  isInstructor as isInstructorSession,
} from "$utils/session";
import contentBy from "$utils/contentBy";

type SessionWithState = {
  session: SessionSchema | undefined;
  isAdministrator: boolean;
  isInstructor: boolean;
  isContentEditable: IsContentEditable;
  error: boolean;
};

const sessionAtom = atom<SessionWithState>({
  session: undefined,
  isAdministrator: false,
  isInstructor: false,
  isContentEditable: () => false,
  error: false,
});

const updateSessionAtom = atom<
  null,
  [{ session: SessionSchema | undefined; error: boolean }],
  void
>(null, (get, set, { session, error }) => {
  const isAdministrator = Boolean(session && isAdministratorSession(session));
  const isInstructor = Boolean(session && isInstructorSession(session));
  const sessionWithState = {
    session,
    isAdministrator,
    isInstructor,
    isContentEditable(content: ContentAuthors) {
      return isAdministrator || contentBy(content, session?.user);
    },
    error,
  };
  set(sessionAtom, { ...get(sessionAtom), ...sessionWithState });
});

export function useSessionAtom() {
  return useAtomValue(sessionAtom);
}
export function useUpdateSessionAtom() {
  return [useAtomValue(sessionAtom), useSetAtom(updateSessionAtom)] as const;
}
export function useLmsUrl() {
  const { session } = useSessionAtom();
  return session?.ltiLaunchPresentation?.returnUrl;
}

export const LTI_CONTEXT_KEY = "ltiContext";

export type LtiContextState = {
  ltiConsumerId: LtiContextSchema["consumerId"] | null | undefined;
  ltiContextId: LtiContextSchema["id"] | null | undefined;
  pathname?: string | null | undefined;
};

const getLtiContextSessionStorage = () => {
  if (typeof window !== "undefined") return window.sessionStorage;
  return undefined;
};

const ltiContextStorage = createJSONStorage<LtiContextState>(() => {
  const s = getLtiContextSessionStorage();
  return (
    s ?? {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  );
});

export const ltiContextAtom = atomWithStorage<LtiContextState>(
  LTI_CONTEXT_KEY,
  {
    ltiConsumerId: undefined,
    ltiContextId: undefined,
    pathname: undefined,
  },
  ltiContextStorage
);

export const isLtiContextReadyAtom = atom((get) => {
  const context = get(ltiContextAtom);
  return (
    context.ltiConsumerId !== undefined && context.ltiContextId !== undefined
  );
});

export const updateLtiContextAtom = atom<
  null,
  [
    {
      ltiConsumerId?: LtiContextSchema["consumerId"] | null;
      ltiContextId?: LtiContextSchema["id"] | null;
      pathname?: string | null;
    },
  ],
  void
>(null, (get, set, update) => {
  const current = get(ltiContextAtom);
  set(ltiContextAtom, {
    ltiConsumerId: current?.ltiConsumerId ?? null,
    ltiContextId: current?.ltiContextId ?? null,
    pathname: current?.pathname ?? null,
    ...update,
  });
});

export function useLtiContextAtom() {
  const context = useAtomValue(ltiContextAtom);
  const isLtiContextReady = useAtomValue(isLtiContextReadyAtom);
  return { ...context, isLtiContextReady };
}

export function useUpdateLtiContextAtom() {
  return [
    useAtomValue(ltiContextAtom),
    useSetAtom(updateLtiContextAtom),
  ] as const;
}

export function loadLtiContext(
  storage?: Pick<Storage, "getItem">
): LtiContextState | undefined {
  const s = storage ?? getLtiContextSessionStorage();
  if (!s) return;

  const item = s.getItem(LTI_CONTEXT_KEY);
  if (!item) return;

  try {
    return JSON.parse(item) as LtiContextState;
  } catch {
    return;
  }
}

export type LtiContextQuery = {
  lti_consumer_id?: string;
  lti_context_id?: string;
};

interface SyncLtiContextParams {
  current: LtiContextState;
  query: LtiContextQuery;
  session: SessionSchema | undefined;
  pathname: string;
  setLtiContext: (value: LtiContextState) => void;
}

export function syncLtiContext({
  current,
  query,
  session,
  pathname,
  setLtiContext,
}: SyncLtiContextParams) {
  // 1. If lti_context_id is present in the URL query.
  if (query.lti_context_id) {
    setLtiContext({
      ltiConsumerId: query.lti_consumer_id ?? session?.oauthClient?.id ?? null,
      ltiContextId: query.lti_context_id,
      pathname,
    });
    return;
  }
  // 2. Do not overwrite if the context specific to the current tab is already preserved.
  if (current?.ltiContextId) {
    return;
  }
  // 3. Use the session only if there is no URL query and it is uninitialized.
  if (session?.ltiContext?.id) {
    setLtiContext({
      ltiConsumerId: session.oauthClient?.id ?? null,
      ltiContextId: session.ltiContext.id,
      pathname,
    });
  }
}
