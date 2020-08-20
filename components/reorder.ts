/**
 * @example
 * reorder([3, 7, 5], 0, 2) //=> [7, 5, 3]
 * const array = [1];
 * reorder(array, 0, 0) === array; //=> false
 */
export function reorder<T>(
  array: T[],
  from: number,
  to: number,
  count?: number
) {
  const res = Array.from(array);
  res.splice(to, 0, ...res.splice(from, count ?? 1));
  return res;
}
