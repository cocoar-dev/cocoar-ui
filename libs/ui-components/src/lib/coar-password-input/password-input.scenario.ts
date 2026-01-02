import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarPasswordInputComponent } from './coar-password-input.component';

export const scenario = defineScenario<CoarPasswordInputComponent>({
  id: 'demo/password-input',
  title: 'Password Input',
});
