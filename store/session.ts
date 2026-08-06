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
export const OVERRIDE_LTI_CONTEXT_KEY = "overrideLtiContext";

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

export const baseLtiContextAtom = atomWithStorage<LtiContextState>(
  LTI_CONTEXT_KEY,
  {
    ltiConsumerId: undefined,
    ltiContextId: undefined,
    pathname: undefined,
  },
  ltiContextStorage
);

const overrideLtiContextStorage = createJSONStorage<LtiContextState | null>(
  () => {
    const s = getLtiContextSessionStorage();
    return (
      s ?? {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }
    );
  }
);

export const overrideLtiContextAtom = atomWithStorage<LtiContextState | null>(
  OVERRIDE_LTI_CONTEXT_KEY,
  null,
  overrideLtiContextStorage
);

export const ltiContextAtom = atom<LtiContextState>((get) => {
  const override = get(overrideLtiContextAtom);
  if (override && override.ltiContextId) {
    return override;
  }
  return get(baseLtiContextAtom);
});

export const isLtiContextReadyAtom = atom((get) => {
  const context = get(ltiContextAtom);
  return (
    context.ltiConsumerId !== undefined && context.ltiContextId !== undefined
  );
});

export const updateBaseLtiContextAtom = atom<null, [LtiContextState], void>(
  null,
  (_get, set, update) => {
    set(baseLtiContextAtom, update);
  }
);

export const updateOverrideLtiContextAtom = atom<
  null,
  [
    {
      ltiConsumerId?: LtiContextSchema["consumerId"] | null;
      ltiContextId?: LtiContextSchema["id"] | null;
      pathname?: string | null;
    } | null,
  ],
  void
>(null, (get, set, update) => {
  if (!update || update.ltiContextId === null) {
    set(overrideLtiContextAtom, null);
  } else {
    const current = get(overrideLtiContextAtom);
    set(overrideLtiContextAtom, {
      ltiConsumerId:
        update.ltiConsumerId !== undefined
          ? update.ltiConsumerId
          : current?.ltiConsumerId ?? null,
      ltiContextId:
        update.ltiContextId !== undefined
          ? update.ltiContextId
          : current?.ltiContextId ?? null,
      pathname:
        update.pathname !== undefined
          ? update.pathname
          : current?.pathname ?? null,
    });
  }
});

export function useLtiContextAtom() {
  const context = useAtomValue(ltiContextAtom);
  const isLtiContextReady = useAtomValue(isLtiContextReadyAtom);
  return { ...context, isLtiContextReady };
}

export function useUpdateLtiContextAtom() {
  return [
    useAtomValue(ltiContextAtom),
    useSetAtom(updateOverrideLtiContextAtom),
    useSetAtom(updateBaseLtiContextAtom),
    useAtomValue(baseLtiContextAtom),
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
  baseLtiContext: LtiContextState;
  session: SessionSchema | undefined;
  pathname: string;
  setBaseLtiContext: (value: LtiContextState) => void;
}

export function syncLtiContext({
  baseLtiContext,
  session,
  pathname,
  setBaseLtiContext,
}: SyncLtiContextParams) {
  if (!baseLtiContext.ltiContextId && session?.ltiContext?.id) {
    setBaseLtiContext({
      ltiConsumerId: session.oauthClient?.id ?? null,
      ltiContextId: session.ltiContext.id,
      pathname,
    });
  }
}
