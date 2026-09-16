import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SettingsService } from '../../settings.service';
import { SystemLogos } from '../../settings.model';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';

/** Mapea los códigos de error estables de SettingsService.uploadLogo() a claves de traducción. */
const LOGO_UPLOAD_ERROR_KEYS: Record<string, string> = {
  NOT_IMAGE: 'logos.errorNotImage',
  TOO_LARGE: 'logos.errorTooLarge',
  UNSAFE_SVG: 'logos.errorUnsafeSvg',
  READ_FAILED: 'logos.errorReadFailed'
};

@Component({
  selector: 'app-logos-tab',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './logos-tab.component.html',
  styleUrl: './logos-tab.component.scss'
})
export class LogosTabComponent {
  private readonly settings = inject(SettingsService);
  private readonly translationService = inject(TranslationService);

  readonly draft = this.settings.draft;
  readonly errorMessage = signal('');

  onLogoSelected(event: Event, slot: keyof SystemLogos | 'all'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.settings.uploadLogo(file, slot).subscribe({
      next: () => this.errorMessage.set(''),
      error: (error: Error) => {
        const key = LOGO_UPLOAD_ERROR_KEYS[error.message] ?? 'logos.errorReadFailed';
        this.errorMessage.set(this.translationService.translate(key));
      }
    });
    input.value = '';
  }

  removeLogo(slot: keyof SystemLogos): void {
    this.settings.removeLogo(slot);
  }
}
