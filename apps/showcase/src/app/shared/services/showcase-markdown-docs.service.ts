import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { parse, type MarkdownDocument } from '@cocoar/markdown-core';
import { Observable, catchError, defer, map, of, shareReplay, startWith } from 'rxjs';

export type ShowcaseMarkdownDocState =
  | { status: 'loading'; path: string; url: string }
  | { status: 'loaded'; path: string; url: string; markdown: string; doc: MarkdownDocument }
  | { status: 'error'; path: string; url: string; error: unknown };

@Injectable({ providedIn: 'root' })
export class ShowcaseMarkdownDocsService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly cache = new Map<string, Observable<ShowcaseMarkdownDocState>>();

  load(path: string): Observable<ShowcaseMarkdownDocState> {
    const requestUrl = this.resolveRequestUrl(path);

    const cached = this.cache.get(requestUrl);
    if (cached) return cached;

    const request$ = defer(() => this.http.get(requestUrl, { responseType: 'text' })).pipe(
      map(
        (markdown) =>
          ({
            status: 'loaded',
            path,
            url: requestUrl,
            markdown,
            doc: parse(markdown),
          } as const)
      ),
      startWith({ status: 'loading', path, url: requestUrl } as const),
      catchError((error: unknown) =>
        of({ status: 'error', path, url: requestUrl, error } as const)
      ),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cache.set(requestUrl, request$);
    return request$;
  }

  private resolveRequestUrl(path: string): string {
    const trimmed = path.trim();
    if (!trimmed) return this.document.baseURI;

    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    // Pages pass paths like "/docs/..." during development.
    // On GitHub Pages the app is hosted on a sub-path (e.g. /cocoar-ui/),
    // so we must resolve docs relative to the app base href, not the domain root.
    const relative = trimmed.replace(/^\/+/, '');
    return new URL(relative, this.document.baseURI).toString();
  }
}
