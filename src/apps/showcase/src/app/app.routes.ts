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
    path: 'code-block',
    loadComponent: () => import('./pages/code-block/code-block.page').then((m) => m.CodeBlockPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
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
    path: 'checkboxes',
    loadComponent: () => import('./pages/checkboxes/checkboxes.page').then((m) => m.CheckboxesPage),
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
    path: 'notes',
    loadComponent: () => import('./pages/notes/notes.page').then((m) => m.NotesPage),
  },
];
