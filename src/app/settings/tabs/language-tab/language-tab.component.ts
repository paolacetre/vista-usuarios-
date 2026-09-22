import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../settings.service';
import { LANGUAGE_OPTIONS, LanguageCode } from '../../settings.model';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-language-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './language-tab.component.html',
  styleUrl: './language-tab.component.scss'
})
export class LanguageTabComponent {
  private readonly settings = inject(SettingsService);
  private readonly fb = inject(FormBuilder);

  readonly languageOptions = LANGUAGE_OPTIONS;
  readonly draft = this.settings.draft;

  readonly form = this.fb.nonNullable.group({
    language: this.settings.draft().language
  });

  constructor() {
    effect(() => this.form.patchValue({ language: this.settings.draft().language }, { emitEvent: false }));
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.settings.updateDraft(value));
  }

  selectLanguage(language: LanguageCode): void {
    this.form.controls.language.setValue(language);
  }

  selectedLanguageName(): string {
    return this.languageOptions.find((lang) => lang.id === this.form.controls.language.value)?.name ?? '';
  }
}
