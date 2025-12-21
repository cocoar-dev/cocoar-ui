import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  NgZone,
  Type,
  ViewChild,
  ViewContainerRef,
  createEnvironmentInjector,
  effect,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { SCENARIO_REGISTRY, ScenarioEntry } from './scenario-registry';
import { SCENARIO_SKIP } from './scenario-parsers';

@Component({
  selector: 'app-scenario-host-page',
  templateUrl: './scenario-host.page.html',
  styleUrl: './scenario-host.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarioHostPage implements AfterViewInit {
  @ViewChild('outlet', { read: ViewContainerRef, static: true })
  private readonly outlet!: ViewContainerRef;

  @ViewChild('preview', { read: ElementRef, static: true })
  private readonly preview!: ElementRef<HTMLElement>;

  protected readonly status = signal<'loading' | 'ready' | 'not-found' | 'error'>('loading');
  protected readonly activeId = signal<string>('');

  protected readonly lastError = signal<string | null>(null);

  private activeEntry = signal<ScenarioEntry | null>(null);
  private activeComponent = signal<Type<unknown> | null>(null);
  private activeInputs = signal<Record<string, unknown>>({});

  private remountScheduled = false;

  private readonly destroyRef: DestroyRef;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly environmentInjector: EnvironmentInjector,
    private readonly ngZone: NgZone,
    destroyRef: DestroyRef
  ) {
    this.destroyRef = destroyRef;

    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        map(([params, query]) => {
          const id = params.get('id') ?? '';
          return { id, query };
        }),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(({ id, query }) => {
        this.activeId.set(id);
        const entry = SCENARIO_REGISTRY[id];
        if (!entry) {
          this.activeEntry.set(null);
          this.activeComponent.set(null);
          this.activeInputs.set({});
          this.status.set('not-found');
          return;
        }

        this.activeEntry.set(entry);
        this.activeInputs.set(this.parseInputs(entry, query));
        void this.loadComponent(entry);
      });

    effect(() => {
      const entry = this.activeEntry();
      const componentType = this.activeComponent();
      const inputs = this.activeInputs();
      if (!entry || !componentType) return;
      this.mount(entry, componentType, inputs);
    });
  }

  ngAfterViewInit(): void {
    // CSS-only HMR updates may clear the dynamically created view without triggering
    // Angular change detection. Observe the preview container and remount if needed.
    const observer = new MutationObserver(() => {
      this.scheduleRemountIfEmpty();
    });

    observer.observe(this.preview.nativeElement, { childList: true, subtree: true });
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private scheduleRemountIfEmpty(): void {
    if (this.remountScheduled) return;
    if (this.status() !== 'ready') return;
    if (this.outlet.length > 0) return;

    this.remountScheduled = true;
    queueMicrotask(() => {
      this.remountScheduled = false;
      if (this.status() !== 'ready') return;
      if (this.outlet.length > 0) return;

      const entry = this.activeEntry();
      const componentType = this.activeComponent();
      if (!entry || !componentType) return;

      // Ensure we re-enter Angular for view manipulation.
      this.ngZone.run(() => {
        this.mount(entry, componentType, this.activeInputs());
      });
    });
  }

  private parseInputs(
    entry: ScenarioEntry,
    query: import('@angular/router').ParamMap
  ): Record<string, unknown> {
    const parsed: Record<string, unknown> = {};
    if (!entry.inputs) return parsed;
    for (const [key, parser] of Object.entries(entry.inputs)) {
      const raw = query.get(key);
      if (raw === null) continue;
      const value = parser(raw);
      if (value === SCENARIO_SKIP) continue;
      parsed[key] = value;
    }
    return parsed;
  }

  private async loadComponent(entry: ScenarioEntry) {
    this.status.set('loading');
    this.lastError.set(null);
    try {
      const componentType = await entry.loadComponent();
      this.activeComponent.set(componentType);
      this.status.set('ready');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.lastError.set(message);
      this.activeComponent.set(null);
      this.status.set('error');
    }
  }

  private mount(
    entry: ScenarioEntry,
    componentType: Type<unknown>,
    inputs: Record<string, unknown>
  ) {
    try {
      this.outlet.clear();

      const environmentInjector = entry.providers?.length
        ? createEnvironmentInjector(entry.providers, this.environmentInjector)
        : undefined;

      const componentRef = this.outlet.createComponent(componentType, {
        environmentInjector,
      });

      // Apply inputs in an Angular-friendly way.
      for (const [key, value] of Object.entries(inputs)) {
        componentRef.setInput(key, value);
      }
      componentRef.changeDetectorRef.detectChanges();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.lastError.set(message);
      this.activeComponent.set(null);
      this.status.set('error');
    }
  }
}
