import { atom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import type { TopicSchema } from "$server/models/topic";
import type { BookSchema } from "$server/models/book";
import type { SessionSchema } from "$server/models/session";
import {
  isAdministrator as isAdministratorSession,
  isInstructor as isInstructorSession,
} from "$utils/session";
import topicCreateBy from "$utils/topicCreateBy";
import bookCreateBy from "$utils/bookCreateBy";

type SessionWithState = {
  session: SessionSchema | undefined;
  isAdministrator: boolean;
  isInstructor: boolean;
  isTopicEditable(topic: Pick<TopicSchema, "creator">): boolean;
  isBookEditable(book: Pick<BookSchema, "author">): boolean;
  error: boolean;
};

const sessionAtom = atom<SessionWithState>({
  session: undefined,
  isAdministrator: false,
  isInstructor: false,
  isTopicEditable: () => false,
  isBookEditable: () => false,
  error: false,
});

const updateSessionAtom = atom<
  null,
  { session: SessionSchema | undefined; error: boolean }
>(null, (get, set, { session, error }) => {
  const isAdministrator = Boolean(session && isAdministratorSession(session));
  const isInstructor = Boolean(session && isInstructorSession(session));
  const sessionWithState = {
    session,
    isAdministrator,
    isInstructor,
    isTopicEditable(topic: Pick<TopicSchema, "creator">) {
      return isAdministrator || topicCreateBy(topic, session?.user);
    },
    isBookEditable(book: Pick<BookSchema, "author">) {
      return isAdministrator || bookCreateBy(book, session?.user);
    },
    error,
  };
  set(sessionAtom, { ...get(sessionAtom), ...sessionWithState });
});

export function useSessionAtom() {
  return useAtomValue(sessionAtom);
}

export function useUpdateSessionAtom() {
  return [useAtomValue(sessionAtom), useUpdateAtom(updateSessionAtom)] as const;
}

export function useLmsUrl() {
  const { session } = useSessionAtom();
  return session?.ltiLaunchBody.launch_presentation_return_url;
}
