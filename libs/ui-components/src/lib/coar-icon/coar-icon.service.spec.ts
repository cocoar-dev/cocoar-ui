import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { CoarIconService } from './coar-icon.service';
import {
  provideCoarDefaultIconSource,
  provideCoarHttpIconSource,
  provideCoarIconMapSource,
  provideCoarIconSource,
} from './coar-icon-registry';

(
  globalThis as typeof globalThis & {
    __coarUiComponentsDisableDefaultIconRegistry?: boolean;
  }
).__coarUiComponentsDisableDefaultIconRegistry = true;

describe('CoarIconService', () => {
  it('should be created', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CoarIconService],
    });

    const service = TestBed.inject(CoarIconService);
    expect(service).toBeTruthy();
  });

  describe('getIcon - source configuration', () => {
    it('should throw if no source is configured', () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), CoarIconService],
      });

      const service = TestBed.inject(CoarIconService);
      expect(() => service.getIcon('anything')).toThrow(/No Coar icon source is configured/i);
    });

    it('should use first provided source as default', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarIconMapSource({ key: 'first', icons: { a: '<svg>a</svg>' } }),
          provideCoarIconMapSource({ key: 'second', icons: { a: '<svg>second</svg>' } }),
          CoarIconService,
        ],
      });

      const localService = TestBed.inject(CoarIconService);
      const svg = await firstValueFrom(localService.getIcon('a'));
      expect(svg).toBe('<svg>a</svg>');
    });

    it('should allow selecting a specific source by key', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarIconMapSource({ key: 'first', icons: { a: '<svg>a</svg>' } }),
          provideCoarIconMapSource({ key: 'second', icons: { a: '<svg>second</svg>' } }),
          CoarIconService,
        ],
      });

      const localService = TestBed.inject(CoarIconService);
      const svg = await firstValueFrom(localService.getIcon('a', 'second'));
      expect(svg).toBe('<svg>second</svg>');
    });

    it('should allow overriding the default source key (last wins)', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarIconMapSource({ key: 'first', icons: { a: '<svg>a</svg>' } }),
          provideCoarIconMapSource({ key: 'second', icons: { a: '<svg>second</svg>' } }),
          provideCoarDefaultIconSource('first'),
          provideCoarDefaultIconSource('second'),
          CoarIconService,
        ],
      });

      const localService = TestBed.inject(CoarIconService);
      const svg = await firstValueFrom(localService.getIcon('a'));
      expect(svg).toBe('<svg>second</svg>');
    });

    it('should throw when a provided default source key does not exist', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarIconMapSource({ key: 'only', icons: {} }),
          provideCoarDefaultIconSource('missing'),
          CoarIconService,
        ],
      });

      const localService = TestBed.inject(CoarIconService);
      expect(() => localService.getIcon('a')).toThrow(/Default Coar icon source key/i);
    });
  });

  describe('source introspection', () => {
    it('should list registered sources with default + capability flags', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarIconMapSource({ key: 'first', icons: { a: '<svg>a</svg>' } }),
          provideCoarIconSource({
            key: 'custom-no-keys',
            source: {
              getIcon: () => of(null),
            },
          }),
          CoarIconService,
        ],
      });

      const service = TestBed.inject(CoarIconService);
      expect(service.getRegisteredSources()).toEqual([
        { key: 'first', isDefault: true, canProvideIconKeys: true },
        { key: 'custom-no-keys', isDefault: false, canProvideIconKeys: false },
      ]);
    });

    it('should return available icon keys for sources that provide them', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarIconMapSource({
            key: 'map',
            icons: {
              z: '<svg>z</svg>',
              a: '<svg>a</svg>',
            },
          }),
          CoarIconService,
        ],
      });

      const service = TestBed.inject(CoarIconService);
      const keys = await firstValueFrom(service.getAvailableIconKeys('map'));
      expect(keys).toEqual(['a', 'z']);
    });

    it('should throw if a source does not support listing icon keys', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarIconSource({
            key: 'custom',
            source: {
              getIcon: () => of(null),
            },
          }),
          CoarIconService,
        ],
      });

      const service = TestBed.inject(CoarIconService);
      expect(() => service.getAvailableIconKeys('custom')).toThrow(
        /does not support listing available icon keys/i
      );
    });
  });

  describe('getIcon - http source', () => {
    it('should fetch and cache icons via http source', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarHttpIconSource({
            key: 'http',
            getUrl: (name) => `/api/icons/${name}.svg`,
          }),
          CoarIconService,
        ],
      });

      const localService = TestBed.inject(CoarIconService);
      const localHttpMock = TestBed.inject(HttpTestingController);

      const promise1 = firstValueFrom(localService.getIcon('myIcon', 'http'));
      const req1 = localHttpMock.expectOne('/api/icons/myIcon.svg');
      req1.flush('<svg>one</svg>');
      const svg1 = await promise1;
      expect(svg1).toBe('<svg>one</svg>');

      const svg2 = await firstValueFrom(localService.getIcon('myIcon', 'http'));
      expect(svg2).toBe('<svg>one</svg>');
      localHttpMock.expectNone('/api/icons/myIcon.svg');

      localHttpMock.verify();
    });

    it('should optionally provide and cache available icon keys for http sources', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCoarHttpIconSource({
            key: 'http',
            getUrl: (name) => `/api/icons/${name}.svg`,
            getAvailableIconKeys: (http) => http.get<readonly string[]>('/api/icons/index'),
          }),
          CoarIconService,
        ],
      });

      const service = TestBed.inject(CoarIconService);
      const httpMock = TestBed.inject(HttpTestingController);

      const promise1 = firstValueFrom(service.getAvailableIconKeys('http'));
      const req1 = httpMock.expectOne('/api/icons/index');
      req1.flush(['a', 'b']);
      const keys1 = await promise1;
      expect(keys1).toEqual(['a', 'b']);

      const keys2 = await firstValueFrom(service.getAvailableIconKeys('http'));
      expect(keys2).toEqual(['a', 'b']);
      httpMock.expectNone('/api/icons/index');

      httpMock.verify();
    });
  });
});
