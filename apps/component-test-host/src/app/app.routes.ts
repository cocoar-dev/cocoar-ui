import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '__ct/coar-button',
    pathMatch: 'full',
  },
  {
    path: '__ct/:id',
    loadComponent: () => import('./ct/ct-host.page').then((m) => m.CtHostPage),
  },
  {
    path: '**',
    redirectTo: '__ct/coar-button',
  },
];
