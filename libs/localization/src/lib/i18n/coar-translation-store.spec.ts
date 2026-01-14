import { describe, it, expect } from 'vitest';
import { CoarTranslationStore } from './coar-translation-store';

describe('CoarTranslationStore', () => {
  describe('setTranslations', () => {
    it('should store flat translations', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', {
        hello: 'Hello',
        goodbye: 'Goodbye',
      });

      expect(store.getTranslation('en', 'hello')).toBe('Hello');
      expect(store.getTranslation('en', 'goodbye')).toBe('Goodbye');
    });

    it('should flatten nested translations into dot notation', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', {
        app: {
          title: 'My App',
          subtitle: 'Welcome',
        },
        nav: {
          home: 'Home',
          settings: 'Settings',
        },
      });

      expect(store.getTranslation('en', 'app.title')).toBe('My App');
      expect(store.getTranslation('en', 'app.subtitle')).toBe('Welcome');
      expect(store.getTranslation('en', 'nav.home')).toBe('Home');
      expect(store.getTranslation('en', 'nav.settings')).toBe('Settings');
    });

    it('should flatten deeply nested translations', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', {
        app: {
          pages: {
            login: {
              title: 'Login',
              form: {
                username: 'Username',
                password: 'Password',
              },
            },
          },
        },
      });

      expect(store.getTranslation('en', 'app.pages.login.title')).toBe('Login');
      expect(store.getTranslation('en', 'app.pages.login.form.username')).toBe('Username');
      expect(store.getTranslation('en', 'app.pages.login.form.password')).toBe('Password');
    });

    it('should handle mixed flat and nested translations', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', {
        hello: 'Hello',
        app: {
          title: 'My App',
        },
        goodbye: 'Goodbye',
      });

      expect(store.getTranslation('en', 'hello')).toBe('Hello');
      expect(store.getTranslation('en', 'app.title')).toBe('My App');
      expect(store.getTranslation('en', 'goodbye')).toBe('Goodbye');
    });

    it('should skip non-string values in nested objects', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', {
        app: {
          title: 'My App',
          count: 42, // number - should be skipped
          enabled: true, // boolean - should be skipped
          tags: ['a', 'b'], // array - should be skipped
        },
      });

      expect(store.getTranslation('en', 'app.title')).toBe('My App');
      expect(store.getTranslation('en', 'app.count')).toBeUndefined();
      expect(store.getTranslation('en', 'app.enabled')).toBeUndefined();
      expect(store.getTranslation('en', 'app.tags')).toBeUndefined();
    });

    it('should replace existing translations', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', { hello: 'Hello' });
      expect(store.getTranslation('en', 'hello')).toBe('Hello');

      store.setTranslations('en', { hello: 'Hi' });
      expect(store.getTranslation('en', 'hello')).toBe('Hi');
    });
  });

  describe('updateTranslations', () => {
    it('should merge flat translations without replacing existing keys', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', {
        hello: 'Hello',
        goodbye: 'Goodbye',
      });

      store.updateTranslations('en', {
        hello: 'Hi',
        welcome: 'Welcome',
      });

      expect(store.getTranslation('en', 'hello')).toBe('Hi'); // updated
      expect(store.getTranslation('en', 'goodbye')).toBe('Goodbye'); // kept
      expect(store.getTranslation('en', 'welcome')).toBe('Welcome'); // added
    });

    it('should flatten nested translations when updating', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', {
        'app.title': 'Old Title',
        'app.subtitle': 'Old Subtitle',
      });

      store.updateTranslations('en', {
        app: {
          title: 'New Title',
        },
      });

      expect(store.getTranslation('en', 'app.title')).toBe('New Title');
      expect(store.getTranslation('en', 'app.subtitle')).toBe('Old Subtitle'); // kept
    });

    it('should create language if it does not exist', () => {
      const store = new CoarTranslationStore();

      expect(store.hasLanguage('de')).toBe(false);

      store.updateTranslations('de', { hello: 'Hallo' });

      expect(store.hasLanguage('de')).toBe(true);
      expect(store.getTranslation('de', 'hello')).toBe('Hallo');
    });
  });

  describe('setTranslation', () => {
    it('should set single translation key', () => {
      const store = new CoarTranslationStore();

      store.setTranslation('en', 'hello', 'Hello');

      expect(store.getTranslation('en', 'hello')).toBe('Hello');
    });

    it('should update existing key', () => {
      const store = new CoarTranslationStore();

      store.setTranslation('en', 'hello', 'Hello');
      store.setTranslation('en', 'hello', 'Hi');

      expect(store.getTranslation('en', 'hello')).toBe('Hi');
    });

    it('should create language if it does not exist', () => {
      const store = new CoarTranslationStore();

      store.setTranslation('fr', 'hello', 'Bonjour');

      expect(store.hasLanguage('fr')).toBe(true);
      expect(store.getTranslation('fr', 'hello')).toBe('Bonjour');
    });
  });

  describe('getTranslations', () => {
    it('should return all translations for a language', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', {
        hello: 'Hello',
        goodbye: 'Goodbye',
      });

      const translations = store.getTranslations('en');
      expect(translations).toBeDefined();
      expect(translations?.get('hello')).toBe('Hello');
      expect(translations?.get('goodbye')).toBe('Goodbye');
    });

    it('should return undefined for non-existent language', () => {
      const store = new CoarTranslationStore();

      expect(store.getTranslations('unknown')).toBeUndefined();
    });
  });

  describe('hasLanguage', () => {
    it('should return true for loaded languages', () => {
      const store = new CoarTranslationStore();

      store.setTranslations('en', { hello: 'Hello' });

      expect(store.hasLanguage('en')).toBe(true);
    });

    it('should return false for non-loaded languages', () => {
      const store = new CoarTranslationStore();

      expect(store.hasLanguage('de')).toBe(false);
    });
  });

  describe('loadedLanguages signal', () => {
    it('should be reactive to language additions', () => {
      const store = new CoarTranslationStore();

      expect(store.loadedLanguages().size).toBe(0);

      store.setTranslations('en', { hello: 'Hello' });
      expect(store.loadedLanguages().size).toBe(1);
      expect(store.loadedLanguages().has('en')).toBe(true);

      store.setTranslations('de', { hello: 'Hallo' });
      expect(store.loadedLanguages().size).toBe(2);
      expect(store.loadedLanguages().has('de')).toBe(true);
    });
  });
});
