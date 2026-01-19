import useSWR, { mutate } from "swr";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import { api } from "./api";
import type { MetainfoProps } from "$server/models/metainfo";

const key = "/api/v2/topic/{topic_id}";

async function fetchTopic({
  topicId,
}: {
  key: typeof key;
  topicId: TopicSchema["id"];
}) {
  const res = await api.apiV2TopicTopicIdGet({ topicId });
  return res as TopicSchema;
}

export function useTopic(id: TopicSchema["id"]) {
  const { data } = useSWR<TopicSchema>({ key, topicId: id }, fetchTopic);
  return data;
}

export function useTopics(ids: TopicSchema["id"][] = []) {
  const { data } = useSWR<TopicSchema[]>({ key, topicIds: ids }, async () => {
    const topics = await Promise.all(
      ids.map((id) => fetchTopic({ key, topicId: id }))
    );
    return topics;
  });
  return data;
}

export async function createTopic(body: TopicProps): Promise<TopicSchema> {
  // @ts-expect-error Type 'null' is not assignable to type 'number | undefined'
  const res = (await api.apiV2TopicPost({ body })) as TopicSchema;
  await revalidateTopic(res.id, res);
  return res;
}

export async function updateTopic({
  id,
  ...body
}: TopicProps & { id: TopicSchema["id"] }): Promise<TopicSchema> {
  const res = (await api.apiV2TopicTopicIdPut({
    topicId: id,
    // @ts-expect-error Type 'null' is not assignable to type 'number | undefined'
    body,
  })) as TopicSchema;
  await revalidateTopic(res.id, res);
  return res;
}

export async function destroyTopic(id: TopicSchema["id"]) {
  await api.apiV2TopicTopicIdDelete({ topicId: id });
}

export function revalidateTopic(
  id: TopicSchema["id"],
  res?: TopicSchema
): Promise<TopicSchema | void> {
  return mutate({ key, topicId: id }, res);
}

export async function updateMetainfoTopic(
  id: TopicSchema["id"],
  body: MetainfoProps
): Promise<MetainfoProps> {
  const res = await api.apiV2TopicTopicIdMetainfoPut({ topicId: id, body });
  return res as MetainfoProps;
}
