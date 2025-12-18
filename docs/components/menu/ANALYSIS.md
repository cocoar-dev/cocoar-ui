# Coar Menu Component - Analysis & Improvement Plan

> **Status:** Initial implementation needs significant rework
> **Priority:** MEDIUM - Good foundation, needs design system alignment

---

## 🎯 Executive Summary

The menu component has a **solid architectural foundation** but needs significant updates to match design system standards and become production-ready.

**Current State:** 40% complete
- ✅ Component structure
- ✅ Basic interactions
- ❌ Design tokens (completely wrong)
- ❌ Keyboard navigation (missing)
- ❌ Accessibility (incomplete)
- ❌ Overlay integration (missing)

---

## ❌ Critical Issues

### 1. **Design Token Misuse (BLOCKER)**

**Problem:** CSS uses non-existent tokens

**Current (WRONG):**
```css
background: var(--coar-color-surface-primary);
color: var(--coar-color-text-primary);
border-radius: var(--coar-border-radius-md);
font-size: var(--coar-font-size-sm);
```

**Should Be:**
```css
background: var(--coar-background-neutral-primary);
color: var(--coar-text-neutral-primary);
border-radius: var(--coar-radius-xs);
/* Use typography classes, not font-size tokens */
```

**Files Affected:**
- `coar-menu.component.css` (entire file)

---

### 2. **Missing Keyboard Navigation (BLOCKER for A11y)**

Menus MUST support:
- `ArrowDown/ArrowUp` - Navigate items
- `Enter/Space` - Activate item
- `Escape` - Close menu/submenu
- `Home/End` - First/last item
- `ArrowRight/ArrowLeft` - Open/close submenus

**Current:** None of this exists

**Impact:** Unusable with keyboard

---

### 3. **Submenu Bug**

```typescript
// ❌ BUG: defaultOpen() called in field initializer, always undefined
protected isOpen = signal(this.defaultOpen());

// ✓ FIX: Read in constructor or use effect
protected isOpen = signal(false);

constructor() {
  effect(() => {
    this.isOpen.set(this.defaultOpen());
  }, { allowSignalWrites: true });
}
```

---

### 4. **No Size Variants**

Other components have `size: 'xs' | 'sm' | 'md' | 'lg'`
Menu should too (affects padding, font-size, icon size)

---

### 5. **No Overlay Integration**

Menu can't be used as:
- Dropdown menu (attach to button)
- Context menu (right-click)
- Floating menu (positioned)

**Needs:** Integration with `@cocoar/ui-overlay`

---

## 🔧 Required Fixes

### Priority 1: Design Tokens (1 hour)

**File:** `coar-menu.component.css`

**Changes:**
```css
/* BEFORE (all wrong) */
--coar-color-surface-primary
--coar-color-text-primary
--coar-border-radius-md
--coar-font-size-sm

/* AFTER (correct) */
--coar-background-neutral-primary
--coar-text-neutral-primary
--coar-radius-xs
/* Use .coar-body-small class instead of font-size */
```

**Replace ALL hardcoded values:**
- `0.5rem` → `var(--coar-spacing-s)`
- `1rem` → `var(--coar-spacing-m)`
- `0.25rem` → `var(--coar-spacing-xs)`

**Add spacing tokens:**
```css
.coar-menu {
  padding: var(--coar-spacing-s) 0;
}

.coar-menu-item {
  padding: var(--coar-spacing-s) var(--coar-spacing-m);
  gap: var(--coar-spacing-s);
}
```

---

### Priority 2: Fix Submenu State (15 minutes)

**File:** `coar-menu-submenu.component.ts`

```typescript
export class CoarMenuSubmenuComponent {
  icon = input<CoreIconName | undefined>(undefined);
  title = input.required<string>();
  defaultOpen = input<boolean>(false);

  // ✓ FIX: Proper initialization
  protected isOpen = signal(false);

  constructor() {
    // Read defaultOpen after inputs are set
    afterNextRender(() => {
      this.isOpen.set(this.defaultOpen());
    });
  }

  protected toggleOpen(): void {
    this.isOpen.update((open) => !open);
  }
}
```

