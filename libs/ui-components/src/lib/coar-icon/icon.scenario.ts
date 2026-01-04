import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarIconComponent } from './coar-icon.component';
import { provideHttpClient } from '@angular/common/http';
import { CoarIconService } from './coar-icon.service';
import { provideCoarIconBuiltInSourceAs } from './coar-icon-built-in-registry';

export const scenario = defineScenario<CoarIconComponent>({
  id: 'icon',
  title: 'Icon',
  providers: [provideHttpClient(), provideCoarIconBuiltInSourceAs('core'), CoarIconService],
  inputs: {
    name: 'add',
  },
});
