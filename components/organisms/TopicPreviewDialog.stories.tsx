export default { title: "organisms/TopicPreviewDialog" };

import Button from "@material-ui/core/Button";
import type { TopicSchema } from "$server/models/topic";
import useDialogProps from "$utils/useDialogProps";
import TopicPreviewDialog from "./TopicPreviewDialog";
import { topic } from "$samples";

export const Default = () => {
  const { data, dispatch, ...dialogProps } = useDialogProps<TopicSchema>();
  const handleClick = () => dispatch(topic);
  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClick}>
        ダイアログ
      </Button>
      {data && <TopicPreviewDialog {...dialogProps} topic={data} />}
    </>
  );
};
