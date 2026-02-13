import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  COAR_DEFAULT_ICON_SOURCE_KEY,
  COAR_ICON_SOURCE_ENTRY,
  type CoarIconSource,
  type CoarIconSourceEntry,
} from './coar-icon-registry';
import { CORE_ICONS } from './core-icons';
import { COAR_BUILTIN_ICON_SOURCE_KEY } from './coar-icon-built-in-registry';

export type CoarIconRegisteredSource = Readonly<{
  key: string;
  isDefault: boolean;
  canProvideIconKeys: boolean;
}>;

@Injectable({
  providedIn: 'root',
})
export class CoarIconService {
  private readonly builtInSource: CoarIconSource = {
    getIcon: (name) => of(CORE_ICONS[name as keyof typeof CORE_ICONS] ?? null),
    getAvailableIconKeys: () => of(Object.keys(CORE_ICONS).sort()),
  };

  private readonly sourceEntries = [
    { key: COAR_BUILTIN_ICON_SOURCE_KEY, source: this.builtInSource },
    ...(((inject(COAR_ICON_SOURCE_ENTRY, { optional: true }) ?? []) as CoarIconSourceEntry[]) ??
      []),
  ] as const;
  private readonly defaultSourceOverrides = (inject(COAR_DEFAULT_ICON_SOURCE_KEY, {
    optional: true,
  }) ?? []) as string[] | null;

  private readonly sourceByKey = new Map(
    this.sourceEntries.map((entry) => [entry.key, entry.source] as const)
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
    const defaultKey = this.getDefaultSourceKeyOrThrow();
    return Array.from(this.sourceByKey.entries()).map(([key, source]) => ({
      key,
      isDefault: key === defaultKey,
      canProvideIconKeys: typeof source.getAvailableIconKeys === 'function',
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
    const effectiveKey = sourceKey ?? this.getDefaultSourceKeyOrThrow();
    const source = this.sourceByKey.get(effectiveKey);
    if (!source) {
      throw new Error(`Unknown Coar icon source key: "${effectiveKey}".`);
    }

    return source;
  }

  private getSourceEntryOrThrow(sourceKey?: string): CoarIconSourceEntry {
    const effectiveKey = sourceKey ?? this.getDefaultSourceKeyOrThrow();
    const source = this.sourceByKey.get(effectiveKey);
    if (!source) {
      throw new Error(`Unknown Coar icon source key: "${effectiveKey}".`);
    }

    return { key: effectiveKey, source };
  }

  private getDefaultSourceKeyOrThrow(): string {
    const overrideKey = this.defaultSourceOverrides
      ? this.defaultSourceOverrides[this.defaultSourceOverrides.length - 1]
      : undefined;
    if (overrideKey) {
      if (!this.sourceByKey.has(overrideKey)) {
        throw new Error(
          `Default Coar icon source key "${overrideKey}" was provided but no source with that key is registered.`
        );
      }
      return overrideKey;
    }

    return COAR_BUILTIN_ICON_SOURCE_KEY;
  }
}
