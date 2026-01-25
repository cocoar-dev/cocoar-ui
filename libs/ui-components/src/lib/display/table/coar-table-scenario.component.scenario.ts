import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarTableComponent, CoarTableVariant } from './coar-table.component';

@Component({
  selector: 'coar-table-scenario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarTableComponent],
  template: `
    <coar-table [variant]="variant()" [compact]="compact()" [hover]="hover()">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alice Smith</td>
          <td>alice@example.com</td>
          <td>Admin</td>
        </tr>
        <tr>
          <td>Bob Johnson</td>
          <td>bob@example.com</td>
          <td>User</td>
        </tr>
        <tr>
          <td>Carol Williams</td>
          <td>carol@example.com</td>
          <td>Editor</td>
        </tr>
      </tbody>
    </coar-table>
  `,
})
export class CoarTableScenarioComponent {
  variant = input<CoarTableVariant>('default');
  compact = input<boolean>(false);
  hover = input<boolean>(true);
}

export const scenario = defineScenario<CoarTableScenarioComponent>({
  id: 'table',
  title: 'Table',
  description: 'Table with sample data',
});
