/**
 * Interface to setup distinct results.
 *
 * Example use in a [[Query]]
 *
 * ```ts
 * // DISTINCT (name)
 * const query: Query<Item> = {
 *   distinct: [{ field: 'name' }],
 * }
 * ```
 *
 * To sort on multiple fields
 *
 * ```ts
 * // DISTINCT (name, age)
 * const query: Query<Item> = {
 *   sorting: [
 *     { field: 'name' },
 *     { field: 'age' },
 *   ],
 * }
 * ```
 *
 * @typeparam T - the type of object to query unique records.
 */
export interface DistinctField<T> {
  /**
   * A field in type T to get only distinct records.
   */
  field: keyof T;
}
// TODO: can we export a type and make this more simple?
// export type DistinctField<T> = keyof T;
