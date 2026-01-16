import { describe, it, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { CoarIntlTranslationLoader } from './coar-intl-translation-loader';

describe('CoarIntlTranslationLoader', () => {
  let loader: CoarIntlTranslationLoader;

  beforeEach(() => {
    loader = new CoarIntlTranslationLoader();
  });

  it('should generate translations from Intl API', async () => {
    const translations = await firstValueFrom(loader.loadTranslations('en'));

    expect(translations).toBeDefined();
    expect(typeof translations).toBe('object');
  });

  describe('relative time translations', () => {
    it('should generate today/yesterday/tomorrow for English', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('en'));

      expect(translations['common.today']).toBe('today');
      expect(translations['common.yesterday']).toBe('yesterday');
      expect(translations['common.tomorrow']).toBe('tomorrow');
    });

    it('should generate heute/gestern/morgen for German', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('de'));

      expect(translations['common.today']).toBe('heute');
      expect(translations['common.yesterday']).toBe('gestern');
      expect(translations['common.tomorrow']).toBe('morgen');
    });

    it('should generate today in French', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('fr'));

      // Intl.RelativeTimeFormat returns "aujourd'hui" in French
      expect(translations['common.today']).toBeTruthy();
      expect(translations['common.today'].toLowerCase()).toContain('aujourd');
    });
  });

  describe('month translations', () => {
    it('should generate 12 full month names', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('en'));

      expect(translations['common.month.1']).toBe('January');
      expect(translations['common.month.6']).toBe('June');
      expect(translations['common.month.12']).toBe('December');
    });

    it('should generate 12 abbreviated month names', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('en'));

      expect(translations['common.month.short.1']).toBe('Jan');
      expect(translations['common.month.short.6']).toBe('Jun');
      expect(translations['common.month.short.12']).toBe('Dec');
    });

    it('should generate German month names', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('de'));

      expect(translations['common.month.1']).toBe('Januar');
      expect(translations['common.month.5']).toBe('Mai');
      expect(translations['common.month.10']).toBe('Oktober');
    });
  });

  describe('weekday translations', () => {
    it('should generate 7 full weekday names (Monday=1)', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('en'));

      expect(translations['common.weekday.1']).toBe('Monday');
      expect(translations['common.weekday.3']).toBe('Wednesday');
      expect(translations['common.weekday.7']).toBe('Sunday');
    });

    it('should generate 7 abbreviated weekday names', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('en'));

      expect(translations['common.weekday.short.1']).toBe('Mon');
      expect(translations['common.weekday.short.5']).toBe('Fri');
      expect(translations['common.weekday.short.7']).toBe('Sun');
    });

    it('should generate German weekday names', async () => {
      const translations = await firstValueFrom(loader.loadTranslations('de'));

      expect(translations['common.weekday.1']).toBe('Montag');
      expect(translations['common.weekday.3']).toBe('Mittwoch');
      expect(translations['common.weekday.7']).toBe('Sonntag');
    });
  });
});
