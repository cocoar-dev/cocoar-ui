# Popconfirm

Popconfirm provides a lightweight confirmation dialog that appears near the trigger element. Use it to confirm destructive or important actions without blocking the entire interface.

## Basic Usage

Add the `coarPopconfirm` directive to any element to require confirmation before an action.

```html
<coar-button
  variant="danger"
  coarPopconfirm="Are you sure you want to delete this item?"
  (confirmed)="deleteItem()"
  (cancelled)="onCancel()">
  Delete
</coar-button>
```

## With Title

Add a title for clearer communication about the action.

```html
<coar-button
  coarPopconfirm="This action cannot be undone."
  popconfirmTitle="Delete permanently?"
  confirmText="Yes, delete"
  cancelText="Keep it"
  confirmVariant="danger"
  (confirmed)="deletePermanently()">
  Delete Forever
</coar-button>
```

## Placements

Position the popconfirm relative to the trigger element.

```html
<coar-button coarPopconfirm="Confirm?" placement="top">Top</coar-button>
<coar-button coarPopconfirm="Confirm?" placement="bottom">Bottom</coar-button>
<coar-button coarPopconfirm="Confirm?" placement="left">Left</coar-button>
<coar-button coarPopconfirm="Confirm?" placement="right">Right</coar-button>
```

The popconfirm automatically repositions if there isn't enough space in the preferred direction.

## Custom Button Text

Customize confirm and cancel button text to match the action context.

```html
<coar-button
  coarPopconfirm="You have unsaved changes."
  confirmText="Discard"
  cancelText="Continue editing"
  confirmVariant="danger"
  (confirmed)="discardChanges()">
  Cancel
</coar-button>
```

## Confirm Variants

Use `confirmVariant` to style the confirm button appropriately.

```html
<!-- Danger for destructive actions -->
<coar-button
  coarPopconfirm="Delete this file?"
  confirmVariant="danger"
  (confirmed)="delete()">
  Delete
</coar-button>

<!-- Primary for important but safe actions -->
<coar-button
  coarPopconfirm="Send to all subscribers?"
  confirmVariant="primary"
  (confirmed)="send()">
  Send
</coar-button>
```

## Disabled State

Prevent the popconfirm from opening.

```html
<coar-button
  coarPopconfirm="Confirm?"
  [popconfirmDisabled]="!canDelete"
  (confirmed)="delete()">
  Delete
</coar-button>
```

## Accessibility

- Press `Escape` to close the popconfirm (same as cancel)
- `Tab` navigates between confirm and cancel buttons
- Focus is trapped within the popconfirm while open
- Focus returns to the trigger element when closed

## Best Practices

**Do:**
- Use for destructive actions (delete, remove, discard)
- Write clear, action-specific messages
- Use `confirmVariant="danger"` for destructive actions

**Don't:**
- Use for every action - reserve for important confirmations
- Write vague messages like "Are you sure?"
- Use for complex forms - use a modal instead
