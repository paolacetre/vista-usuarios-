import { Component, EventEmitter, Input, OnInit, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/toast/toast.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { TranslationService } from '../../shared/i18n/translation.service';
import { AppDatePipe } from '../../shared/format/app-date.pipe';
import { SettingsService } from '../../settings/settings.service';

export interface ProfileData {
  name: string;
  email: string;
  role: string;
  entity: string;
  dateJoined: string;
  photoUrl: string;
}

/** Perfil de ejemplo de la sesión (no hay backend). */
export function createInitialProfile(): ProfileData {
  return {
    name: 'SENA Admin',
    email: 'admin@tdo.gov.co',
    role: 'Administrador',
    entity: 'Servicio Nacional de Aprendizaje (SENA)',
    dateJoined: '24/08/2026',
    photoUrl: ''
  };
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, AppDatePipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly translationService = inject(TranslationService);
  private readonly settingsService = inject(SettingsService);

  /** Accesibilidad > "Modo solo lectura": el perfil se puede ver pero no modificar. */
  readonly readOnly = computed(() => this.settingsService.draft().readOnly);

  @Input() profile: ProfileData = createInitialProfile();

  @Output() profileSaved = new EventEmitter<ProfileData>();
  @Output() cancel = new EventEmitter<void>();

  formProfile: ProfileData = { ...this.profile };
  isSaving = false;
  formError = '';
  successNotice = '';

  ngOnInit() {
    this.formProfile = { ...this.profile };
  }

  onPhotoSelected(event: Event) {
    if (this.readOnly()) {
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        this.formError = this.translationService.translate('perfil.photoTooLarge');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.formProfile.photoUrl = reader.result as string;
        this.formError = '';
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    if (this.readOnly()) {
      return;
    }

    this.formProfile.photoUrl = '';
  }

  save() {
    if (this.readOnly()) {
      return;
    }

    const name = this.formProfile.name.trim();
    const email = this.formProfile.email.trim().toLowerCase();

    if (!name || !email) {
      this.formError = this.translationService.translate('perfil.errorRequiredFields');
      return;
    }

    this.isSaving = true;
    this.formError = '';

    setTimeout(() => {
      this.profile = { ...this.formProfile, name, email };
      this.profileSaved.emit(this.profile);
      this.isSaving = false;
      this.successNotice = this.translationService.translate('perfil.successBanner');
      setTimeout(() => this.successNotice = '', 3000);
      this.toastService.success(this.translationService.translate('perfil.toastUpdated'));
    }, 300);
  }

  onCancel() {
    this.formProfile = { ...this.profile };
    this.formError = '';
    this.cancel.emit();
  }
}
