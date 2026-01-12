import { describe, expect, it } from 'vitest';
import { Subject } from 'rxjs';

import { BehaviorSubjectProxy } from './behavior-subject-proxy';

describe('BehaviorSubjectProxy', () => {
  it('forwards values from the latest observable and unsubscribes the previous one', () => {
    const proxy = new BehaviorSubjectProxy<string>('init');
    const values: string[] = [];

    const sub = proxy.subscribe((v) => values.push(v));

    const s1 = new Subject<string>();
    const s2 = new Subject<string>();

    proxy.next(s1.asObservable());
    s1.next('a');

    proxy.next(s2.asObservable());
    s1.next('b');
    s2.next('c');

    expect(values).toEqual(['init', 'a', 'c']);

    sub.unsubscribe();
    proxy.unsubscribe();
  });
});
