import { describe, it, expect } from 'vitest';
import { ParsedRoute, parseFragment } from './fragment-parser';
import { RoutedFragmentBase } from './routed-fragment';

import type { ComponentRoutedFragment, ActionRoutedFragment } from './routed-fragment';

// Mock route registration
const mockRegisteredRoutes: RoutedFragmentBase[] = [
  {
    type: 'component',
    path: 'details/:id/:customer',
    loadComponent: () => Promise.resolve(class TestComponent {}),
  } as ComponentRoutedFragment,
  {
    type: 'action',
    path: 'confirm',
    handler: (params: Record<string, unknown>) => console.log('confirm', params),
  } as ActionRoutedFragment,
  {
    type: 'component',
    path: ':id/:customer',
    loadComponent: () => Promise.resolve(class DefaultComponent {}),
  } as ComponentRoutedFragment,
];

describe('parseFragment', () => {
  it('should match route and extract required parameters', () => {
    const fragment = 'details/12a3/ABC';
    const parsedRoutes: ParsedRoute[] = parseFragment(fragment, mockRegisteredRoutes);

    expect(parsedRoutes).toHaveLength(1);
    expect(parsedRoutes[0].params).toEqual({
      id: '12a3',
      customer: 'ABC',
    });
    expect(parsedRoutes[0].route.type).toBe('component');
    expect(parsedRoutes[0].route.path).toBe('details/:id/:customer');
  });

  it('should handle optional query parameters', () => {
    const fragment = 'details/12a3/ABC?optional=123&otherOptional=false';
    const parsedRoutes: ParsedRoute[] = parseFragment(fragment, mockRegisteredRoutes);

    expect(parsedRoutes).toHaveLength(1);
    expect(parsedRoutes[0].params).toEqual({
      id: '12a3',
      customer: 'ABC',
      optional: 123,
      otherOptional: false,
    });
  });

  it('should match route without parameters', () => {
    const fragment = 'confirm';
    const parsedRoutes: ParsedRoute[] = parseFragment(fragment, mockRegisteredRoutes);

    expect(parsedRoutes).toHaveLength(1);
    expect(parsedRoutes[0].params).toEqual({});
    expect(parsedRoutes[0].route.path).toBe('confirm');
  });

  it('should match fallback route with dynamic parameters', () => {
    const fragment = '5678/JohnDoe';
    const parsedRoutes: ParsedRoute[] = parseFragment(fragment, mockRegisteredRoutes);

    expect(parsedRoutes).toHaveLength(1);
    expect(parsedRoutes[0].params).toEqual({
      id: '5678',
      customer: 'JohnDoe',
    });
    expect(parsedRoutes[0].route.path).toBe(':id/:customer');
    expect(parsedRoutes[0].route.type).toBe('component');
  });

  it('should handle multiple routes in the fragment', () => {
    const fragment = 'details/12a3/ABC?optional=123&otherOptional=false#confirm?force=true';
    const parsedRoutes: ParsedRoute[] = parseFragment(fragment, mockRegisteredRoutes);

    expect(parsedRoutes).toHaveLength(2);

    expect(parsedRoutes[0].params).toEqual({
      id: '12a3',
      customer: 'ABC',
      optional: 123,
      otherOptional: false,
    });
    expect(parsedRoutes[0].route.path).toBe('details/:id/:customer');

    expect(parsedRoutes[1].params).toEqual({
      force: true,
    });
    expect(parsedRoutes[1].route.path).toBe('confirm');
  });

  it('should return empty array if no registered route matches', () => {
    const fragment = 'unknownRoute';
    const parsedRoutes: ParsedRoute[] = parseFragment(fragment, mockRegisteredRoutes);

    expect(parsedRoutes).toEqual([]);
  });

  it('should preserve fragment in parsed result', () => {
    const fragment = 'details/123/ABC';
    const parsedRoutes: ParsedRoute[] = parseFragment(fragment, mockRegisteredRoutes);

    expect(parsedRoutes[0].fragment).toBe(fragment);
  });

  it('should parse query params as correct types', () => {
    const fragment = 'confirm?string=hello&number=42&bool=true&nullValue=null';
    const parsedRoutes: ParsedRoute[] = parseFragment(fragment, mockRegisteredRoutes);

    expect(parsedRoutes[0].params).toEqual({
      string: 'hello',
      number: 42,
      bool: true,
      nullValue: null,
    });
  });

  it('should expand array paths into individual matches', () => {
    const routes: RoutedFragmentBase[] = [
      {
        type: 'tab',
        path: ['overview', 'usage', 'palette'],
      } as RoutedFragmentBase,
    ];

    const overviewResult = parseFragment('overview', routes);
    expect(overviewResult).toHaveLength(1);
    expect(overviewResult[0].route.path).toBe('overview');
    expect(overviewResult[0].route.type).toBe('tab');

    const usageResult = parseFragment('usage', routes);
    expect(usageResult).toHaveLength(1);
    expect(usageResult[0].route.path).toBe('usage');

    const paletteResult = parseFragment('palette', routes);
    expect(paletteResult).toHaveLength(1);
    expect(paletteResult[0].route.path).toBe('palette');
  });

  it('should work with array paths in combination with other routes', () => {
    const routes: RoutedFragmentBase[] = [
      { type: 'tab', path: ['overview', 'usage'] } as RoutedFragmentBase,
      {
        type: 'action',
        path: 'close',
        handler: () => {
          /* test handler */
        },
      } as ActionRoutedFragment,
    ];

    const result = parseFragment('overview#close', routes);
    expect(result).toHaveLength(2);
    expect(result[0].route.type).toBe('tab');
    expect(result[0].route.path).toBe('overview');
    expect(result[1].route.type).toBe('action');
    expect(result[1].route.path).toBe('close');
  });
});
