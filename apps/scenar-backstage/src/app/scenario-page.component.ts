import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EnvironmentInjector,
  Type,
  createEnvironmentInjector,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';

import type { ScenarioDefinition } from '@cocoar/scenar-abstractions';

import { loadScenarioRegistry } from './registry';
import { deserializeWithCodecs } from './scenario-codecs';
import { ScenarErrorState } from './scenar-error-state';
import { ScenarScenarioOutletComponent } from './scenario-outlet.component';

type RegistryMetadata = {
  scenarios: Array<{
    id: string;
    inputs?: Record<string, { tsType?: string }>;
  }>;
};

@Component({
  standalone: true,
  imports: [CommonModule, ScenarScenarioOutletComponent],
  selector: 'scenar-scenario-page',
  templateUrl: './scenario-page.component.html',
  styleUrl: './scenario-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarScenarioPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly parentInjector = inject(EnvironmentInjector);
  protected readonly errorState = inject(ScenarErrorState);

  private createdScenarioInjector: EnvironmentInjector | null = null;

  private readonly urlSegments = toSignal(this.route.url, {
    initialValue: this.route.snapshot.url,
  });

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  // Loaded once and cached for decoding query params into typed inputs.
  private readonly registryMetadata = signal<RegistryMetadata | null>(null);

  private readonly loadedScenarioId = signal<string | null>(null);

  protected readonly scenarioId = signal<string | null>(null);
  protected readonly scenario = signal<ScenarioDefinition | undefined>(undefined);
  protected readonly scenarioInjector = signal<EnvironmentInjector>(this.parentInjector);
  protected readonly scenarioComponent = signal<Type<unknown> | null>(null);
  protected readonly scenarioInputs = signal<Record<string, unknown>>({});
  protected readonly scenarioLoading = signal(false);

  constructor() {
    void this.loadMetadata();

    effect(
      () => {
        const id = this.computeScenarioIdFromUrl();
        this.scenarioId.set(id);

        // Load scenario when the ID changes.
        // (Query param changes are handled in a separate effect.)
        if (id !== this.loadedScenarioId()) {
          this.loadedScenarioId.set(id);
          void this.loadScenarioById(id);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const currentScenario = this.scenario();
        const id = this.scenarioId();
        const paramMap = this.queryParamMap();

        if (!id || !currentScenario) return;

        const inputs = this.parseInputsFromQueryParams(currentScenario, paramMap);
        this.scenarioInputs.set(inputs);
      },
      { allowSignalWrites: true }
    );

    this.destroyRef.onDestroy(() => {
      this.createdScenarioInjector?.destroy();
    });
  }

  private computeScenarioIdFromUrl(): string | null {
    const segments = this.urlSegments();
    const raw = segments.map((s) => s.path).join('/');
    const cleaned = raw.replace(/^\/+/, '').replace(/\/+$/, '');
    return cleaned.length > 0 ? cleaned : null;
  }

  private resetScenarioInjector(): void {
    this.createdScenarioInjector?.destroy();
    this.createdScenarioInjector = null;
    this.scenarioInjector.set(this.parentInjector);
  }

  private createScenarioInjector(scenario: ScenarioDefinition): void {
    this.createdScenarioInjector?.destroy();

    const providers = scenario.providers ?? [];
    this.createdScenarioInjector = createEnvironmentInjector(providers, this.parentInjector);
    this.scenarioInjector.set(this.createdScenarioInjector);
  }

  private async loadScenarioById(id: string | null): Promise<void> {
    if (!id) {
      this.scenario.set(undefined);
      this.scenarioComponent.set(null);
      this.scenarioInputs.set({});
      this.resetScenarioInjector();
      return;
    }

    const registry = loadScenarioRegistry();

    this.scenarioLoading.set(true);
    try {
      const scenario = await registry.loadScenarioById(id);
      this.errorState.clear();

      this.scenario.set(scenario);

      // Each scenario gets its own child environment injector so scenario-scoped providers
      // and providedIn:'any' services are isolated from other scenarios.
      this.createScenarioInjector(scenario);

      if (!scenario.component) {
        throw new Error(
          `Scenario '${id}' is missing component loader. Did you run the registry generator?`
        );
      }

      const componentType = await scenario.component();
      this.scenarioComponent.set(componentType);
    } catch (err) {
      this.errorState.setError(err);
      this.scenario.set(undefined);
      this.scenarioComponent.set(null);
      this.scenarioInputs.set({});
      this.resetScenarioInjector();
    } finally {
      this.scenarioLoading.set(false);
    }
  }

  private parseInputsFromQueryParams(
    scenario: ScenarioDefinition,
    paramMap: ParamMap
  ): Record<string, unknown> {
    const defaults = scenario.inputs ?? {};
    const parsed: Record<string, unknown> = { ...defaults };

    const metadata = this.registryMetadata();
    const scenarioMeta = metadata?.scenarios.find((s) => s.id === scenario.id);

    for (const key of paramMap.keys) {
      const value = paramMap.get(key);
      if (value == null) continue;

      const inputMeta = scenarioMeta?.inputs?.[key];
      parsed[key] = deserializeWithCodecs(value, inputMeta?.tsType);
    }

    return parsed;
  }

  private async loadMetadata(): Promise<void> {
    try {
      const res = await fetch('/registry.metadata.json');
      if (!res.ok) return;
      const json: unknown = await res.json();
      if (isRegistryMetadata(json)) {
        this.registryMetadata.set(json);
      }
    } catch {
      // Optional: codecs fall back to best-effort heuristics.
    }
  }
}

function isRegistryMetadata(value: unknown): value is RegistryMetadata {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  const scenarios = record['scenarios'];
  if (!Array.isArray(scenarios)) return false;

  return scenarios.every((scenario) => {
    if (typeof scenario !== 'object' || scenario === null) return false;
    const scenarioRecord = scenario as Record<string, unknown>;
    return typeof scenarioRecord['id'] === 'string';
  });
}
