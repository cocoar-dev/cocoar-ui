import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CoarIconService } from './coar-icon.service';

describe('CoarIconService', () => {
  let service: CoarIconService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CoarIconService],
    });

    service = TestBed.inject(CoarIconService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getIcon - built-in icons', () => {
    it('should return built-in icon for known icon name', async () => {
      const svg = await firstValueFrom(service.getIcon('x'));
      expect(svg).toBeTruthy();
      expect(svg).toContain('<svg');
    });

    it('should return null for unknown built-in icon', async () => {
      const svg = await firstValueFrom(service.getIcon('nonexistent-icon-name-12345'));
      expect(svg).toBeNull();
    });
  });

  describe('getIcon - customer icons', () => {
    it('should fetch customer icon from API', async () => {
      const mockSvg = '<svg><circle /></svg>';

      const promise = firstValueFrom(service.getIcon('customer:myIcon'));

      const req = httpMock.expectOne('/api/icons/myIcon.svg');
      expect(req.request.method).toBe('GET');
      req.flush(mockSvg);

      const svg = await promise;
      expect(svg).toBe(mockSvg);
    });

    it('should cache customer icon after first request', async () => {
      const mockSvg = '<svg><rect /></svg>';

      // First request
      const promise1 = firstValueFrom(service.getIcon('customer:cachedIcon'));

      // Flush the single HTTP request
      const req = httpMock.expectOne('/api/icons/cachedIcon.svg');
      req.flush(mockSvg);

      const svg1 = await promise1;
      expect(svg1).toBe(mockSvg);

      // Second request should use cache (no new HTTP request)
      const svg2 = await firstValueFrom(service.getIcon('customer:cachedIcon'));
      expect(svg2).toBe(mockSvg);
    });

    it('should return null when customer icon fetch fails', async () => {
      const promise = firstValueFrom(service.getIcon('customer:failingIcon'));

      const req = httpMock.expectOne('/api/icons/failingIcon.svg');
      req.error(new ErrorEvent('Network error'));

      const svg = await promise;
      expect(svg).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear the customer icon cache', async () => {
      const mockSvg = '<svg><path /></svg>';

      // First request - creates cache entry
      const promise1 = firstValueFrom(service.getIcon('customer:clearableIcon'));
      const req1 = httpMock.expectOne('/api/icons/clearableIcon.svg');
      req1.flush(mockSvg);
      await promise1;

      // Clear cache
      service.clearCache();

      // Next request should fetch again
      const promise2 = firstValueFrom(service.getIcon('customer:clearableIcon'));
      const req2 = httpMock.expectOne('/api/icons/clearableIcon.svg');
      req2.flush(mockSvg);

      const svg = await promise2;
      expect(svg).toBe(mockSvg);
    });
  });

  describe('clearIconCache', () => {
    it('should clear specific customer icon from cache', async () => {
      const mockSvg1 = '<svg>1</svg>';
      const mockSvg2 = '<svg>2</svg>';

      // Request first icon
      const p1 = firstValueFrom(service.getIcon('customer:icon1'));
      const req1 = httpMock.expectOne('/api/icons/icon1.svg');
      req1.flush(mockSvg1);
      await p1;

      // Request second icon
      const p2 = firstValueFrom(service.getIcon('customer:icon2'));
      const req2 = httpMock.expectOne('/api/icons/icon2.svg');
      req2.flush(mockSvg2);
      await p2;

      // Clear only icon1
      service.clearIconCache('customer:icon1');

      // Request icon1 again - should fetch
      const p3 = firstValueFrom(service.getIcon('customer:icon1'));
      const req3 = httpMock.expectOne('/api/icons/icon1.svg');
      req3.flush(mockSvg1);
      const svg3 = await p3;
      expect(svg3).toBe(mockSvg1);

      // Request icon2 again - should use cache (no new request)
      const svg4 = await firstValueFrom(service.getIcon('customer:icon2'));
      expect(svg4).toBe(mockSvg2);
    });

    it('should do nothing for built-in icons', () => {
      // Should not throw
      expect(() => service.clearIconCache('settings')).not.toThrow();
    });
  });

  describe('icon name parsing', () => {
    it('should handle built-in icon names without prefix', async () => {
      const svg = await firstValueFrom(service.getIcon('check'));
      expect(svg).toBeTruthy();
    });

    it('should handle customer icon names with prefix', async () => {
      const mockSvg = '<svg>customer</svg>';

      const promise = firstValueFrom(service.getIcon('customer:customName'));
      const req = httpMock.expectOne('/api/icons/customName.svg');
      req.flush(mockSvg);

      const svg = await promise;
      expect(svg).toBe(mockSvg);
    });
  });
});
