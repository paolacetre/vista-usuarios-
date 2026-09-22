import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../settings.service';
import { DATE_FORMAT_OPTIONS, TIMEZONE_OPTIONS } from '../../settings.model';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-preferences-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './preferences-tab.component.html',
  styleUrl: './preferences-tab.component.scss'
})
export class PreferencesTabComponent {
  private readonly settings = inject(SettingsService);
  private readonly fb = inject(FormBuilder);

  readonly draft = this.settings.draft;
  readonly timezoneOptions = TIMEZONE_OPTIONS;
  readonly dateFormatOptions = DATE_FORMAT_OPTIONS;

  readonly form = this.fb.nonNullable.group({
    notifications: this.settings.draft().notifications,
    timezone: this.settings.draft().timezone,
    dateFormat: this.settings.draft().dateFormat
  });

  constructor() {
    effect(() => this.form.patchValue(this.settings.draft(), { emitEvent: false }));
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.settings.updateDraft(value));
  }

  toggleNotifications(): void {
    this.form.controls.notifications.setValue(!this.form.controls.notifications.value);
  }
}