---

### Priority 3: Add Size Variants (30 minutes)

**File:** `coar-menu.component.ts`

```typescript
export type CoarMenuSize = 'xs' | 'sm' | 'md' | 'lg';

export class CoarMenuComponent {
  mode = input<MenuMode>('vertical');
  theme = input<'light' | 'dark'>('light');
  size = input<CoarMenuSize>('md'); // NEW
}
```

**File:** `coar-menu.component.css`

```css
/* Size variants */
.coar-menu--xs .coar-menu-item {
  padding: var(--coar-spacing-xs) var(--coar-spacing-s);
  font-size: var(--coar-body-caption-size);
}

.coar-menu--sm .coar-menu-item {
  padding: var(--coar-spacing-xs) var(--coar-spacing-m);
  font-size: var(--coar-body-small-size);
}

.coar-menu--md .coar-menu-item {
  padding: var(--coar-spacing-s) var(--coar-spacing-m);
  font-size: var(--coar-body-base-size);
}

.coar-menu--lg .coar-menu-item {
  padding: var(--coar-spacing-m) var(--coar-spacing-l);
  font-size: var(--coar-body-large-size);
}
```

---

### Priority 4: Keyboard Navigation (2 hours)

**Pattern:** Follow same approach as `coar-tabs` or create new `CoarMenuKeyboardService`

**Required Keys:**
- `ArrowDown` - Next item (wrap to first)
- `ArrowUp` - Previous item (wrap to last)
- `Enter`/`Space` - Activate focused item
- `Escape` - Close menu/collapse submenu
- `Home` - First item
- `End` - Last item
- `ArrowRight` - Expand submenu (if collapsed)
- `ArrowLeft` - Collapse submenu (if expanded)

**Implementation:**
```typescript
@HostListener('keydown', ['$event'])
handleKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      this.focusNextItem();
      break;
    case 'ArrowUp':
      event.preventDefault();
      this.focusPreviousItem();
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      this.activateFocusedItem();
      break;
    case 'Escape':
      event.preventDefault();
      this.closeMenu();
      break;
    // etc.
  }
}
```

---

### Priority 5: Accessibility (1 hour)

**Add:**
```typescript
// Menu container
tabindex="0"
role="menu"
[attr.aria-label]="label()"
[attr.aria-orientation]="mode() === 'horizontal' ? 'horizontal' : 'vertical'"

// Menu items
tabindex="-1" // Managed by roving tabindex
[attr.aria-disabled]="disabled()"
[attr.aria-selected]="selected()"

// Submenu
[attr.aria-haspopup]="true"
[attr.aria-expanded]="isOpen()"
```

---

## 🎨 Styling Improvements

### Current Issues

1. **No hover/focus states match design system**
2. **Transitions not using motion tokens**
3. **Shadow/elevation not standard**
4. **No dark mode support** (theme input ignored)

### Recommended Changes

```css
/* Use standard interaction states */
.coar-menu-item:hover:not(.coar-menu-item--disabled) {
  background-color: var(--coar-background-neutral-tertiary); /* Not --coar-color-surface-hover */
}

/* Use motion tokens */
transition: background-color var(--coar-motion-duration-fast) var(--coar-motion-easing-standard);

/* Use shadow tokens */
box-shadow: var(--coar-shadow-m); /* Not -md */

/* Dark mode (if theme="dark" passed) */
.coar-menu--dark {
  background: var(--coar-background-neutral-secondary);
  color: var(--coar-text-neutral-primary);
}
```

---

## 🔗 Missing Integrations

### Overlay System

**Goal:** Make menu work as dropdown/context menu

