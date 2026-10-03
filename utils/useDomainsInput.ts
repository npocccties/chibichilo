import { useState } from "react";

function getDomainFromInput(newDomain: string) {
  const trimmed = newDomain.trim();
  try {
    const host = new URL(trimmed).host;
    return host ? host : trimmed;
  } catch {
    return trimmed;
  }
}

function useDomainsInput(initialDomains: string[] = []) {
  const [domains, setDomains] = useState(initialDomains);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("");
  const onInput = (value: string) => setValue(value);
  const onReset = () => {
    setValue("");
    setError(false);
    setHelperText("");
  };
  const onDomainSubmit = (newDomain: string) => {
    const trimmed = getDomainFromInput(newDomain);
    if (trimmed === "") {
      setError(true);
      setHelperText("1文字以上入力してください");
      return;
    } else if (domains.some((domain) => domain === trimmed)) {
      setHelperText("すでに追加されているドメインです");
      return;
    } else onReset();
    return setDomains([...domains, trimmed]);
  };
  return {
    domains,
    onDomainsUpdate: setDomains,
    onDomainSubmit,
    value,
    error,
    helperText,
    onReset,
    onInput,
  };
}

export default useDomainsInput;
