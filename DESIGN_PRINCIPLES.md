# Cocoar Design System — Design Principles

> A professional, enterprise-grade design system for building Angular applications in business environments.

---

## 🎯 Vision

The Cocoar Design System provides **professional, enterprise-grade UI components** for Angular applications. It prioritizes:

- **Clarity** over decoration
- **Functionality** over aesthetics
- **Consistency** over creativity
- **Accessibility** over novelty

This is **not** a gaming website, marketing landing page, or experimental art project. It's a toolkit for building serious software that people use every day to get work done.

---

## 🏢 Target Applications

- Internal enterprise tools and dashboards
- Customer-facing SaaS platforms
- B2B software applications
- Admin panels and back-office systems
- Data-heavy productivity applications

**Common characteristics:**
- Dense information displays
- Complex forms and workflows
- Repeated daily use by professionals
- Multi-hour sessions without eye strain

---

## 🎨 Brand Identity

### Logo & Name
- **Cocoar** = **Co**de **Co**nnected **Ar**chitecture
- Logo: Connected nodes symbol representing architecture and connectivity
- Primary mark: Dark slate (#3a4a5c) + Brand blue (#1183cd)

### Color Architecture

The color system is designed for **easy theming**:

```
┌─────────────────────────────────────────────────────────────┐
│  PRIMITIVES (Fixed palette)                                 │
│  --coar-color-slate-*   → Neutral foundation                │
│  --coar-color-gray-*    → Pure grays                        │
│  --coar-color-red-*     → Semantic: danger                  │
│  --coar-color-green-*   → Semantic: success                 │
│  --coar-color-yellow-*  → Semantic: warning                 │
│  --coar-color-blue-*    → Semantic: info                    │
├─────────────────────────────────────────────────────────────┤
│  ACCENT (🎨 Themeable - override to customize)              │
│  --coar-color-accent-50 through --coar-color-accent-900     │
│  Default: Blue scale (logo color at accent-700: #1183cd)    │
├─────────────────────────────────────────────────────────────┤
│  USAGE TOKENS (Reference primitives)                        │
│  --coar-background-accent-primary                           │
│  --coar-text-accent-primary                                 │
│  --coar-border-accent-primary                               │
└─────────────────────────────────────────────────────────────┘
```

### Brand Colors
| Role | Token | Default | Usage |
|------|-------|---------|-------|
| Accent/Primary | `--coar-color-accent-700` | `#1183cd` | Primary buttons, links, focus rings |
| Brand Neutral | `--coar-color-slate-800` | `#525e76` | Logo, text, icons |
| Neutral Light | `--coar-color-gray-50` | `#f7f7f7` | Backgrounds |

### Theming Example

To customize the accent color for a different brand:

```css
/* Override accent primitives with your brand color */
:root {
  --coar-color-accent-50: #faf5ff;   /* Lightest */
  --coar-color-accent-100: #e9d8fd;
  --coar-color-accent-200: #d6bcfa;
  --coar-color-accent-300: #b794f4;
  --coar-color-accent-400: #9f7aea;
  --coar-color-accent-500: #805ad5;
  --coar-color-accent-600: #6b46c1;
  --coar-color-accent-700: #553c9a;  /* Primary - used for buttons */
  --coar-color-accent-800: #44337a;  /* Hover */
  --coar-color-accent-900: #322659;  /* Active */
}
```

### Color Philosophy
- **Neutral-first**: Slate grays dominate the palette
- **Accent sparingly**: Used only for interactive elements, not decoration
- **Semantic colors for meaning**: Red for errors/danger, green for success, yellow for warnings, blue for info
- **No decorative colors**: Every color must have a functional purpose
- **Themeable accent**: Override `--coar-color-accent-*` to customize for any brand

---

## 📐 Design Tokens

### Border Radius — Subtle, Not Rounded

We use **subtle, small radii**. This is not Bootstrap. No "pill buttons" or overly rounded corners.

| Token | Value | Usage |
|-------|-------|-------|
| `--coar-radius-xxs` | 1px | Badges, tags, small elements |
| `--coar-radius-xs` | 2px | **Default for most components** |
| `--coar-radius-s` | 3px | Cards, panels |
| `--coar-radius-m` | 4px | Dialogs, modals |
| `--coar-radius-l` | 5px | Large containers (rare) |
| `--coar-radius-xl` | 6px | Hero sections (rare) |
| `--coar-radius-full` | 999px | **Avoid** — only for avatars, floating action buttons |

**Default radius: 2px (`--coar-radius-xs`)**

```css
/* ✅ Good — subtle radius */
border-radius: var(--coar-radius-xs); /* 2px */

/* ❌ Avoid — overly rounded */
border-radius: 24px;
border-radius: 50%;
```

### Typography

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Display | Inter | 72px | Bold | Hero headlines (rare) |
| Title | Inter | 48px | Bold | Page titles |
| Subtitle | Inter | 32px | Regular | Section headers |
| Heading | Poppins | 24px | Semi-bold | Card titles, sections |
| Subheading | Poppins | 20px | Regular | Subsections |
| Body | Poppins | 16px | Regular | Default text |
| Body Small | Poppins | 14px | Regular | Secondary text, hints |
| Caption | Poppins | 12px | Regular | Labels, metadata |

**Fonts:**
- **Inter**: Titles and display text — clean, professional
- **Poppins**: Body text — readable, friendly but not playful

### Component Sizes

All interactive components follow a consistent 3-tier sizing system:

| Size | Height | Usage |
|------|--------|-------|
| `s` | 32px | Compact UI, data tables, toolbars |
| `m` | 40px | **Default** — forms, dialogs |
| `l` | 48px | Prominent actions, hero sections |

**Rule:** Inputs and buttons at the same size must align perfectly.

```html
<!-- ✅ Aligned — both m (40px) -->
<coar-text-input size="m" />
<coar-button size="m">Submit</coar-button>

<!-- ✅ Aligned — both s (32px) -->
<coar-text-input size="s" />
<coar-button size="s">Search</coar-button>
```

---

## ✅ Do's and Don'ts

### DO ✅

- **Use semantic colors for meaning**: Error states are red, success is green
- **Keep spacing consistent**: Use the spacing scale, not arbitrary values
- **Provide feedback**: Loading states, hover effects, focus rings
- **Use subtle animations**: Transitions for state changes (200-300ms)
- **Align components**: Inputs and buttons should line up perfectly
- **Show clear hierarchy**: Primary action should be obvious
- **Support keyboard navigation**: Everything must be accessible
- **Reserve space for dynamic content**: Prevent layout shifts at all costs

### DON'T ❌

- **No pill buttons**: `border-radius: 999px` is forbidden on buttons
- **No gradients** (unless absolutely necessary for a specific use case)
- **No decorative animations**: No bouncing, wiggling, or "fun" effects
- **No bright accent colors**: No neon, no rainbow, no party
- **No rounded-full buttons**: Exception only for floating action buttons or avatars
- **No shadows on shadows**: Keep elevation simple (one level at a time)
- **No decoration for decoration's sake**: Every visual element must serve a purpose
- **No layout shifts**: Never let content jump around when loading or changing state

---

## 🔒 Layout Stability (Zero CLS)

Layout shifts destroy user trust and cause frustration. **Cumulative Layout Shift (CLS) must be zero or near-zero.**

### Rules

1. **Reserve space for images and media**
   - Always set explicit `width` and `height` or use `aspect-ratio`
   - Use placeholder skeletons while loading

2. **Reserve space for dynamic content**
   - Error messages should not push content down — reserve space or use inline placement
   - Loading spinners should not change element dimensions
   - Form validation messages should appear without shifting layout

3. **Fixed component heights**
   - Buttons, inputs, and interactive elements have fixed heights (32/40/48px)
   - Never let content determine component height unpredictably

4. **Skeleton loaders**
   - Use skeletons that match final content dimensions
   - Cards, lists, and data tables should show loading state at full size

5. **Fonts**
   - Preload fonts or use `font-display: swap` carefully
   - Define fallback font metrics to prevent text reflow

### Patterns

```html
<!-- ✅ Good — Error space reserved -->
<coar-text-input label="Email" />
<div class="error-slot" style="min-height: 20px;">
  @if (hasError) {
    <span class="error">Invalid email</span>
  }
</div>

<!-- ❌ Bad — Error appears and shifts content -->
<coar-text-input label="Email" />
@if (hasError) {
  <span class="error">Invalid email</span>
}
<coar-password-input label="Password" />  <!-- This jumps down! -->
```

```css
/* ✅ Good — Image with reserved space */
img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* ✅ Good — Skeleton matching final size */
.skeleton-card {
  height: 200px; /* Same as actual card */
  animation: pulse 1.5s infinite;
}
```

---

## 🎭 Visual Style

### Elevation & Shadows

Use shadows sparingly to indicate elevation:

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | None | Flat elements, within context |
| 1 | Subtle | Cards, dropdowns |
| 2 | Medium | Dialogs, popovers |
| 3 | Strong | Modals (rare) |

### Borders

- **Default border**: 1px solid, using `--coar-border-neutral-secondary`
- **Focus rings**: 2px solid brand color with offset
- **No thick decorative borders**

### States

Every interactive element must have clear states:

| State | Visual Treatment |
|-------|------------------|
| Default | Base appearance |
| Hover | Subtle background shift or border change |
| Focus | Clear focus ring (accessibility requirement) |
| Active/Pressed | Darker shade |
| Disabled | Reduced opacity (50-60%), no pointer |
| Loading | Spinner, prevents interaction |
| Error | Red border/text, error message |

---

## 🌙 Dark Mode

Dark mode is **secondary** but supported. The system should work well in both modes.

**Approach:**
- Invert backgrounds (dark slate instead of white)
- Keep brand blue consistent
- Adjust text colors for contrast
- Shadows may need adjustment (subtle glow instead of dark shadow)

---

## 📱 Touch-First Design

Modern enterprise applications must work seamlessly on **tablets and touch devices**, not just desktops with mice. This is a fundamental principle, not an afterthought.

### Why Touch-First Matters

- **Tablets are everywhere**: Surface devices, iPads, and touchscreen laptops are standard in business
- **Hybrid workflows**: Users switch between mouse and touch constantly
- **Meeting rooms**: Shared tablets for presentations and collaboration
- **Field work**: Sales, logistics, and service teams use tablets daily

### Core Principles

1. **No hover-dependent interactions**
   - Never require hover to reveal critical UI elements
   - Hover is an enhancement for desktop, not a requirement
   - All functionality must work with tap/focus alone

2. **Progressive enhancement for desktop**
   - Base experience works on touch (tap, focus)
   - Desktop gets additional polish (hover states, tooltips)
   - Think: "Touch first, desktop enhanced"

3. **Visible but subtle when idle**
   - Interactive elements should be discoverable without hover
   - Use low opacity/dimmed states instead of hiding completely
   - On focus/hover: Elements become prominent

4. **Adequate touch targets**
   - Minimum 44x44px for touch targets (WCAG guideline)
   - Ensure adequate spacing between tappable elements
   - Avoid cramped UI that's hard to tap accurately

### Example: Clear Button Pattern

**❌ Old approach (hover-dependent):**
```typescript
// Clear button only visible on hover
showClearButton = computed(() =>
  this.hasValue() && this.isHovered()
);
```

**✅ Touch-first approach:**
```typescript
// Always visible when there's a value, just dimmed
showClearButton = computed(() =>
  this.hasValue() && !this.disabled()
);
```

```css
/* Dimmed by default - discoverable but unobtrusive */
.clear-button {
  opacity: 0.4;
  transition: opacity 0.15s ease;
}

/* Prominent when focused (touch) or hovered (desktop) */
.input-focused .clear-button,
.input-container:hover .clear-button {
  opacity: 1;
}

/* Extra feedback when hovering the button itself (desktop only) */
.clear-button:hover {
  color: var(--coar-icon-neutral-primary);
}
```

### Implementation Checklist

When designing components, verify:

- ✅ All interactive elements work without hover
- ✅ Hover states enhance but don't enable functionality
- ✅ Touch targets are at least 44x44px
- ✅ Important UI is visible (even if dimmed) when not focused
- ✅ Focus states are clear and prominent
- ✅ Tested on actual touch device or browser touch emulation

### Not "Mobile First"

**Important distinction:** This is **not** mobile-first design. Mobile phones have different constraints (small screens, portrait orientation, one-handed use).

**This is tablet-first:** Designing for touch interaction while maintaining desktop-appropriate information density and layout. Tablets have similar screen real estate to laptops but use touch instead of mouse.

---

## 📱 Responsive Design

While primarily desktop-focused, components should be responsive:

- **Breakpoints**: Mobile-first is fine, but desktop is the primary target
- **Touch targets**: Minimum 44x44px for mobile
- **Density modes**: Consider offering a "compact" mode for power users

---

## ♿ Accessibility

Non-negotiable requirements:

- **WCAG 2.1 AA compliance** minimum
- **Color contrast**: 4.5:1 for text, 3:1 for UI components
- **Focus indicators**: Always visible, never removed
- **Keyboard navigation**: Full support, logical tab order
- **Screen reader support**: Proper ARIA labels, semantic HTML
- **Motion**: Respect `prefers-reduced-motion`

---

## 🧩 Component Philosophy

### Composition over Configuration

Components should be:
- **Simple by default**: Works out of the box with sensible defaults
- **Composable**: Can be combined with other components
- **Predictable**: Same inputs → same outputs

### Naming Conventions

- **Component selector**: `coar-{component}` (e.g., `coar-button`, `coar-text-input`)
- **CSS classes**: `coar-{style}` (e.g., `.coar-body`, `.coar-heading`)
- **CSS variables**: `--coar-{category}-{property}` (e.g., `--coar-radius-xs`)

### Input/Output Patterns

```typescript
// Prefer signals and model inputs
value = model<string>('');

// Emit events for user actions
clicked = output<MouseEvent>();

// Use consistent naming
@Input() variant: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
@Input() size: 's' | 'm' | 'l';
@Input() disabled: boolean;
```

---

## 🎯 Summary: The Cocoar Aesthetic

| Aspect | Description |
|--------|-------------|
| **Feel** | Professional, calm, trustworthy |
| **Colors** | Neutral slates + blue accent |
| **Corners** | Subtle 4px radius (not rounded) |
| **Shadows** | Minimal, purposeful |
| **Animation** | Subtle, functional feedback |
| **Typography** | Clean, readable, hierarchical |
| **Density** | Balanced (not cramped, not spacious) |

**In one sentence:**
> Cocoar looks like software built by engineers for professionals — not a designer's portfolio piece.

---

## 📚 Reference Inspirations

Design systems with similar philosophy:
- **Ant Design** — Enterprise-focused, balanced density
- **Carbon Design System** (IBM) — Professional, accessible
- **Atlassian Design System** — Productivity tools
- **Primer** (GitHub) — Developer-focused, functional

**Not like:**
- Material Design (too playful)
- Bootstrap (too rounded)
- Tailwind UI (too marketing-focused)

---

*Last updated: February 2026*
*Version: 1.0.0*
