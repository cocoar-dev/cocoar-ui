# Table

`coar-table` provides consistent styling for semantic HTML tables.

It does not generate rows/columns; it only wraps your `<table>` markup and applies design-token-based styles.

## Basic usage

```html
<coar-table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Admin</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane@example.com</td>
      <td>User</td>
    </tr>
  </tbody>
</coar-table>
```

## Variants

### Default

Default uses zebra stripes for readability.

```html
<coar-table>...</coar-table>
```

### Plain

Use `variant="plain"` for no zebra stripes.

```html
<coar-table variant="plain">...</coar-table>
```

### Bordered

Use `variant="bordered"` for full cell borders.

```html
<coar-table variant="bordered">...</coar-table>
```

## Compact tables

Use `[compact]="true"` to reduce cell padding for data-dense views.

```html
<coar-table [compact]="true">...</coar-table>
```

## Hover highlighting

Row hover highlighting is enabled by default. Disable it with `[hover]="false"`.

```html
<coar-table [hover]="false">...</coar-table>
```

## Accessibility notes

- `coar-table` keeps native semantics (`<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`).
- Provide `<th>` for headers and keep header text meaningful for screen readers.
