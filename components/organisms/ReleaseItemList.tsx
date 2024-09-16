import type { ReleaseItemSchema } from "$server/models/releaseResult";
import useTreeItemStyle from "$styles/treeItem";
import TreeItem from "$atoms/TreeItem";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateTimeString";
import EditButton from "$atoms/EditButton";
import useCardStyles from "$styles/card";

type Props = {
  releases: Array<ReleaseItemSchema>;
};

type ReleaseItemProps = {
  item: ReleaseItemSchema;
  index: number;
};

function ReleaseItem({ item, index }: ReleaseItemProps) {
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
  const { releases } = props;
  const cardClasses = useCardStyles();

  return (
    <Card classes={cardClasses}>
      <>
        {releases.map((item, index) => (
          // eslint-disable-next-line react/jsx-key
          <ReleaseItem item={item} index={index} />
        ))}
      </>
    </Card>
  );
}
