import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SettingsService } from './settings.service';
import { ToastService } from '../shared/toast/toast.service';
import { TranslatePipe } from '../shared/i18n/translate.pipe';
import { TranslationService } from '../shared/i18n/translation.service';
import { AppearanceTabComponent } from './tabs/appearance-tab/appearance-tab.component';
import { LogosTabComponent } from './tabs/logos-tab/logos-tab.component';
import { LanguageTabComponent } from './tabs/language-tab/language-tab.component';
import { AccessibilityTabComponent } from './tabs/accessibility-tab/accessibility-tab.component';
import { PreferencesTabComponent } from './tabs/preferences-tab/preferences-tab.component';
import { AboutTabComponent } from './tabs/about-tab/about-tab.component';

export type SettingsTabId = 'apariencia' | 'logos' | 'idioma' | 'accesibilidad' | 'preferencias' | 'acerca';

interface SettingsTabDef {
  id: SettingsTabId;
  labelKey: string;
  icon: string;
}

/**
 * Contenedor de la vista de Configuración: encabezado, tabs y footer con el
 * indicador de cambios sin guardar. El estado real vive en `SettingsService`
 * (borrador/guardado compartidos por toda la app); este componente solo
 * coordina la navegación entre pestañas y las acciones de Guardar/Restablecer,
 * que piden confirmación con el mismo patrón de diálogo que "Eliminar" y
 * "Cambio de estado" en Usuarios, porque son ajustes globales para todos los
 * usuarios de la plataforma.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    AppearanceTabComponent,
    LogosTabComponent,
    LanguageTabComponent,
    AccessibilityTabComponent,
    PreferencesTabComponent,
    AboutTabComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toastService = inject(ToastService);
  private readonly translationService = inject(TranslationService);

  readonly isDirty = this.settingsService.isDirty;
  readonly activeTab = signal<SettingsTabId>('apariencia');

  readonly pendingSave = signal(false);
  readonly pendingReset = signal(false);
  isSavePending = false;

  readonly tabs: SettingsTabDef[] = [
    { id: 'apariencia', labelKey: 'settings.tab.apariencia', icon: '◉' },
    { id: 'logos', labelKey: 'settings.tab.logos', icon: '▣' },
    { id: 'idioma', labelKey: 'settings.tab.idioma', icon: '◎' },
    { id: 'accesibilidad', labelKey: 'settings.tab.accesibilidad', icon: '✦' },
    { id: 'preferencias', labelKey: 'settings.tab.preferencias', icon: '≡' },
    { id: 'acerca', labelKey: 'settings.tab.acerca', icon: 'ⓘ' }
  ];

  selectTab(tab: SettingsTabId): void {
    this.activeTab.set(tab);
  }

  requestSave(): void {
    if (!this.isDirty()) {
      return;
    }
    this.pendingSave.set(true);
  }

  cancelSave(): void {
    this.pendingSave.set(false);
  }

  confirmSave(): void {
    this.isSavePending = true;
    this.settingsService.save().subscribe({
      next: () => {
        this.isSavePending = false;
        this.pendingSave.set(false);
        this.toastService.success(this.translationService.translate('settings.toastSaved'));
      },
      error: () => {
        this.isSavePending = false;
        this.pendingSave.set(false);
        this.toastService.error(this.translationService.translate('settings.toastSaveError'));
      }
    });
  }

  requestReset(): void {
    // A diferencia de "Guardar cambios", Restablecer siempre está habilitado:
    // vuelve el borrador a los valores de fábrica (no a lo guardado), sin
    // importar si ya había cambios pendientes.
    this.pendingReset.set(true);
  }

  cancelReset(): void {
    this.pendingReset.set(false);
  }

  confirmReset(): void {
    this.settingsService.reset();
    this.pendingReset.set(false);
    this.toastService.success(this.translationService.translate('settings.toastReset'));
  }
}
