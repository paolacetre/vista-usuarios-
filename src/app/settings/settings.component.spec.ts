import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';
import { ToastService } from '../shared/toast/toast.service';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settingsService: SettingsService;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not save or reset without confirmation, and should require the same confirm/cancel flow as delete/status change in Usuarios', () => {
    settingsService.updateDraft({ accentColor: '#ff00aa' });
    fixture.detectChanges();

    expect(component.isDirty()).toBeTrue();

    component.requestSave();
    fixture.detectChanges();
    expect(component.pendingSave()).toBeTrue();
    expect(settingsService.saved().accentColor).not.toBe('#ff00aa');

    component.cancelSave();
    expect(component.pendingSave()).toBeFalse();
    expect(settingsService.saved().accentColor).not.toBe('#ff00aa');

    component.requestSave();
    component.confirmSave();
    expect(component.pendingSave()).toBeFalse();
    expect(settingsService.saved().accentColor).toBe('#ff00aa');
    expect(component.isDirty()).toBeFalse();
  });

  it('should ask for confirmation before restoring defaults', () => {
    settingsService.updateDraft({ accentColor: '#00ffaa' });
    fixture.detectChanges();

    component.requestReset();
    expect(component.pendingReset()).toBeTrue();
    expect(settingsService.draft().accentColor).toBe('#00ffaa');

    component.confirmReset();
    expect(component.pendingReset()).toBeFalse();
    expect(settingsService.draft().accentColor).not.toBe('#00ffaa');
  });

  it('"Restablecer" should always be enabled (even with no pending changes) and reset the draft to factory defaults without touching "saved"', () => {
    // Simula una configuración ya guardada y distinta de los valores de fábrica.
    settingsService.updateDraft({ accentColor: '#123456' });
    settingsService.save().subscribe();
    fixture.detectChanges();

    expect(component.isDirty()).toBeFalse();

    const resetButton = fixture.nativeElement.querySelector('.secondary-btn') as HTMLButtonElement;
    expect(resetButton.disabled).toBeFalse();

    resetButton.click();
    fixture.detectChanges();
    expect(component.pendingReset()).toBeTrue();

    component.confirmReset();
    fixture.detectChanges();

    // El borrador vuelve a fábrica, no a lo guardado.
    expect(settingsService.draft().accentColor).toBe('#49b009');
    // Lo guardado no se toca hasta que se pulse "Guardar cambios".
    expect(settingsService.saved().accentColor).toBe('#123456');
    // Como fábrica != guardado, debe marcarse como cambios sin guardar.
    expect(component.isDirty()).toBeTrue();

    const saveButton = fixture.nativeElement.querySelector('.save-primary-btn') as HTMLButtonElement;
    expect(saveButton.disabled).toBeFalse();
  });

  it('should notify through ToastService instead of an @Output when saving and resetting', () => {
    spyOn(toastService, 'success');
    spyOn(toastService, 'error');

    settingsService.updateDraft({ accentColor: '#abcdef' });
    component.requestSave();
    component.confirmSave();
    expect(toastService.success).toHaveBeenCalledWith('Cambios guardados correctamente');

    component.requestReset();
    component.confirmReset();
    expect(toastService.success).toHaveBeenCalledWith('Configuración restablecida a los valores por defecto');

    expect(toastService.error).not.toHaveBeenCalled();
  });

  it('should translate the tab labels and footer status when the language setting changes', () => {
    const el = fixture.nativeElement as HTMLElement;
    const tabText = () => Array.from(el.querySelectorAll('.settings-tabs button')).map((btn) => btn.textContent?.trim());

    expect(tabText().some((text) => text?.includes('Apariencia'))).toBeTrue();
    expect(el.querySelector('.status-text span:last-child')?.textContent).toContain('Sin cambios pendientes');

    settingsService.updateDraft({ language: 'en' });
    fixture.detectChanges();

    expect(tabText().some((text) => text?.includes('Appearance'))).toBeTrue();
    expect(el.querySelector('.status-text span:last-child')?.textContent).toContain('unsaved changes');
  });
});
