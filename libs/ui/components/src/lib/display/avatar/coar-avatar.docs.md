# Avatar

Avatars display user profile images with automatic fallback to initials when images are unavailable.

## Basic Usage

Display a user avatar with image and name for alt text.

```html
<coar-avatar [src]="user.avatarUrl" [name]="user.name" />
```

## Sizes

Six preset sizes from extra-small (24px) to extra-extra-large (96px).

```html
<coar-avatar name="AB" size="xs" />  <!-- 24px -->
<coar-avatar name="AB" size="s" />   <!-- 32px -->
<coar-avatar name="AB" size="m" />   <!-- 40px (default) -->
<coar-avatar name="AB" size="l" />   <!-- 48px -->
<coar-avatar name="AB" size="xl" />  <!-- 64px -->
<coar-avatar name="AB" size="xxl" /> <!-- 96px -->
```

## Shapes

Choose between circular (default) or square with rounded corners.

```html
<coar-avatar name="AB" shape="circle" />
<coar-avatar name="AB" shape="square" />
```

## Initials Fallback

When no image is provided or the image fails to load, the avatar displays the first 3 characters of the `name` input.

```html
<!-- Shows "ALI" -->
<coar-avatar name="Alice" />

<!-- Shows "BOB" -->
<coar-avatar name="Bob Smith" />
```

## Using the Initials Pipe

Use the `coarInitials` pipe to extract first letters from full names.

```html
<!-- Shows "AJ" (first letter of each word) -->
<coar-avatar [name]="'Alice Johnson' | coarInitials" />

<!-- Shows "AJD" -->
<coar-avatar [name]="'Alice Jane Doe' | coarInitials" />

<!-- Limit to 2 initials -->
<coar-avatar [name]="'Alice Jane Doe' | coarInitials:2" />
```

## Consistent Colors

Avatar backgrounds are automatically generated from the name string, ensuring the same name always produces the same color.

## Custom Background Color

Override the auto-generated color with a custom value.

```html
<coar-avatar name="AB" bgColor="#3b82f6" />
<coar-avatar name="AB" bgColor="var(--coar-color-primary)" />
```

## Clickable Avatars

Make avatars interactive for profile menus or actions.

```html
<coar-avatar name="AB" [clickable]="true" />
```

When `clickable` is true, the avatar receives `role="button"` and `tabindex="0"` for accessibility.
