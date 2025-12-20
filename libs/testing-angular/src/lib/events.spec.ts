import { describe, expect, it, vi } from 'vitest';

import { dispatchClick, dispatchKeyboardEvent, setInputValueAndBlur } from './events';

describe('events', () => {
  it('dispatchKeyboardEvent triggers listeners', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    el.addEventListener('keydown', handler);

    dispatchKeyboardEvent(el, 'keydown', { key: 'Escape' });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('dispatchClick triggers listeners', () => {
    const button = document.createElement('button');
    const handler = vi.fn();
    button.addEventListener('click', handler);

    dispatchClick(button);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('setInputValueAndBlur dispatches input/change/blur', () => {
    const input = document.createElement('input');
    const onInput = vi.fn();
    const onChange = vi.fn();
    const onBlur = vi.fn();

    input.addEventListener('input', onInput);
    input.addEventListener('change', onChange);
    input.addEventListener('blur', onBlur);

    setInputValueAndBlur(input, 'abc');

    expect(input.value).toBe('abc');
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
