import { type Provider, type Type } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

export interface RenderCoarComponentOptions {
  imports?: Array<unknown>;
  providers?: Provider[];
  /** Optional initial component inputs (set before detectChanges). */
  inputs?: Record<string, unknown>;
  /** Runs `fixture.detectChanges()` automatically (default: true). */
  detectChanges?: boolean;
}

export async function renderCoarComponent<T>(
  component: Type<T>,
  options: RenderCoarComponentOptions = {}
): Promise<ComponentFixture<T>> {
  const detectChanges = options.detectChanges !== false;

  TestBed.configureTestingModule({
    imports: [component, ...(options.imports ?? [])],
    providers: options.providers ?? [],
  });

  await TestBed.compileComponents();

  const fixture = TestBed.createComponent(component);

  if (options.inputs) {
    Object.assign(fixture.componentRef.instance as object, options.inputs);
  }

  if (detectChanges) {
    fixture.detectChanges();
  }

  return fixture;
}
