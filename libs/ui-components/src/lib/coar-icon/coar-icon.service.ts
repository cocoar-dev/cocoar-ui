import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  COAR_DEFAULT_ICON_SOURCE_KEY,
  COAR_ICON_SOURCE_ENTRY,
  type CoarIconSource,
  type CoarIconSourceEntry,
} from './coar-icon-registry';

export type CoarIconRegisteredSource = Readonly<{
  key: string;
  isDefault: boolean;
  canProvideIconKeys: boolean;
}>;

@Injectable({
  providedIn: 'root',
})
export class CoarIconService {
  private readonly sourceEntries = (inject(COAR_ICON_SOURCE_ENTRY, { optional: true }) ?? []) as
    | CoarIconSourceEntry[]
    | null;
  private readonly defaultSourceOverrides = (inject(COAR_DEFAULT_ICON_SOURCE_KEY, {
    optional: true,
  }) ?? []) as string[] | null;

  private readonly sourceByKey = new Map(
    (this.sourceEntries ?? []).map((entry) => [entry.key, entry.source] as const)
  );

  /**
   * Get an icon by name from a specific icon source.
   *
   * - If `sourceKey` is omitted, the default source is used.
   * - If no source is configured, this throws to make misconfiguration obvious.
   */
  getIcon(name: string, sourceKey?: string): Observable<string | null> {
    const source = this.getSourceOrThrow(sourceKey);
    return source.getIcon(name);
  }

  /**
   * List all registered icon sources.
   *
   * This is useful for UIs that allow users to browse icons grouped by source.
   */
  getRegisteredSources(): ReadonlyArray<CoarIconRegisteredSource> {
    if (this.sourceByKey.size === 0) return [];

    const defaultKey = this.getDefaultSourceKeyOrThrow();
    const entries =
      this.sourceEntries ??
      Array.from(this.sourceByKey.entries()).map(([key, source]) => ({ key, source }));

    return entries.map((entry) => ({
      key: entry.key,
      isDefault: entry.key === defaultKey,
      canProvideIconKeys: typeof entry.source.getAvailableIconKeys === 'function',
    }));
  }

  /**
   * Get the available icon keys from a specific source.
   *
   * Throws if the source does not support listing keys.
   */
  getAvailableIconKeys(sourceKey?: string): Observable<readonly string[]> {
    const entry = this.getSourceEntryOrThrow(sourceKey);
    if (!entry.source.getAvailableIconKeys) {
      throw new Error(
        `Coar icon source "${entry.key}" does not support listing available icon keys.`
      );
    }
    return entry.source.getAvailableIconKeys();
  }

  clearCache(): void {
    for (const source of this.sourceByKey.values()) {
      source.clearCache?.();
    }
  }

  clearIconCache(name: string): void {
    for (const source of this.sourceByKey.values()) {
      source.clearIconCache?.(name);
    }
  }

  private getSourceOrThrow(sourceKey?: string): CoarIconSource {
    if (this.sourceByKey.size === 0) {
      throw new Error(
        'No Coar icon source is configured. Provide at least one source via provideCoarIconSource(), provideCoarIconBuiltInSourceAs(), or provideCoarHttpIconSource().'
      );
    }

    const effectiveKey = sourceKey ?? this.getDefaultSourceKeyOrThrow();
    const source = this.sourceByKey.get(effectiveKey);
    if (!source) {
      throw new Error(`Unknown Coar icon source key: "${effectiveKey}".`);
    }

    return source;
  }

  private getSourceEntryOrThrow(sourceKey?: string): CoarIconSourceEntry {
    if (this.sourceByKey.size === 0) {
      throw new Error(
        'No Coar icon source is configured. Provide at least one source via provideCoarIconSource(), provideCoarIconBuiltInSourceAs(), or provideCoarHttpIconSource().'
      );
    }

    const effectiveKey = sourceKey ?? this.getDefaultSourceKeyOrThrow();
    const source = this.sourceByKey.get(effectiveKey);
    if (!source) {
      throw new Error(`Unknown Coar icon source key: "${effectiveKey}".`);
    }

    return { key: effectiveKey, source };
  }

  private getDefaultSourceKeyOrThrow(): string {
    const overrideKey = this.defaultSourceOverrides?.at(-1);
    if (overrideKey) {
      if (!this.sourceByKey.has(overrideKey)) {
        throw new Error(
          `Default Coar icon source key "${overrideKey}" was provided but no source with that key is registered.`
        );
      }
      return overrideKey;
    }

    // First registered source becomes default.
    return this.sourceEntries?.[0]?.key ?? Array.from(this.sourceByKey.keys())[0];
  }
}
