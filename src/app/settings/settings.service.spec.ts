import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { DEFAULT_SETTINGS } from './settings.model';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.removeItem('tdo_system_config');
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should preload the real brand logo assets as factory defaults instead of empty slots', () => {
    expect(DEFAULT_SETTINGS.logos.principal).toBe('/assets/logos/logo-principal.png');
    expect(DEFAULT_SETTINGS.logos.login).toBe('/assets/logos/logo-login.png');
    expect(DEFAULT_SETTINGS.logos.favicon).toBe('/assets/logos/favicon.png');
    expect(service.draft().logos.principal).toBe('/assets/logos/logo-principal.png');
  });

  it('should reject an uploaded SVG containing an embedded <script> tag', (done) => {
    const maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
    const file = new File([maliciousSvg], 'evil.svg', { type: 'image/svg+xml' });

    service.uploadLogo(file, 'principal').subscribe({
      next: () => fail('should not accept an SVG with an embedded <script> tag'),
      error: (error: Error) => {
        expect(error.message).toBe('UNSAFE_SVG');
        done();
      }
    });
  });

  it('should reject an uploaded SVG containing an inline event handler', (done) => {
    const maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle r="1"/></svg>';
    const file = new File([maliciousSvg], 'evil.svg', { type: 'image/svg+xml' });

    service.uploadLogo(file, 'favicon').subscribe({
      next: () => fail('should not accept an SVG with an inline event handler'),
      error: (error: Error) => {
        expect(error.message).toBe('UNSAFE_SVG');
        done();
      }
    });
  });

  it('should accept a clean uploaded SVG and store it as a data URL on the draft', (done) => {
    const safeSvg = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>';
    const file = new File([safeSvg], 'logo.svg', { type: 'image/svg+xml' });

    service.uploadLogo(file, 'login').subscribe({
      next: (url) => {
        expect(url).toContain('data:image/svg+xml');
        expect(service.draft().logos.login).toBe(url);
        done();
      },
      error: () => fail('a clean SVG should be accepted')
    });
  });

  it('should still reject non-image files and files over 2MB regardless of SVG scanning', (done) => {
    const notAnImage = new File(['hola'], 'archivo.txt', { type: 'text/plain' });

    service.uploadLogo(notAnImage, 'favicon').subscribe({
      next: () => fail('should not accept a non-image file'),
      error: (error: Error) => {
        expect(error.message).toBe('NOT_IMAGE');
        done();
      }
    });
  });
});
