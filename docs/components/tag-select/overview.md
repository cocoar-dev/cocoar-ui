# Tag Select

Selector: `<coar-tag-select>`

Use this component when selected values should be visible as removable tags (chips). It supports optional tag creation.

## Basic usage

```html
<coar-tag-select
  label="Tags"
  placeholder="Add tags..."
  [options]="tagOptions"
  [(value)]="selectedTags"
/>
```

## Allow creating new tags

```html
<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [(value)]="selectedTags"
  [allowCreate]="true"
  (tagCreated)="onTagCreated($event)"
  placeholder="Type to add..."
/>
```

## Max tags

```html
<coar-tag-select
  label="Tags"
  [options]="tagOptions"
  [(value)]="selectedTags"
  [maxTags]="3"
/>
```
