import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { SettingsService } from './settings.service';
import { ToastService } from '../shared/toast/toast.service';
import { TranslatePipe } from '../shared/i18n/translate.pipe';
import { TranslationService } from '../shared/i18n/translation.service';
import { LANGUAGE_OPTIONS, densityLabelKey, sizeLabelKey, themeLabelKey } from './settings.model';
import { AppearanceTabComponent } from './tabs/appearance-tab/appearance-tab.component';
import { LogosTabComponent } from './tabs/logos-tab/logos-tab.component';
import { LanguageTabComponent } from './tabs/language-tab/language-tab.component';
import { AccessibilityTabComponent } from './tabs/accessibility-tab/accessibility-tab.component';
import { PreferencesTabComponent } from './tabs/preferences-tab/preferences-tab.component';
import { AboutTabComponent } from './tabs/about-tab/about-tab.component';
import { DialogDirective } from '../shared/dialog/dialog.directive';

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
    AboutTabComponent,
    DialogDirective
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

  /**
   * Panel "Preview en vivo": vive aquí (no en app-appearance-tab) para que
   * quede fijo y visible sin importar la pestaña activa, en vez de
   * desmontarse cada vez que se sale de Apariencia.
   */
  readonly draft = this.settingsService.draft;
  readonly themeLabelKey = themeLabelKey;
  readonly densityLabelKey = densityLabelKey;
  readonly sizeLabelKey = sizeLabelKey;
  readonly previewBars = [40, 25, 55, 50, 75, 45, 60];
  readonly previewTableRows = [70, 55, 85];
  readonly languageFlag = computed(() => LANGUAGE_OPTIONS.find((lang) => lang.id === this.draft().language)?.flag ?? '');

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

  /** Patrón de pestañas: flechas izquierda/derecha, Inicio y Fin cambian de pestaña y mueven el foco. */
  onTabsKeydown(event: KeyboardEvent): void {
    const current = this.tabs.findIndex((tab) => tab.id === this.activeTab());
    const last = this.tabs.length - 1;
    const next =
      event.key === 'ArrowRight' ? (current === last ? 0 : current + 1) :
      event.key === 'ArrowLeft' ? (current === 0 ? last : current - 1) :
      event.key === 'Home' ? 0 :
      event.key === 'End' ? last :
      -1;
    if (next < 0) {
      return;
    }

    event.preventDefault();
    const tab = this.tabs[next];
    this.selectTab(tab.id);
    setTimeout(() => document.getElementById(`settings-tab-${tab.id}`)?.focus());
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
    // al confirmar, restaura los valores de fábrica y los guarda de inmediato,
    // sin importar si ya había cambios pendientes (se descartan).
    this.pendingReset.set(true);
  }

  cancelReset(): void {
    this.pendingReset.set(false);
  }

  confirmReset(): void {
    this.settingsService.reset().subscribe({
      next: () => {
        this.pendingReset.set(false);
        this.toastService.success(this.translationService.translate('settings.toastReset'));
      },
      error: () => {
        this.pendingReset.set(false);
        this.toastService.error(this.translationService.translate('settings.toastSaveError'));
      }
    });
  }
}
