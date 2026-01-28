/**
 * Type-safe helper for creating route data configuration.
 * Ensures TypeScript inference for route data objects.
 *
 * @param data - Route data object
 * @returns The same object with proper typing
 *
 * @example
 * ```typescript
 * const routeData = createRouteData({
 *   routedFragments: [...]
 * });
 * ```
 */
export function createRouteData<T>(data: T): T {
  return data;
}
