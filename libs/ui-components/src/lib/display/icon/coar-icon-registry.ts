import { type Provider, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

export interface CoarIconSource {
  getIcon(name: string): Observable<string | null>;
  getAvailableIconKeys?(): Observable<readonly string[]>;
  clearCache?(): void;
  clearIconCache?(name: string): void;
}

export type CoarIconSourceEntry = Readonly<{
  key: string;
  source: CoarIconSource;
}>;

export const COAR_ICON_SOURCE_ENTRY = new InjectionToken<CoarIconSourceEntry>(
  'COAR_ICON_SOURCE_ENTRY'
);

export const COAR_DEFAULT_ICON_SOURCE_KEY = new InjectionToken<string>(
  'COAR_DEFAULT_ICON_SOURCE_KEY'
);

export type ProvideCoarIconSourceOptions = Readonly<{
  key: string;
  source: CoarIconSource;
}>;

export function provideCoarIconSource(options: ProvideCoarIconSourceOptions): Provider {
  return {
    provide: COAR_ICON_SOURCE_ENTRY,
    useValue: {
      key: options.key,
      source: options.source,
    },
    multi: true,
  };
}

export type ProvideCoarIconMapSourceOptions = Readonly<{
  key: string;
  icons: Readonly<Record<string, string>>;
}>;

export function provideCoarIconMapSource(options: ProvideCoarIconMapSourceOptions): Provider {
  return provideCoarIconSource({
    key: options.key,
    source: new CoarIconMapSource(options.icons),
  });
}

export function provideCoarDefaultIconSource(key: string): Provider {
  return {
    provide: COAR_DEFAULT_ICON_SOURCE_KEY,
    useValue: key,
    multi: true,
  };
}

export type ProvideCoarHttpIconSourceOptions = Readonly<{
  key: string;
  getUrl: (iconName: string) => string;
  getAvailableIconKeys?: (http: HttpClient) => Observable<readonly string[]>;
}>;

export function provideCoarHttpIconSource(options: ProvideCoarHttpIconSourceOptions): Provider {
  return {
    provide: COAR_ICON_SOURCE_ENTRY,
    multi: true,
    useFactory: () => {
      const http = inject(HttpClient);
      const getAvailableIconKeys = options.getAvailableIconKeys;
      return {
        key: options.key,
        source: new CoarHttpIconSource(
          http,
          options.getUrl,
          getAvailableIconKeys ? () => getAvailableIconKeys(http) : undefined
        ),
      };
    },
  };
}

class CoarIconMapSource implements CoarIconSource {
  constructor(private readonly icons: Readonly<Record<string, string>>) {}

  public getIcon(name: string): Observable<string | null> {
    return of(this.icons[name] ?? null);
  }

  public getAvailableIconKeys(): Observable<readonly string[]> {
    return of(Object.keys(this.icons).sort());
  }
}

class CoarHttpIconSource implements CoarIconSource {
  private readonly cache = new Map<string, Observable<string | null>>();
  private iconKeys$?: Observable<readonly string[]>;

  public readonly getAvailableIconKeys?: () => Observable<readonly string[]>;

  constructor(
    private readonly http: HttpClient,
    private readonly getUrl: (iconName: string) => string,
    getAvailableIconKeysFactory?: () => Observable<readonly string[]>
  ) {
    if (getAvailableIconKeysFactory) {
      this.getAvailableIconKeys = () => {
        if (!this.iconKeys$) {
          this.iconKeys$ = getAvailableIconKeysFactory().pipe(shareReplay(1));
        }
        return this.iconKeys$;
      };
    }
  }

  public getIcon(name: string): Observable<string | null> {
    const cached = this.cache.get(name);
    if (cached) return cached;

    const request$ = this.http
      .get(this.getUrl(name), {
        responseType: 'text',
      })
      .pipe(
        catchError(() => of(null)),
        shareReplay(1)
      );

    this.cache.set(name, request$);
    return request$;
  }

  public clearCache(): void {
    this.cache.clear();
    this.iconKeys$ = undefined;
  }

  public clearIconCache(name: string): void {
    this.cache.delete(name);
  }
}
