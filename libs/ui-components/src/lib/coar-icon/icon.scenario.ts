import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarIconComponent } from './coar-icon.component';
import { provideHttpClient } from '@angular/common/http';
import { CoarIconService } from './coar-icon.service';

export const scenario = defineScenario<CoarIconComponent>({
  id: 'demo/icon',
  title: 'Icon',
  providers: [provideHttpClient(), CoarIconService],
  inputs: {
    name: 'add',
  },
});
