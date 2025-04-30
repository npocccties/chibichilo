import type { ReleaseItemSchema } from "$server/models/releaseResult";
import useTreeItemStyle from "$styles/treeItem";
import TreeItem from "$atoms/TreeItem";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateTimeString";
import EditButton from "$atoms/EditButton";
import useCardStyles from "$styles/card";
import TreeView from "@mui/lab/TreeView";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";

type Props = {
  id: BookSchema["id"] | TopicSchema["id"];
  releases: Array<ReleaseItemSchema>;
  onItemEditClick?(index: number): void;
};

type ReleaseItemProps = {
  item: ReleaseItemSchema;
  category: string;
  index: number;
  onItemEditClick?(index: number): void;
};

function ReleaseItem({
  item,
  category,
  index,
  onItemEditClick,
}: ReleaseItemProps) {
  const treeItemClasses = useTreeItemStyle();
  return (
    <>
      <TreeItem
        classes={treeItemClasses}
        nodeId={index.toString()}
        key={index}
        label={
          <>
            {category}
            {item.name}
            <EditButton
              variant="book"
              onClick={(event) => {
                event.stopPropagation();
                onItemEditClick && onItemEditClick(index);
              }}
            />
            <Box
              style={{
                display: "flex",
                alignItems: "left",
                flexWrap: "wrap",
                lineHeight: 2.5,
              }}
            >
              {item.release?.version && (
                <DescriptionList
                  nowrap
                  sx={{ mx: 2 }}
                  value={[
                    {
                      key: "バージョン",
                      value: item.release?.version || "",
                    },
                  ]}
                />
              )}
              {item.release?.releasedAt && (
                <DescriptionList
                  nowrap
                  sx={{ mx: 2 }}
                  value={[
                    {
                      key: "リリース日",
                      value: getLocaleDateString(item.release.releasedAt, "ja"),
                    },
                  ]}
                />
              )}
            </Box>
          </>
        }
      ></TreeItem>
    </>
  );
}

type CategorizedItems = {
  self?: ReleaseItemSchema;
  editing?: ReleaseItemSchema;
  branch?: Array<ReleaseItemSchema>;
  from?: ReleaseItemSchema;
  to?: Array<ReleaseItemSchema>;
};

function compareReleasedAt(a: ReleaseItemSchema, b: ReleaseItemSchema) {
  const ad = a.release?.releasedAt;
  const bd = b.release?.releasedAt;
  if (!ad || !bd) return 0;
  return bd.getTime() - ad.getTime();
}

function sameId(a: string | undefined, b: string | undefined) {
  return a && a === b;
}

function categorizeReleases(props: Props): CategorizedItems {
  const { id, releases } = props;
  const self = releases.filter((release) => release.id === id)[0];
  const editing = releases.filter((release) => !release.release)[0];
  const branch = releases
    .filter((release) => sameId(self?.oid, release.oid) && release.release)
    .sort(compareReleasedAt);
  let from;
  if (branch.length > 0) {
    const oldest = branch.slice(-1)[0];
    const oldestPid = oldest.spid ?? oldest.pid;
    if (oldestPid) {
      from = releases.filter((release) => sameId(release.vid, oldestPid))[0];
    }
  }
  const to = releases
    .filter((release) => {
      if (release.oid === self?.oid) return false;
      const pid = release.spid ?? release.pid;
      return branch.some((b) => sameId(b.vid, pid));
    })
    .sort(compareReleasedAt);
  return { self, editing, branch, from, to };
}

function createList(items: CategorizedItems) {
  const list: ReleaseItemSchema[] = [];
  const categories: string[] = [];

  if (items.editing) {
    list.push(items.editing);
    categories.push("編集中　");
  }
  if (items.branch) {
    for (const item of items.branch) {
      list.push(item);
      categories.push("　　　　");
    }
  }
  if (items.from) {
    list.push(items.from);
    categories.push("複製元　");
  }
  if (items.to) {
    for (const item of items.to) {
      list.push(item);
      categories.push("複製先　");
    }
  }

  return { list, categories };
}

export default function ReleaseItemList(props: Props) {
  const { releases, onItemEditClick } = props;
  const cardClasses = useCardStyles();
  const items = categorizeReleases(props);
  const { list, categories } = createList(items);
  const handleItemEditClick = async (index: number) => {
    if (!onItemEditClick) return;
    const id = list?.[index]?.id;
    if (!id) return;
    index = releases.findIndex((release) => release.id === id);
    if (index >= 0) onItemEditClick(index);
  };
  return (
    <Card classes={cardClasses}>
      <TreeView>
        {list.map((item, index) => (
          <ReleaseItem
            key={index}
            item={item}
            category={categories[index]}
            index={index}
            onItemEditClick={handleItemEditClick}
          />
        ))}
      </TreeView>
    </Card>
  );
}
