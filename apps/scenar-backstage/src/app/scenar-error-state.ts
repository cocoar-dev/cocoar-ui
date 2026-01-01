import { Injectable, signal } from '@angular/core';

export interface ScenarRenderError {
  message: string;
  stack?: string;
  timestampMs: number;
}

@Injectable({ providedIn: 'root' })
export class ScenarErrorState {
  readonly error = signal<ScenarRenderError | null>(null);

  setError(error: unknown): void {
    const normalized = normalizeError(error);
    this.error.set({
      message: normalized.message,
      stack: normalized.stack,
      timestampMs: Date.now(),
    });
  }

  clear(): void {
    this.error.set(null);
  }
}

function normalizeError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message || String(error), stack: error.stack };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
}
