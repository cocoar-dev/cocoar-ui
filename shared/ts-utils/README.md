# @cocoar/ts-utils

Shared TypeScript utilities for Cocoar packages.

## Installation

Most consumers won't install this directly because Cocoar packages use it as an internal dependency.

If you need it:

```bash
pnpm add @cocoar/ts-utils
```

## Utilities

### BehaviorSubjectProxy

`BehaviorSubjectProxy<T>` behaves like a `BehaviorSubject<T>`, but its `next()` method also accepts an `Observable<T>`.
When you pass an observable, it automatically unsubscribes the previous observable subscription and forwards values from the latest one.

This is useful for cases where you want to expose a stable subject but switch the upstream stream dynamically.

## Running unit tests

Run `nx test ts-utils` to execute the unit tests via Vitest.
