# Documentation Generation Scripts

This folder contains scripts for auto-generating documentation from source code.

## Component API Extractor

`extract-component-api.mjs` parses Angular component files to extract API documentation from JSDoc comments.

### What it extracts

- **Inputs**: Property name, type, default value, JSDoc description
- **Outputs**: Property name, type, JSDoc description
- Component class name and selector

### Usage

```bash
# From workspace root
node scripts/docs/extract-component-api.mjs

# Or using Nx
npx nx generate-docs ui-components
```

### Output

Generates `apps/showcase/src/generated/component-api.generated.ts` containing:

```typescript
export const TextInputApi: ComponentApi = {
  className: 'CoarTextInputComponent',
  selector: 'coar-text-input',
  inputs: [
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Label text displayed above the input',
      required: false,
    },
    // ...
  ],
  outputs: [
    {
      name: 'valueChange',
      type: 'string',
      description: 'Emits when input value changes',
    },
    // ...
  ],
};
```

### Using in Showcase

Import the generated API in showcase pages:

```typescript
import { TextInputApi, PasswordInputApi } from '../../../generated/component-api.generated';

export class TextInputPage {
  apiProperties = TextInputApi.inputs;
  apiOutputs = TextInputApi.outputs;
}
```

### Writing Good JSDoc

For descriptions to appear in the generated API:

```typescript
/** Label text displayed above the input */
label = input<string>('');

/** Input size - matches button/checkbox sizes for consistent layouts */
size = input<CoarInputSize>('md');

/** Emits when input value changes */
valueChange = output<string>();
```

### When to Regenerate

Run the script after:
- Adding new inputs/outputs to components
- Updating JSDoc descriptions
- Adding new components

The generated file is committed to the repository so the showcase always has up-to-date API docs.
