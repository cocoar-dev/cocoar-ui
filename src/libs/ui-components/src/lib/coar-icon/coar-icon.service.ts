import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { CORE_ICONS } from './core-icons';

/**
 * Service for loading and caching icons from both built-in registry and customer uploads.
 *
 * Built-in icons are stored in memory and returned immediately.
 * Customer icons are fetched from the API and cached after first request.
 */
@Injectable({
  providedIn: 'root',
})
export class CoarIconService {
  private readonly http = inject(HttpClient);
  private customerIconCache = new Map<string, Observable<string | null>>();

  /**
   * Get an icon by name. Handles both built-in and customer icons.
   *
   * @param name - Icon identifier (e.g., "settings" or "customer:invoicePaid")
   * @returns Observable of SVG string, or null if not found
   */
  getIcon(name: string): Observable<string | null> {
    const parsed = this.parseIconName(name);

    if (parsed.source === 'builtin') {
      return this.getBuiltInIcon(parsed.key);
    } else if (parsed.source === 'customer') {
      return this.getCustomerIcon(parsed.key);
    }

    return of(null);
  }

  /**
   * Parse icon name into source type and key.
   *
   * Examples:
   * - "settings" -> { source: "builtin", key: "settings" }
   * - "customer:invoicePaid" -> { source: "customer", key: "invoicePaid" }
   */
  private parseIconName(name: string): { source: 'builtin' | 'customer'; key: string } {
    if (name.startsWith('customer:')) {
      return {
        source: 'customer',
        key: name.substring(9),
      };
    }

    return {
      source: 'builtin',
      key: name,
    };
  }

  /**
   * Get a built-in icon from the in-memory registry.
   */
  private getBuiltInIcon(key: string): Observable<string | null> {
    const svg = CORE_ICONS[key as keyof typeof CORE_ICONS] || null;
    return of(svg || null);
  }

  /**
   * Get a customer icon from the API, with caching.
   * Uses shareReplay(1) to ensure only one network request per icon.
   */
  private getCustomerIcon(key: string): Observable<string | null> {
    const cached = this.customerIconCache.get(key);
    if (cached) {
      return cached;
    }

    const request$ = this.http
      .get(`/api/icons/${key}.svg`, {
        responseType: 'text',
      })
      .pipe(
        catchError(() => of(null)),
        shareReplay(1)
      );

    this.customerIconCache.set(key, request$);
    return request$;
  }

  /**
   * Clear the customer icon cache.
   * Useful when icons are updated on the server.
   */
  clearCache(): void {
    this.customerIconCache.clear();
  }

  /**
   * Clear a specific icon from the cache.
   */
  clearIconCache(name: string): void {
    const parsed = this.parseIconName(name);
    if (parsed.source === 'customer') {
      this.customerIconCache.delete(parsed.key);
    }
  }
}
