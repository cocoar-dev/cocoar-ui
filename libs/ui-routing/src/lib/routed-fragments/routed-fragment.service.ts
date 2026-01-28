import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject, defer, merge } from 'rxjs';

import { ParsedRoute, parseFragment } from './fragment-parser';
import { IRoutedFragmentConfig, RoutedFragmentBase, ROUTED_FRAGMENTS } from './routed-fragment';

/**
 * Service that monitors Angular Router fragments and parses them into structured routes.
 * Provides observables for reacting to fragment changes.
 *
 * Fragment configuration can be provided via:
 * 1. ROUTED_FRAGMENTS injection token (preferred for scenarios/tests)
 * 2. Route data with `routedFragments` property
 *
 * @example
 * ```typescript
 * // Via injection token:
 * providers: [
 *   RoutedFragmentService,
 *   { provide: ROUTED_FRAGMENTS, useValue: fragments }
 * ]
 *
 * // Via route data:
 * {
 *   path: 'page',
 *   component: MyComponent,
 *   data: { routedFragments: fragments }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class RoutedFragmentService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private injectedFragments = inject(ROUTED_FRAGMENTS, { optional: true });

  private parsedFragments = new BehaviorSubject<ParsedRoute[]>([]);

  /**
   * Get parsed fragments filtered by type.
   * Emits whenever the fragment changes via router navigation.
   *
   * @param type - Fragment type to filter by ('component' | 'action' | your custom type)
   * @returns Observable of parsed fragments matching the specified type
   */
  public getParsedFragments<T extends string>(type: T) {
    return this.parsedFragments.pipe(
      map((pf) =>
        pf.filter((p): p is ParsedRoute<RoutedFragmentBase & { type: T }> => p.route.type === type)
      )
    );
  }

  private getRoutedFragments = (routeSnapshot: ActivatedRouteSnapshot) => {
    // Prefer injected fragments (for scenarios/tests), fall back to route data
    if (this.injectedFragments && this.injectedFragments.length > 0) {
      return this.injectedFragments;
    }

    return (routeSnapshot.data as IRoutedFragmentConfig)?.routedFragments ?? [];
  };

  private getCurrentRoute = (route: ActivatedRoute): ActivatedRoute => {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  };

  constructor() {
    // Combine initial fragment state with navigation events
    // Using merge ensures both initial load and subsequent navigations are handled
    merge(
      // Emit current state immediately
      defer(() => {
        const snapshot = this.getCurrentRoute(this.activatedRoute).snapshot;
        return [{ fragment: snapshot.fragment, fragments: this.getRoutedFragments(snapshot) }];
      }),
      // Watch for navigation events
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => {
          const snapshot = this.getCurrentRoute(this.activatedRoute).snapshot;
          return { fragment: snapshot.fragment, fragments: this.getRoutedFragments(snapshot) };
        })
      )
    ).subscribe(({ fragment, fragments }) => {
      if (fragments && fragments.length > 0) {
        this.handleFragment(fragment ?? '', fragments);
      }
    });
  }

  private async handleFragment(fragment: string, routedFragments: RoutedFragmentBase[]) {
    const parsedRoutes = parseFragment(fragment, routedFragments);
    this.parsedFragments.next(parsedRoutes);
  }

  /**
   * Remove a specific fragment part from the current URL.
   * Useful for closing modals or clearing fragment state.
   *
   * @param part - Fragment path prefix to remove (e.g., 'details/123')
   *
   * @example
   * ```typescript
   * // URL: /page#details/123#confirm
   * fragmentService.removeFragmentPart('details/123');
   * // Result: /page#confirm
   * ```
   */
  public removeFragmentPart(part: string) {
    const fragment = this.router.url.split('#')[1] || ''; // Get current fragment
    const fragmentParts = fragment.split('#').map(fullyDecodeURIComponent); // Split multiple fragment parts

    // Filter out the fragment part that matches the provided path
    const updatedFragment = fragmentParts.filter((frag) => !frag.startsWith(part)).join('#');

    const route = this.getCurrentRoute(this.activatedRoute);

    // Use the router to navigate with the updated fragment
    this.router.navigate([], {
      relativeTo: route,
      queryParams: route.snapshot.queryParams, // Preserve the current query parameters
      fragment: updatedFragment || undefined, // If no fragment remains, set to undefined
      replaceUrl: false, // Do not replace the current URL in the history
    });
  }
}

function fullyDecodeURIComponent(input: string): string {
  let prev = '';
  let current = input;

  try {
    do {
      prev = current;
      current = decodeURIComponent(current);
    } while (current !== prev);
  } catch {
    // If decodeURIComponent fails (e.g., due to an incomplete %xx), abort
    return prev;
  }

  return current;
}
