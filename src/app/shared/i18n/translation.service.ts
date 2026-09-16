import { Injectable, computed, inject } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { TRANSLATIONS } from './translations';

/**
 * Traduce el "chrome" de la app según `SettingsService.draft().language`.
 * Al leer el `draft` (no el `saved`) hereda gratis el mismo comportamiento
 * que el resto de los ajustes: se aplica en vivo mientras editas Idioma, y
 * vuelve a lo guardado si cierras el panel sin guardar (`discardDraft()` ya
 * sincroniza `draft` con `saved`, así que no hace falta lógica extra acá).
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly settings = inject(SettingsService);

  readonly language = computed(() => this.settings.draft().language);

  translate(key: string, params?: Record<string, string | number>): string {
    const dictionary = TRANSLATIONS[this.language()] ?? TRANSLATIONS.es;
    let text = dictionary[key] ?? TRANSLATIONS.es[key] ?? key;

    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{\\s*${name}\\s*}}`, 'g'), String(value));
      }
    }

    return text;
  }
}
