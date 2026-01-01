import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  OnDestroy,
  Type,
  createEnvironmentInjector,
  inject,
  signal,
} from '@angular/core';

import type { ScenarioDefinition } from '@cocoar/scenar-abstractions';

import { loadScenarioRegistry } from './registry';
import { ScenarErrorState } from './scenar-error-state';
import { deserializeWithCodecs } from './scenario-codecs';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'scenar-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  private readonly parentInjector = inject(EnvironmentInjector);
  protected readonly errorState = inject(ScenarErrorState);
  private createdScenarioInjector: EnvironmentInjector | null = null;

  protected readonly scenarioId: string | null;
  protected readonly scenario = signal<ScenarioDefinition | undefined>(
    undefined,
  );
  protected readonly scenarioInjector = signal<EnvironmentInjector>(
    this.parentInjector,
  );
  protected readonly scenarioComponent = signal<Type<unknown> | null>(null);
  protected readonly scenarioInputs = signal<Record<string, unknown>>({});
  protected readonly scenarioLoading = signal(false);

  constructor() {
    const registry = loadScenarioRegistry();
    const pathname = window.location.pathname ?? '/';
    this.scenarioId = extractScenarioId(pathname);
    this.errorState.clear();

    // Backstage is not meant to behave like an SPA.
    // If someone opens the root URL, do a real navigation to a deterministic default.
    if (!this.scenarioId && (pathname === '/' || pathname === '')) {
      const firstId = registry.ids[0] ?? null;
      if (firstId) {
        window.location.replace(`/__scenario/${encodeURIComponent(firstId)}`);
        return;
      }
    }

    if (this.scenarioId) {
      this.scenarioLoading.set(true);
      void this.loadScenarioById(registry, this.scenarioId);
    }
  }

  ngOnDestroy(): void {
    this.createdScenarioInjector?.destroy();
  }

  private async loadScenarioById(
    registry: {
      loadScenarioById(id: string): Promise<ScenarioDefinition>;
    },
    id: string,
  ): Promise<void> {
    try {
      const scenario = await registry.loadScenarioById(id);
      this.errorState.clear();

      this.scenario.set(scenario);

      // Parse inputs from URL query parameters
      const inputs = this.parseInputsFromUrl(scenario);
      this.scenarioInputs.set(inputs);

      // Load the component
      // component is guaranteed to exist after registry generation
      if (!scenario.component) {
        throw new Error(`Scenario '${id}' is missing component loader. Did you run the registry generator?`);
      }
      const componentType = await scenario.component();
      this.scenarioComponent.set(componentType);
    } catch (err) {
      this.errorState.setError(err);
      this.scenario.set(undefined);
      this.scenarioComponent.set(null);
      this.scenarioInputs.set({});
    } finally {
      this.scenarioLoading.set(false);
    }
  }

  private parseInputsFromUrl(
    scenario: ScenarioDefinition,
  ): Record<string, unknown> {
    const defaults = scenario.inputs ?? {};
    const params = new URLSearchParams(window.location.search ?? '');

    const parsed: Record<string, unknown> = { ...defaults };

    // Try to load metadata for type information (synchronously from cache if available)
    let metadata: any = null;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/registry.metadata.json', false); // synchronous
      xhr.send();
      if (xhr.status === 200) {
        metadata = JSON.parse(xhr.responseText);
      }
    } catch {
      // Metadata not available - will use heuristic deserialization
    }

    const scenarioMeta = metadata?.scenarios?.find((s: any) => s.id === scenario.id);

    // Override defaults with URL params, using codec-based deserialization
    params.forEach((value, key) => {
      const inputMeta = scenarioMeta?.inputs?.[key];
      parsed[key] = deserializeWithCodecs(value, inputMeta?.tsType);
    });

    return parsed;
  }

  private async loadScenarioComponent(
    scenario: ScenarioDefinition & {
      component: () => Promise<Type<unknown>>;
    },
  ): Promise<void> {
    try {
      const componentType = await scenario.component();
      this.scenarioComponent.set(componentType);
    } catch (err) {
      this.errorState.setError(err);
      this.scenarioComponent.set(null);
    }
  }
}

function extractScenarioId(pathname: string): string | null {
  const prefix = '/__scenario/';
  if (!pathname.startsWith(prefix)) return null;

  const raw = pathname.slice(prefix.length);
  const cleaned = raw.replace(/^\/+/, '').replace(/\/+$/, '');
  if (cleaned.length === 0) return '';

  try {
    return decodeURIComponent(cleaned);
  } catch {
    return cleaned;
  }
}
