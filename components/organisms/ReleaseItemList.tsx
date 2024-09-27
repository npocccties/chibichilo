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

type Props = {
  releases: Array<ReleaseItemSchema>;
  onItemEditClick?(index: number): void;
};

type ReleaseItemProps = {
  item: ReleaseItemSchema;
  index: number;
  onItemEditClick?(index: number): void;
};

function ReleaseItem({ item, index, onItemEditClick }: ReleaseItemProps) {
  const treeItemClasses = useTreeItemStyle();
  return (
    <>
      <TreeItem
        classes={treeItemClasses}
        nodeId={index.toString()}
        key={index}
        label={
          <>
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

export default function ReleaseItemList(props: Props) {
  const { releases, onItemEditClick } = props;
  const cardClasses = useCardStyles();

  return (
    <Card classes={cardClasses}>
      <TreeView>
        {releases.map((item, index) => (
          // eslint-disable-next-line react/jsx-key
          <ReleaseItem
            item={item}
            index={index}
            onItemEditClick={onItemEditClick}
          />
        ))}
      </TreeView>
    </Card>
  );
}
