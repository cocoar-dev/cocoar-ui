import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'design-principles',
    loadComponent: () =>
      import('./pages/design-principles/design-principles.page').then(
        (m) => m.DesignPrinciplesPage
      ),
  },
  {
    path: 'typography',
    loadComponent: () => import('./pages/typography/typography.page').then((m) => m.TypographyPage),
  },
  {
    path: 'colors',
    loadComponent: () => import('./pages/colors/colors.page').then((m) => m.ColorsPage),
  },
  {
    path: 'spacing',
    loadComponent: () => import('./pages/spacing/spacing.page').then((m) => m.SpacingPage),
  },
  {
    path: 'motion',
    loadComponent: () => import('./pages/motion/motion.page').then((m) => m.MotionPage),
  },
  {
    path: 'localization',
    loadComponent: () =>
      import('./pages/localization/localization.page').then((m) => m.LocalizationPage),
  },
  {
    path: 'timezone',
    loadComponent: () =>
      import('./pages/timezone-demo.component').then((m) => m.TimezoneDemoComponent),
  },
  {
    path: 'code-block',
    loadComponent: () => import('./pages/code-block/code-block.page').then((m) => m.CodeBlockPage),
  },
  {
    path: 'markdown-viewer',
    loadComponent: () =>
      import('./pages/markdown-viewer/markdown-viewer.page').then((m) => m.MarkdownViewerPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
  },
  {
    path: 'popover',
    redirectTo: 'tooltip',
    pathMatch: 'full',
  },
  {
    path: 'tooltip',
    loadComponent: () => import('./pages/tooltip/tooltip.page').then((m) => m.TooltipPage),
  },
  {
    path: 'overlay',
    loadComponent: () => import('./pages/overlay/overlay.page').then((m) => m.OverlayPage),
  },
  {
    path: 'cards',
    loadComponent: () => import('./pages/cards/cards.page').then((m) => m.CardsPage),
  },
  {
    path: 'buttons',
    loadComponent: () => import('./pages/buttons/buttons.page').then((m) => m.ButtonsPage),
  },
  {
    path: 'text-input',
    loadComponent: () => import('./pages/text-input/text-input.page').then((m) => m.TextInputPage),
  },
  {
    path: 'number-input',
    loadComponent: () =>
      import('./pages/number-input/number-input.page').then((m) => m.NumberInputPage),
  },
  {
    path: 'password-input',
    loadComponent: () => import('./pages/password/password.page').then((m) => m.PasswordPage),
  },
  {
    path: 'selects',
    redirectTo: 'single-select',
    pathMatch: 'full',
  },
  {
    path: 'single-select',
    loadComponent: () =>
      import('./pages/single-select/single-select.page').then((m) => m.SingleSelectPage),
  },
  {
    path: 'multi-select',
    loadComponent: () =>
      import('./pages/multi-select/multi-select.page').then((m) => m.MultiSelectPage),
  },
  {
    path: 'tag-select',
    loadComponent: () => import('./pages/tag-select/tag-select.page').then((m) => m.TagSelectPage),
  },
  {
    path: 'checkboxes',
    loadComponent: () => import('./pages/checkboxes/checkboxes.page').then((m) => m.CheckboxesPage),
  },
  {
    path: 'plain-date-picker',
    loadComponent: () =>
      import('./pages/plain-date-picker/plain-date-picker.page').then((m) => m.PlainDatePickerPage),
  },
  {
    path: 'plain-date-time-picker',
    loadComponent: () =>
      import('./pages/plain-date-time-picker/plain-date-time-picker.page').then(
        (m) => m.PlainDateTimePickerPage
      ),
  },
  {
    path: 'zoned-date-time-picker',
    loadComponent: () =>
      import('./pages/zoned-date-time-picker/zoned-date-time-picker.page').then(
        (m) => m.ZonedDateTimePickerPage
      ),
  },
  {
    path: 'mini-calendar',
    loadComponent: () =>
      import('./pages/mini-calendar/mini-calendar.page').then((m) => m.MiniCalendarPage),
  },
  {
    path: 'labels',
    loadComponent: () => import('./pages/labels/labels.page').then((m) => m.LabelsPage),
  },
  {
    path: 'forms',
    loadComponent: () => import('./pages/forms/forms.page').then((m) => m.FormsPage),
  },
  {
    path: 'icons',
    loadComponent: () => import('./pages/icons/icons.page').then((m) => m.IconsPage),
  },
  {
    path: 'badges',
    loadComponent: () => import('./pages/badges/badges.page').then((m) => m.BadgesPage),
  },
  {
    path: 'tags',
    loadComponent: () => import('./pages/tags/tags.page').then((m) => m.TagsPage),
  },
  {
    path: 'dividers',
    loadComponent: () => import('./pages/dividers/dividers.page').then((m) => m.DividersPage),
  },
  {
    path: 'table',
    loadComponent: () => import('./pages/table/table.page').then((m) => m.TablePage),
  },
  {
    path: 'data-grid',
    loadComponent: () => import('./pages/data-grid/data-grid.page').then((m) => m.DataGridPage),
  },
  {
    path: 'notes',
    loadComponent: () => import('./pages/notes/notes.page').then((m) => m.NotesPage),
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.page').then((m) => m.MenuPage),
  },
  {
    path: 'sidebar',
    loadComponent: () => import('./pages/sidebar/sidebar.page').then((m) => m.SidebarPage),
  },
  {
    path: 'avatar',
    loadComponent: () => import('./pages/avatar/avatar.page').then((m) => m.AvatarPage),
  },
  {
    path: 'radio',
    loadComponent: () => import('./pages/radio/radio.page').then((m) => m.RadioPage),
  },
  {
    path: 'popconfirm',
    loadComponent: () => import('./pages/popconfirm/popconfirm.page').then((m) => m.PopconfirmPage),
  },
];
