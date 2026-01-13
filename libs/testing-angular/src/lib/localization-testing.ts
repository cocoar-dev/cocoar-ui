export interface CoarNumberFormatConfig {
  readonly decimal: string;
  readonly thousand: string;
}

export interface CoarDateFormatConfig {
  readonly pattern: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  readonly firstDayOfWeek: 1 | 7;
}

export interface CoarLocalizationConfig {
  readonly number: CoarNumberFormatConfig;
  readonly date: CoarDateFormatConfig;
}

export interface CoarLocalizationServiceLike {
  getNumberFormat(locale?: string): CoarNumberFormatConfig;
  getDateFormat(locale?: string): CoarDateFormatConfig;
  getDefaultLocale(): string;
  setDefaultLocale(locale: string): void;
  registerLocale(id: string, config: Partial<CoarLocalizationConfig>): void;
}

export interface CreateCoarLocalizationServiceStubOptions {
  defaultLocale?: string;
  number?: Partial<CoarNumberFormatConfig>;
  date?: Partial<CoarDateFormatConfig>;
}

export function createCoarLocalizationServiceStub(
  options: CreateCoarLocalizationServiceStubOptions = {}
): CoarLocalizationServiceLike {
  const customLocales = new Map<string, CoarLocalizationConfig>();
  let defaultLocale = options.defaultLocale ?? 'en-US';

  const defaultConfig: CoarLocalizationConfig = {
    number: {
      decimal: options.number?.decimal ?? '.',
      thousand: options.number?.thousand ?? ',',
    },
    date: {
      pattern: options.date?.pattern ?? 'dd.mm.yyyy',
      firstDayOfWeek: options.date?.firstDayOfWeek ?? 1,
    },
  };

  return {
    getDefaultLocale() {
      return defaultLocale;
    },
    setDefaultLocale(locale: string) {
      defaultLocale = locale;
    },
    registerLocale(id: string, config: Partial<CoarLocalizationConfig>) {
      const current = customLocales.get(id) ?? defaultConfig;
      customLocales.set(id, {
        number: config.number ?? current.number,
        date: config.date ?? current.date,
      });
    },
    getNumberFormat(locale?: string) {
      const target = locale ?? defaultLocale;
      return customLocales.get(target)?.number ?? defaultConfig.number;
    },
    getDateFormat(locale?: string) {
      const target = locale ?? defaultLocale;
      return customLocales.get(target)?.date ?? defaultConfig.date;
    },
  };
}
