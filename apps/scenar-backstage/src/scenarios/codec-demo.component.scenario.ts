import { Component, input } from '@angular/core';
import { defineScenario } from '@cocoar/scenar-abstractions';

/**
 * Demo component to showcase codec system with union types
 */
@Component({
  selector: 'scenar-codec-demo',
  standalone: true,
  template: `
    <div style="padding: 1rem; font-family: monospace;">
      <h2>Codec Demo - Union Type Handling</h2>

      <div style="margin-top: 1rem;">
        <strong>Union (string | Date | object):</strong>
        <pre>{{ formatValue(unionValue()) }}</pre>
        <small>Type: {{ getType(unionValue()) }}</small>
      </div>

      <div style="margin-top: 1rem;">
        <strong>Number or String:</strong>
        <pre>{{ formatValue(numberOrString()) }}</pre>
        <small>Type: {{ getType(numberOrString()) }}</small>
      </div>

      <div style="margin-top: 1rem;">
        <strong>Date or String:</strong>
        <pre>{{ formatValue(dateOrString()) }}</pre>
        <small>Type: {{ getType(dateOrString()) }}</small>
      </div>

      <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
        <h3>Test These URLs:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><code>?unionValue=2025-01-15T12:00:00.000Z</code> → Date</li>
          <li><code>?unionValue={{ '{' }}"key":"value"{{ '}' }}</code> → Object</li>
          <li><code>?unionValue=hello</code> → String</li>
          <li><code>?numberOrString=42</code> → Number</li>
          <li><code>?numberOrString=hello</code> → String</li>
          <li><code>?dateOrString=2025-01-15T12:00:00.000Z</code> → Date</li>
          <li><code>?dateOrString=hello</code> → String</li>
        </ul>
      </div>
    </div>
  `,
})
export class CodecDemoComponent {
  /**
   * Demonstrates union type deserialization
   * The codec system will try Date first, then object, then string
   */
  unionValue = input<string | Date | object>('default string');

  /**
   * Number or string - codec checks if value is numeric
   */
  numberOrString = input<number | string>('default');

  /**
   * Date or string - codec checks if value matches ISO date pattern
   */
  dateOrString = input<Date | string>('default');

  formatValue(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  getType(value: unknown): string {
    if (value instanceof Date) return 'Date';
    if (Array.isArray(value)) return 'Array';
    if (value === null) return 'null';
    return typeof value;
  }
}

/**
 * Scenario: Union type with Date (should deserialize as Date)
 */
export const unionAsDate = defineScenario<CodecDemoComponent>({
  id: 'demo/codec/union-date',
  title: 'Codec Demo / Union as Date',
  inputs: {
    unionValue: new Date('2025-01-15T12:00:00.000Z'),
    numberOrString: 42,
    dateOrString: new Date('2025-12-31T23:59:59.999Z'),
  }
});

/**
 * Scenario: Union type with object (should deserialize as object)
 */
export const unionAsObject = defineScenario<CodecDemoComponent>({
  id: 'demo/codec/union-object',
  title: 'Codec Demo / Union as Object',
  inputs: {
    unionValue: { key: 'value', nested: { prop: 123 } },
    numberOrString: 'not a number',
    dateOrString: 'just a string',
  }
});

/**
 * Scenario: Union type with string (should deserialize as string)
 */
export const unionAsString = defineScenario<CodecDemoComponent>({
  id: 'demo/codec/union-string',
  title: 'Codec Demo / Union as String',
  inputs: {
    unionValue: 'hello world',
    numberOrString: 'hello',
    dateOrString: 'hello',
  }
});
