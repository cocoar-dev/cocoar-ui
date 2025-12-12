import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { parse, type MarkdownDocument } from '@cocoar/markdown-core';
import { Observable, catchError, defer, map, of, shareReplay, startWith } from 'rxjs';

export type ShowcaseMarkdownDocState =
  | { status: 'loading'; path: string }
  | { status: 'loaded'; path: string; markdown: string; doc: MarkdownDocument }
  | { status: 'error'; path: string; error: unknown };

@Injectable({ providedIn: 'root' })
export class ShowcaseMarkdownDocsService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<ShowcaseMarkdownDocState>>();

  load(path: string): Observable<ShowcaseMarkdownDocState> {
    const normalizedPath = this.normalizePath(path);

    const cached = this.cache.get(normalizedPath);
    if (cached) return cached;

    const request$ = defer(() => this.http.get(normalizedPath, { responseType: 'text' })).pipe(
      map((markdown) => ({
        status: 'loaded',
        path: normalizedPath,
        markdown,
        doc: parse(markdown),
      }) as const),
      startWith({ status: 'loading', path: normalizedPath } as const),
      catchError((error: unknown) => of({ status: 'error', path: normalizedPath, error } as const)),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cache.set(normalizedPath, request$);
    return request$;
  }

  private normalizePath(path: string): string {
    const trimmed = path.trim();
    if (!trimmed) return '/';
    if (trimmed.startsWith('/')) return trimmed;
    return `/${trimmed}`;
  }
}
