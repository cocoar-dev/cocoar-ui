import { match } from 'path-to-regexp';
import { RoutedFragmentBase } from './routed-fragment';

/**
 * Parsed fragment with extracted parameters and matched route.
 */
export interface ParsedRoute<T extends RoutedFragmentBase = RoutedFragmentBase> {
  params: Record<string, unknown>;
  route: T;
  fragment: string;
}

/**
 * Parses URL fragment into structured routes with parameters.
 * Supports multiple fragments separated by '#' and query parameters.
 *
 * @param fragment - Raw URL fragment (e.g., "details/123?edit=true#confirm")
 * @param registeredRoutes - Array of route configurations to match against
 * @returns Array of parsed routes with extracted parameters
 *
 * @example
 * ```typescript
 * const routes = [
 *   { type: 'component', path: 'details/:id', loadComponent: () => DetailsComponent }
 * ];
 * const parsed = parseFragment('details/123?edit=true', routes);
 * // Result: [{ params: { id: '123', edit: true }, route: {...}, fragment: 'details/123?edit=true' }]
 * ```
 */
export function parseFragment<T extends RoutedFragmentBase>(
  fragment: string,
  registeredRoutes: T[]
): ParsedRoute<T>[] {
  // Normalize routes: expand arrays into individual route entries
  const normalizedRoutes = registeredRoutes.flatMap((route) => {
    if (Array.isArray(route.path)) {
      // Expand array paths into separate route objects
      return route.path.map((p) => ({ ...route, path: p }));
    }
    return [route];
  });

  const routeGroups = fragment.split('#'); // Split on '#'

  return routeGroups
    .map((routeGroup) => {
      const [routePath, queryParamsString] = routeGroup.split('?'); // Separate query params
      const parsedParams: Record<string, unknown> = {};

      // Find the registered route that matches the full routePath
      const registeredRoute = normalizedRoutes.find((route) => {
        const matcher = match(route.path, { decode: decodeURIComponent });
        const matchResult = matcher(routePath);
        return !!matchResult; // Return true if the route matches the full routePath
      });

      if (registeredRoute) {
        const matcher = match(registeredRoute.path, { decode: decodeURIComponent });
        const matchResult = matcher(routePath);

        if (matchResult) {
          Object.assign(parsedParams, matchResult.params); // Extract route params (like id, customer)
        }

        // Handle optional query parameters
        if (queryParamsString) {
          const queryParams = new URLSearchParams(queryParamsString);
          queryParams.forEach((value, key) => {
            let parsedValue: unknown;

            // Try to parse as JSON (for booleans, numbers, etc.)
            try {
              parsedValue = JSON.parse(value);
            } catch {
              parsedValue = value; // Default to string if JSON parsing fails
            }

            parsedParams[key] = parsedValue;
          });
        }

        // Return the matched route and its parameters
        return { fragment: routeGroup, params: parsedParams, route: registeredRoute };
      }

      // Return null if no match is found (handled in filtering)
      return null;
    })
    .filter((route) => route !== null); // Filter out null results and return empty array if nothing matches
}
