import { Component } from '@angular/core';

import {
  CoarAvatarComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarBadgeComponent,
  CoarInitialsPipe,
  AvatarSize,
  AvatarShape,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    CoarAvatarComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarBadgeComponent,
    CoarInitialsPipe,
  ],
  templateUrl: './avatar.page.html',
  styleUrl: './avatar.page.css',
})
export class AvatarPage {
  importCode = `import { CoarAvatarComponent } from '@cocoar/ui-components';`;

  /** Avatar sizes */
  sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  /** Size labels for display */
  sizeLabels: Record<AvatarSize, string> = {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
    '2xl': '96px',
  };

  /** Avatar shapes */
  shapes: AvatarShape[] = ['circle', 'square'];

  /** Sample users for demos */
  users = [
    { name: 'Alice Johnson', src: 'https://i.pravatar.cc/150?u=alice' },
    { name: 'Bob Smith', src: 'https://i.pravatar.cc/150?u=bob' },
    { name: 'Carol Williams', src: 'https://i.pravatar.cc/150?u=carol' },
    { name: 'David Brown', src: 'https://i.pravatar.cc/150?u=david' },
  ];

  /** Users with broken images to show fallback */
  fallbackUsers = [
    { name: 'Emma Davis' },
    { name: 'Frank Miller' },
    { name: 'Grace Lee' },
    { name: 'Henry Wilson' },
  ];

  /** Code examples */
  codeExamples = {
    basic: `<coar-avatar
  [src]="user.avatarUrl"
  [name]="user.name"
  size="md"
/>`,

    sizes: `<!-- Avatar sizes from xs (24px) to 2xl (96px) -->
<coar-avatar [name]="user.name" size="xs" />
<coar-avatar [name]="user.name" size="sm" />
<coar-avatar [name]="user.name" size="md" />
<coar-avatar [name]="user.name" size="lg" />
<coar-avatar [name]="user.name" size="xl" />
<coar-avatar [name]="user.name" size="2xl" />`,

    shapes: `<!-- Circle (default) and square shapes -->
<coar-avatar [name]="user.name" shape="circle" />
<coar-avatar [name]="user.name" shape="square" />`,

    fallback: `<!-- Avatar shows first 3 characters of name -->
<coar-avatar name="Alice" />
<!-- Shows "ALI" -->

<!-- Use coarInitials pipe for extracting first letters -->
<coar-avatar [name]="'Alice Johnson' | coarInitials" />
<!-- Shows "AJ" -->

<coar-avatar [name]="'Alice Jane Doe' | coarInitials" />
<!-- Shows "AJD" -->`,

    withStatus: `<!-- Use a badge to show online/offline status -->
<div class="avatar-with-status">
  <coar-avatar [name]="user.name" [src]="user.avatarUrl" />
  <coar-badge variant="success" dot size="xs" class="status-indicator" />
</div>`,
  };
}
