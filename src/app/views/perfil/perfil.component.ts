import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ProfileData {
  name: string;
  email: string;
  role: string;
  entity: string;
  regional: string;
  dateJoined: string;
  photoUrl: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  @Input() profile: ProfileData = {
    name: 'SENA Admin',
    email: 'admin@tdo.gov.co',
    role: 'Administrador',
    entity: 'Servicio Nacional de Aprendizaje (SENA)',
    regional: 'Dirección General - Bogotá D.C.',
    dateJoined: '24/08/2026',
    photoUrl: ''
  };

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
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        this.formError = 'La imagen seleccionada supera el límite máximo de 2MB.';
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
    this.formProfile.photoUrl = '';
  }

  save() {
    const name = this.formProfile.name.trim();
    const email = this.formProfile.email.trim().toLowerCase();

    if (!name || !email) {
      this.formError = 'Por favor completa el nombre y el correo institucional.';
      return;
    }

    this.isSaving = true;
    this.formError = '';

    setTimeout(() => {
      this.profile = { ...this.formProfile, name, email };
      this.profileSaved.emit(this.profile);
      this.isSaving = false;
      this.successNotice = 'Los cambios de tu perfil se han guardado exitosamente.';
      setTimeout(() => this.successNotice = '', 3000);
    }, 300);
  }

  onCancel() {
    this.formProfile = { ...this.profile };
    this.formError = '';
    this.cancel.emit();
  }
}
