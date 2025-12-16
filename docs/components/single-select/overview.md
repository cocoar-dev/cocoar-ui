# Single Select

Selector: `<coar-single-select>`

Use this component when a user must choose **exactly one** option from a list.

## Basic usage

```html
<coar-single-select
  label="Country"
  placeholder="Select a country..."
  [options]="countryOptions"
  [(value)]="selectedCountry"
/>
```

## Searchable

Enable search/filter for long option lists:

```html
<coar-single-select
  label="Country"
  [options]="countryOptions"
  [searchable]="true"
  searchPlaceholder="Search countries..."
  [(value)]="selectedCountry"
/>
```

## Object values and `compareWith`

If option values are objects, Angular will compare by reference by default. Provide `compareWith` to match by a stable key (e.g. `id`).

```ts
interface Country {
  id: number;
  code: string;
  name: string;
}

compareCountryById = (a: Country | null, b: Country | null) => a?.id === b?.id;
```

```html
<coar-single-select
  label="Country"
  [options]="countryOptions"
  [(value)]="selectedCountry"
  [compareWith]="compareCountryById"
/>
```
