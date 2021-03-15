import Tooltip from "@material-ui/core/Tooltip";
import PeopleIcon from "@material-ui/icons/People";
import { gray } from "$theme/colors";

type Props = {
  className?: string;
};

export default function SharedIndicator(props: Props) {
  const { className } = props;
  return (
    <Tooltip title="教員にシェアしています">
      <PeopleIcon
        className={className}
        fontSize="small"
        htmlColor={gray[700]}
      />
    </Tooltip>
  );
}
