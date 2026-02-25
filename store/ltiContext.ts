import { atomWithStorage, createJSONStorage } from "jotai/utils";

const storage = createJSONStorage<string | null>(() => {
  if (typeof window !== "undefined") {
    return sessionStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
});

export const ltiContextIdAtom = atomWithStorage<string | null>(
  "ltiContextId",
  null,
  storage
);
