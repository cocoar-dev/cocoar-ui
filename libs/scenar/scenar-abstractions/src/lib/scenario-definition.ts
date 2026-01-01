/**
 * Core type definitions for Scenar scenarios
 */

/**
 * A scenario represents a specific UI state that can be rendered in isolation.
 */
export interface ScenarioDefinition<TComponent = any> {
  /**
   * Unique identifier for this scenario (e.g., 'button/primary', 'form/login')
   */
  id: string;

  /**
   * Human-readable title for display
   */
  title: string;

  /**
   * Lazy loader for the component class to render
   */
  component: () => Promise<{ new (...args: any[]): TComponent }>;

  /**
   * Optional default input values for the component
   */
  inputs?: Record<string, any>;

  /**
   * Optional description or documentation
   */
  description?: string;

  /**
   * Optional tags for categorization
   */
  tags?: string[];
}

/**
 * Helper type to extract input types from a component
 */
export type ScenarioInputs<T> = Record<string, any>;
