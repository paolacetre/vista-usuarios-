import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../settings.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import {
  ACCENT_COLOR_PRESETS,
  DENSITY_OPTIONS,
  FONT_OPTIONS,
  FontOption,
  PRIMARY_COLOR_PRESETS,
  RADIUS_PRESETS,
  SIZE_PRESETS,
  THEME_OPTIONS,
  DensityOption
} from '../../settings.model';

@Component({
  selector: 'app-appearance-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './appearance-tab.component.html',
  styleUrl: './appearance-tab.component.scss'
})
export class AppearanceTabComponent {
  private readonly settings = inject(SettingsService);
  private readonly fb = inject(FormBuilder);

  readonly draft = this.settings.draft;

  readonly themeOptions = THEME_OPTIONS;
  readonly densityOptions = DENSITY_OPTIONS;
  readonly primaryPresets = PRIMARY_COLOR_PRESETS;
  readonly accentPresets = ACCENT_COLOR_PRESETS;
  readonly fontOptions = FONT_OPTIONS;
  readonly sizePresets = SIZE_PRESETS;
  readonly radiusPresets = RADIUS_PRESETS;

  showFontModal = false;
  showCustomPrimaryPicker = false;

  readonly previewBars = [40, 25, 55, 50, 75, 45, 60];
  readonly previewTableRows = [70, 55, 85];

  /**
   * Un único FormGroup reactivo por esta pestaña (theme/density/colores/
   * tipografía/tamaño/radio). Cada cambio se propaga al SettingsService, que
   * lo aplica en vivo a toda la interfaz vía ThemeService. Un `effect()`
   * mantiene el formulario sincronizado si el borrador cambia por fuera
   * (por ejemplo, al pulsar "Restablecer" en el footer).
   */
  readonly form = this.fb.nonNullable.group({
    theme: this.settings.draft().theme,
    density: this.settings.draft().density,
    primaryColor: this.settings.draft().primaryColor,
    accentColor: this.settings.draft().accentColor,
    fontFamily: this.settings.draft().fontFamily,
    fontSize: this.settings.draft().fontSize,
    borderRadius: this.settings.draft().borderRadius
  });

  constructor() {
    effect(() => {
      this.form.patchValue(this.settings.draft(), { emitEvent: false });
    });

    this.form.valueChanges.subscribe((value) => this.settings.updateDraft(value));
  }

  setDensity(density: DensityOption): void {
    this.form.controls.density.setValue(density);
  }

  setPrimaryColor(color: string): void {
    this.form.controls.primaryColor.setValue(color);
  }

  setAccentColor(color: string): void {
    this.form.controls.accentColor.setValue(color);
  }

  /** true cuando el color guardado no coincide con ninguno de los 9 swatches de marca. */
  isCustomPrimaryColor(): boolean {
    const current = this.form.controls.primaryColor.value.toLowerCase();
    return !this.primaryPresets.some((preset) => preset.color.toLowerCase() === current);
  }

  toggleCustomPrimaryPicker(): void {
    this.showCustomPrimaryPicker = !this.showCustomPrimaryPicker;
  }

  themeLabelKey(id: string): string {
    return id === 'oscuro' ? 'appearance.themeOscuro' : 'appearance.themeClaro';
  }

  densityLabelKey(id: DensityOption): string {
    if (id === 'compacta') return 'appearance.densityCompacta';
    if (id === 'amplia') return 'appearance.densityAmplia';
    return 'appearance.densityComoda';
  }

  sizeLabelKey(value: number): string {
    if (value <= 13) return 'appearance.sizePequeno';
    if (value <= 15) return 'appearance.sizeNormal';
    if (value <= 17) return 'appearance.sizeGrande';
    return 'appearance.sizeMuyGrande';
  }

  radiusLabelKey(value: number): string {
    if (value <= 4) return 'appearance.radiusRecto';
    if (value <= 8) return 'appearance.radiusSuave';
    if (value <= 12) return 'appearance.radiusRedondeado';
    return 'appearance.radiusPildora';
  }

  setFontSize(size: number): void {
    this.form.controls.fontSize.setValue(size);
  }

  setBorderRadius(radius: number): void {
    this.form.controls.borderRadius.setValue(radius);
  }

  openFontModal(): void {
    this.showFontModal = true;
  }

  closeFontModal(): void {
    this.showFontModal = false;
  }

  selectFont(font: FontOption): void {
    this.form.controls.fontFamily.setValue(font.fontFamily);
    this.showFontModal = false;
  }

  currentFont(): FontOption {
    return this.fontOptions.find((font) => font.fontFamily === this.form.controls.fontFamily.value) ?? this.fontOptions[0];
  }
}
