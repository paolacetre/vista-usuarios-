import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { SettingsService } from '../../settings/settings.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let settingsService: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
    settingsService = TestBed.inject(SettingsService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should translate to Spanish by default', () => {
    expect(service.translate('nav.usuarios')).toBe('Usuarios');
  });

  it('should follow SettingsService.draft().language live, without needing to save', () => {
    settingsService.updateDraft({ language: 'en' });
    expect(service.translate('nav.usuarios')).toBe('Users');
    expect(service.translate('nav.perfil')).toBe('Profile');

    settingsService.updateDraft({ language: 'pt' });
    expect(service.translate('nav.usuarios')).toBe('Usuários');

    settingsService.updateDraft({ language: 'es' });
    expect(service.translate('nav.usuarios')).toBe('Usuarios');
  });

  it('should revert translations when the draft is discarded without saving', () => {
    settingsService.updateDraft({ language: 'en' });
    expect(service.translate('nav.perfil')).toBe('Profile');

    settingsService.discardDraft();
    expect(service.translate('nav.perfil')).toBe('Perfil');
  });

  it('should fall back to the key itself for an unknown translation key', () => {
    expect(service.translate('this.key.does.not.exist')).toBe('this.key.does.not.exist');
  });
});
