import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

/**
 * Read-only view over a private `BehaviorSubject`.
 *
 * Intended usage:
 * - The owning service keeps the `BehaviorSubject` private and calls `next()`.
 * - Consumers only get `value$` + synchronous `value` access.
 */
export class ReadonlyState<T> {
  readonly #subject: BehaviorSubject<T>;

  readonly value$: Observable<T>;

  constructor(subject: BehaviorSubject<T>) {
    this.#subject = subject;
    this.value$ = subject.asObservable().pipe(distinctUntilChanged());
  }

  get value(): T {
    return this.#subject.value;
  }
}
