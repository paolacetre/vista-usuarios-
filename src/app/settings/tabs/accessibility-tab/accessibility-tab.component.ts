import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../settings.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-accessibility-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './accessibility-tab.component.html',
  styleUrl: './accessibility-tab.component.scss'
})
export class AccessibilityTabComponent {
  private readonly settings = inject(SettingsService);
  private readonly fb = inject(FormBuilder);

  readonly draft = this.settings.draft;

  readonly form = this.fb.nonNullable.group({
    highContrast: this.settings.draft().highContrast,
    readOnly: this.settings.draft().readOnly,
    largeIcons: this.settings.draft().largeIcons
  });

  constructor() {
    effect(() => this.form.patchValue(this.settings.draft(), { emitEvent: false }));
    this.form.valueChanges.subscribe((value) => this.settings.updateDraft(value));
  }

  toggle(control: 'highContrast' | 'readOnly' | 'largeIcons'): void {
    this.form.controls[control].setValue(!this.form.controls[control].value);
  }
}
