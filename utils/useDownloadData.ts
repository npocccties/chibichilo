import useContext from "$utils/courses/useContext";
import useActivityByConsumer from "$utils/useActivityByConsumer";

function useDownloadData() {
  const contexts = useContext();
  const ltiConsumerIds = contexts.flatMap(({ consumerId }) => consumerId ?? "");
  const ltiContextIds = contexts.flatMap(({ id }) => id ?? "");

  // ltiConsumerId/ltiContextId毎に分割して取得
  const { data, error } = useActivityByConsumer(
    undefined,
    ltiConsumerIds,
    ltiContextIds
  );

  return { data, error };
}

export default useDownloadData;