**Example Usage:**
```typescript
// Open menu next to button
openMenu(trigger: HTMLElement) {
  const menuRef = this.overlay.open(
    Overlay.builder()
      .anchorToElement(trigger)
      .component(CoarMenuOverlayComponent, { items: this.menuItems })
      .placement('bottom-start')
      .dismissOnOutsideClick()
      .build()
  );
}
```

**Needs:**
- Create `CoarMenuOverlayComponent` wrapper
- Add `items` input for programmatic usage
- Handle dismiss on item click
- Handle escape key

---

## 📝 Documentation Gaps

### README.md Issues

- ✅ Good: Basic examples
- ❌ Missing: Keyboard shortcuts
- ❌ Missing: Accessibility notes
- ❌ Missing: Size variants
- ❌ Missing: Overlay usage
- ❌ Missing: API table (like other components)

---

## ✅ Recommended Action Plan

### Phase 1: Fix Blockers (2 hours)
1. ✓ Replace all wrong design tokens
2. ✓ Fix hardcoded spacing values
3. ✓ Fix submenu defaultOpen bug
4. ✓ Add size variants
5. ✓ Add proper typography classes

### Phase 2: Accessibility (2 hours)
1. ✓ Implement keyboard navigation
2. ✓ Add focus management
3. ✓ Add missing ARIA attributes
4. ✓ Add focus-visible styles

### Phase 3: Integration (3 hours)
1. ✓ Create overlay wrapper component
2. ✓ Add positioning support
3. ✓ Add dismiss behaviors
4. ✓ Add tests

### Phase 4: Polish (1 hour)
1. ✓ Update documentation
2. ✓ Add showcase page
3. ✓ Add API reference
4. ✓ Add examples

**Total Estimated Time:** 8 hours to production-ready

---

## 🎯 Should This Component Exist?

**YES**, but with caveats:

**Use Cases:**
- ✅ Navigation menus (sidebar, header)
- ✅ Context menus (right-click)
- ✅ Dropdown menus (action lists)
- ✅ Settings/options menus

**Alternatives:**
- For simple dropdowns: `coar-single-select` might be better
- For actions: `coar-button` with overlay
- For navigation: Consider tabs or sidebar patterns

**Verdict:** Menu component is valuable, but needs work to match design system quality standards.

---

## 📊 Component Health Score

| Criterion | Score | Notes |
|-----------|-------|-------|
| Architecture | 8/10 | Good composition, clean structure |
| Design Tokens | 0/10 | **All tokens wrong** |
| Accessibility | 3/10 | Basic ARIA, no keyboard nav |
| Styling | 4/10 | Looks okay, but not using design system |
| Functionality | 5/10 | Basic works, missing key features |
| Documentation | 6/10 | README exists, needs examples |
| Tests | 0/10 | No tests |
| **Overall** | **3.7/10** | **Needs significant work** |

---

## 🚀 Quick Wins (Do These First)

1. **Replace tokens** (30 min) - Makes it work with design system
2. **Fix submenu bug** (5 min) - Makes defaultOpen actually work
3. **Add spacing tokens** (15 min) - Proper spacing
4. **Add typography classes** (15 min) - Consistent text styling

**Total:** 1 hour to make it "usable"

Then tackle keyboard nav and overlay integration.

---

## 💡 Code Quality Notes

### Good Practices Observed
- ✅ Signal-based state
- ✅ OnPush change detection
- ✅ Proper event handling (`clicked` output)
- ✅ Boolean attribute transforms
- ✅ Standalone components

### Anti-Patterns
- ❌ Initializing signal with input value directly
- ❌ Not using design tokens
- ❌ Magic numbers everywhere
- ❌ No keyboard support
- ❌ Theme input ignored in implementation

---

**Next Steps:** Should I implement the Priority 1 & 2 fixes now (tokens + submenu bug)? That would make the component immediately usable while we plan the bigger improvements.
