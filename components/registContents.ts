import useSWR, { mutate } from "swr";
import { useSnackbar } from "material-ui-snackbar-provider";
import { postFormFetchText } from "./api";
import { mutateSession } from "./session";

const basePath = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "";
const registContentsPath = `${basePath}/call/content_regist.php`;

type LinkedContentsResponse = {
  id: number;
  name: string;
};

export async function registContents(id: ContentsSchema["id"], name: string) {
  await mutate(registContentsPath, async () => {
    const data = await postFormFetchText(registContentsPath, {
      content_id: id,
    });
    if (data !== "new" && data !== "update") throw new Error(data);
    const res: LinkedContentsResponse = { id, name };
    return res;
  });
  await mutateSession((prev: Session) => ({
    ...prev,
    contents: id,
  }));
}

export function useShowRegistContents() {
  const { showMessage } = useSnackbar();
  const { data, error } = useSWR<LinkedContentsResponse>(registContentsPath);

  if (error) {
    console.error(error);
    showMessage("問題が発生しました");
  } else if (data) {
    showMessage(`「${data.name}」を紐づけました`);
    mutate(registContentsPath, () => null);
  }

  return { data, error };
}
