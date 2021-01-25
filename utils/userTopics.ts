import useSWR from "swr";
import type { UserSchema } from "$server/models/user";
import type { UserTopicsSchema } from "$server/models/userTopics";
import { api } from "./api";

const key = "/api/v2/user/{user_id}/topics";

async function fetchUserTopics(_: typeof key, userId: UserSchema["id"]) {
  const res = await api.apiV2UserUserIdTopicsGet({ userId });
  return res as UserTopicsSchema;
}

export function useUserTopics(userId: UserSchema["id"]) {
  return useSWR<UserTopicsSchema>([key, userId], fetchUserTopics);
}
