import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import gray from "theme/colors/gray";
import DomainChip from "$atoms/DomainChip";
import IconButton from "$atoms/IconButton";
import Input from "$atoms/Input";
import InputLabel from "$atoms/InputLabel";
import { remove } from "$utils/reorder";

const labelDescriptionSx: SxProps<Theme> = {
  ml: 0.75,
  color: gray[600],
};

const Domains = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
}));

type Props = {
  id?: string;
  domains: string[];
  value: string;
  error?: boolean;
  helperText?: React.ReactNode;
  onInput?(value: string): void;
  onReset?(): void;
  onDomainsUpdate(domains: string[]): void;
  onDomainSubmit(domain: string): void;
};

export default function DomainsInput({
  id,
  domains,
  value,
  error,
  helperText,
  onInput,
  onReset,
  onDomainsUpdate,
  onDomainSubmit,
}: Props) {
  const handleDomainRemove = (delDomain: string) => () => {
    const index = domains.findIndex((domain) => domain === delDomain);
    onDomainsUpdate(remove(domains, index));
  };
  const handleReset = () => onReset?.();
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) =>
    onInput?.(event.target.value);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // NOTE: このコンポーネントをform要素でラップしている場合にsubmitさせない目的
    if (event.key === "Enter") {
      event.preventDefault();
      handleDomainSubmit();
    }
  };
  const handleDomainSubmit = () => onDomainSubmit(value);
  return (
    <div>
      <InputLabel htmlFor={id} sx={{ mb: 1 }}>
        公開範囲
        <br />
        <Typography sx={labelDescriptionSx} variant="caption" component="span">
          * 指定しない場合は制限なしになります
        </Typography>
      </InputLabel>
      <Domains>
        {domains.map((domain) => (
          <DomainChip
            key={domain}
            domain={domain}
            sx={{ mr: 0.5 }}
            onDelete={handleDomainRemove(domain)}
          />
        ))}
      </Domains>
      <FormControl error={error}>
        <Input
          id={id}
          value={value}
          placeholder="example.com"
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          startAdornment={
            <InputAdornment position="start">
              <LabelOutlinedIcon />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={handleReset}
                color="secondary"
                tooltipProps={{ title: "入力をリセット" }}
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                onClick={handleDomainSubmit}
                color="primary"
                tooltipProps={{ title: "このドメインを追加" }}
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          }
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </div>
  );
}
