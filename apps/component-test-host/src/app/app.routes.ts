import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '__scenario/coar-button',
    pathMatch: 'full',
  },
  {
    path: '__scenario/:id',
    loadComponent: () => import('./scenario/scenario-host.page').then((m) => m.ScenarioHostPage),
  },
  {
    path: '**',
    redirectTo: '__scenario/coar-button',
  },
];
