import { BehaviorSubject, isObservable, Observable, Subscription } from 'rxjs';

export class BehaviorSubjectProxy<T> extends BehaviorSubject<T> {
  #lastSubscription?: Subscription;

  constructor(initialValue: T) {
    super(initialValue);
  }

  override next(value: T | Observable<T>): BehaviorSubjectProxy<T> {
    if (isObservable(value)) {
      // Alten Stream abhängen
      this.#lastSubscription?.unsubscribe();

      this.#lastSubscription = value.subscribe({
        next: (val) => {
          // Nur den Wert weitergeben, nicht nochmal Observable-Logik
          super.next(val);
        },
        error: () => this.#unsubscribeDependent(),
        complete: () => this.#unsubscribeDependent(),
      });
    } else {
      // Normaler Wert
      super.next(value);
    }

    return this;
  }

  #unsubscribeDependent(): void {
    this.#lastSubscription?.unsubscribe();
    this.#lastSubscription = undefined;
  }

  override unsubscribe(): void {
    this.#unsubscribeDependent();
    super.unsubscribe();
  }
}
