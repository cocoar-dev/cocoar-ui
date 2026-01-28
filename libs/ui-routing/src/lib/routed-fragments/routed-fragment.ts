import { InjectionToken, Type } from '@angular/core';

/**
 * Base interface for all routed fragments.
 * Extend this interface to create custom fragment types in your application.
 *
 * @example
 * ```typescript
 * // In your app:
 * export interface DrawerRoutedFragment extends RoutedFragmentBase<DrawerConfig> {
 *   type: 'drawer';
 *   loadComponent: () => Type<unknown> | Promise<Type<unknown>>;
 * }
 * ```
 */
export interface RoutedFragmentBase<TOptions = unknown> {
  type: string;
  path: string | string[];
  options?: TOptions;
}

/**
 * Route configuration interface for fragment-based routing.
 * Add this to Angular route data to enable fragment parsing.
 */
export interface IRoutedFragmentConfig<TFragment extends RoutedFragmentBase = RoutedFragmentBase> {
  routedFragments: TFragment[];
}

/**
 * Injection token for providing routed fragments configuration.
 * Use this when you can't provide fragments via route data (e.g., in scenarios or tests).
 *
 * @example
 * ```typescript
 * providers: [
 *   { provide: ROUTED_FRAGMENTS, useValue: [...fragments] }
 * ]
 * ```
 */
export const ROUTED_FRAGMENTS = new InjectionToken<RoutedFragmentBase[]>('ROUTED_FRAGMENTS');

/**
 * Component fragment that loads a lazy-loaded component.
 * Generic TOptions allows consumers to provide their own configuration type
 * (e.g., modal options, drawer options, dialog options, etc.).
 *
 * @example
 * ```typescript
 * // For modals:
 * const fragment: ComponentRoutedFragment<MyModalConfig> = {
 *   type: 'component',
 *   path: 'details/:id',
 *   loadComponent: () => import('./details.component'),
 *   options: { width: '800px', closeOnBackdrop: true }
 * };
 *
 * // For drawers:
 * const fragment: ComponentRoutedFragment<MyDrawerConfig> = {
 *   type: 'component',
 *   path: 'settings',
 *   loadComponent: () => import('./settings.component'),
 *   options: { position: 'right', width: '400px' }
 * };
 * ```
 */
export interface ComponentRoutedFragment<TOptions = unknown> extends RoutedFragmentBase<TOptions> {
  type: 'component';
  loadComponent: () => Type<unknown> | Promise<Type<unknown>>;
}

/**
 * Action fragment that executes a custom handler.
 * Useful for triggering side effects without UI components.
 *
 * @example
 * ```typescript
 * const fragment: ActionRoutedFragment = {
 *   type: 'action',
 *   path: 'logout',
 *   handler: (params) => authService.logout()
 * };
 * ```
 */
export interface ActionRoutedFragment extends RoutedFragmentBase<never> {
  type: 'action';
  handler: (params: Record<string, unknown>) => void;
  options?: never; // Actions don't have options
}
