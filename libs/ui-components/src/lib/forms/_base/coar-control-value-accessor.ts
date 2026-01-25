import { forwardRef, type Provider, type Type, signal } from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export function coarProvideValueAccessor(type: () => Type<ControlValueAccessor>): Provider {
  return {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(type),
    multi: true,
  };
}

export abstract class CoarControlValueAccessor<T> implements ControlValueAccessor {
  protected readonly cvaDisabled = signal(false);

  protected cvaOnChange: (value: T) => void = () => undefined;
  protected cvaOnTouched: () => void = () => undefined;

  public registerOnChange(fn: (value: T) => void): void {
    this.cvaOnChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.cvaOnTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  public abstract writeValue(value: T | null): void;
}
