import { Routes } from '@angular/router';

import { ScenarNotScenarioUrlComponent } from './not-scenario-url.component';
import { ScenarScenarioIndexComponent } from './scenario-index.component';
import { ScenarScenarioPageComponent } from './scenario-page.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '__scenario',
  },
  {
    path: '__scenario',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ScenarScenarioIndexComponent,
      },
      // Catch-all so scenario IDs can contain '/' (e.g. input/text/multiple).
      {
        path: '**',
        component: ScenarScenarioPageComponent,
      },
    ],
  },
  {
    path: '**',
    component: ScenarNotScenarioUrlComponent,
  },
];
