export default { title: "atoms/Button" };

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

const iconSx = { mr: 0.5 };

export const Default = () => {
  return (
    <Box sx={{ "& > *": { mr: 2, mb: 2 } }}>
      <Button variant="contained" color="primary">
        送信
      </Button>
      <Button variant="outlined" color="primary">
        連携しない
      </Button>
      <Button size="small" color="primary">
        <AddIcon sx={iconSx} />
        ブックの作成
      </Button>
      <Button size="small" variant="contained" color="primary">
        <AddIcon sx={iconSx} />
        ブックの作成
      </Button>
      <Button size="small" variant="outlined" color="primary">
        <AddIcon sx={iconSx} />
        ブックの作成
      </Button>
      <Button size="small" color="primary">
        <LinkIcon sx={iconSx} />
        「〇〇」で提供
      </Button>
      <Button size="small" variant="contained" color="primary">
        <LinkIcon sx={iconSx} />
        「〇〇」で提供
      </Button>
      <Button size="small" variant="contained" color="primary">
        <DragIndicatorIcon fontSize="small" />
        並び替え
      </Button>
      <Button size="small" variant="outlined" color="primary">
        <DragIndicatorIcon fontSize="small" />
        並び替え
      </Button>
    </Box>
  );
};
