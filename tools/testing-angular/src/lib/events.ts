export interface DispatchKeyboardEventOptions {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  repeat?: boolean;
}

export function dispatchKeyboardEvent(
  target: EventTarget,
  type: 'keydown' | 'keyup' | 'keypress',
  options: DispatchKeyboardEventOptions
): KeyboardEvent {
  const event = new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    key: options.key,
    code: options.code,
    ctrlKey: options.ctrlKey,
    shiftKey: options.shiftKey,
    altKey: options.altKey,
    metaKey: options.metaKey,
    repeat: options.repeat,
  });

  target.dispatchEvent(event);
  return event;
}

export function dispatchPointerEvent(
  target: EventTarget,
  type: 'pointerdown' | 'pointerup' | 'pointerenter' | 'pointerleave' | 'pointermove',
  options: PointerEventInit = {}
): PointerEvent {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });

  target.dispatchEvent(event);
  return event;
}

export function dispatchClick(target: HTMLElement): MouseEvent {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

export function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
}

export function setInputValueAndBlur(
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void {
  setInputValue(input, value);
  input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  input.dispatchEvent(new FocusEvent('blur', { bubbles: true, cancelable: true }));
}
