import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogosTabComponent } from './logos-tab.component';
import { SettingsService } from '../../settings.service';

describe('LogosTabComponent', () => {
  let fixture: ComponentFixture<LogosTabComponent>;
  let component: LogosTabComponent;
  let settingsService: SettingsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogosTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LogosTabComponent);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a translated, human-readable error (not the raw service error code) when the upload is rejected', () => {
    // NOT_IMAGE se rechaza de forma síncrona en SettingsService.uploadLogo(),
    // antes de tocar el FileReader, así que no hace falta esperar un tick.
    const notAnImage = new File(['hola'], 'archivo.txt', { type: 'text/plain' });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [notAnImage] });

    component.onLogoSelected({ target: input } as unknown as Event, 'favicon');
    expect(component.errorMessage()).toBe('El archivo debe ser una imagen.');

    settingsService.updateDraft({ language: 'en' });
    component.onLogoSelected({ target: input } as unknown as Event, 'favicon');
    expect(component.errorMessage()).toBe('The file must be an image.');
  });
});
