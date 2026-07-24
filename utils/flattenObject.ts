type Flattenable = Record<string, unknown>;

/**
 * ネストしたオブジェクトをドット記法のキーに平坦化する
 */
export function flattenObject(
  object: Flattenable,
  prefix = ""
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(object)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(result, flattenObject(value as Flattenable, path));
    } else {
      result[path] = value;
    }
  }

  return result;
}

export default flattenObject;
