# Naming Conventions

The authoritative naming conventions live at the repository root:

- [../NAMING.md](../NAMING.md)

This file exists only to keep docs discoverable when the `src/` folder is opened as the workspace.


## 7.1 Types

Inside **`@cocoar/logging`**, types MUST be clean and generic:

```
Logger
LoggerConfiguration
LogEvent
LogEventLevel
Sink
```

No `Coar*` prefix required here.

## 7.2 Angular wrapper types

Inside **`@cocoar/logging-angular`**, Angular-specific types SHOULD use the `Coar` prefix:

```
CoarLoggingService
CoarLoggingModule
```

---

# 8. Testing Naming

## 8.1 Test file names

```
*.spec.ts
```

## 8.2 Test IDs

Test attributes may use:

```
data-coar-test="button-primary"
data-coar-test="grid-row-1"
```

---

# 9. Example Summary

### Component

```ts
@Component({
  selector: 'coar-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class CoarButtonComponent {}
```

### CSS

```css
.coar-button {
  background: var(--coar-color-primary);
  padding: var(--coar-spacing-2);
}
```

### HTML usage

```html
<coar-button variant="primary">Save</coar-button>
```

### Logging

```ts
import { Logger } from '@cocoar/logging';
logger.debug('Value changed {Value}', { Value: 42 });
```

---

# 10. Summary Checklist

* Prefix for Angular components/directives: **`coar`**
* Component classes: **`CoarNameComponent`**
* CSS variables: **`--coar-*`**
* CSS classes: **`.coar-*`**
* npm packages: **`@cocoar/ui-*`** and **`@cocoar/logging-*`**
* Repo name: **`cocoar-ui`**

This file defines the authoritative naming standard for the entire `cocoar-ui` codebase.
