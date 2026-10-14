import { useCallback, useState } from "react";

/**
 * boolean 値をトグルする
 */
export default function useToggle(
  initialValue = false
): [boolean, (nextValue?: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback((nextValue?: boolean) => {
    setValue((current) =>
      typeof nextValue === "boolean" ? nextValue : !current
    );
  }, []);
  return [value, toggle];
}
