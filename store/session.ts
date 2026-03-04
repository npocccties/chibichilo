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

type LtiContextState = {
  ltiConsumerId: LtiContextSchema["consumerId"] | null | undefined;
  ltiContextId: LtiContextSchema["id"] | null | undefined;
};

const storage = createJSONStorage<LtiContextState>(() => {
  if (typeof window !== "undefined") {
    return sessionStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
});

export const ltiContextAtom = atomWithStorage<LtiContextState>(
  "ltiContext",
  {
    ltiConsumerId: undefined,
    ltiContextId: undefined,
  },
  storage
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
    },
  ],
  void
>(null, (get, set, update) => {
  const current = get(ltiContextAtom);
  set(ltiContextAtom, {
    ltiConsumerId: current?.ltiConsumerId ?? null,
    ltiContextId: current?.ltiContextId ?? null,
    ...update,
  });
});

export function useLtiContextAtom() {
  const context = useAtomValue(ltiContextAtom);
  const isLtiContextReady = useAtomValue(isLtiContextReadyAtom);
  return {
    ...context,
    isLtiContextReady,
  };
}

export function useUpdateLtiContextAtom() {
  return [
    useAtomValue(ltiContextAtom),
    useSetAtom(updateLtiContextAtom),
  ] as const;
}
