import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UsuariosComponent, User } from './views/usuarios/usuarios.component';
import { PerfilComponent, ProfileData } from './views/perfil/perfil.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UsuariosComponent, PerfilComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly sessionRole = 'Administrador';
  currentView: 'usuarios' | 'perfil' = 'usuarios';
  darkMode = false;

  notice = '';
  noticeType: 'success' | 'error' = 'success';
  private noticeTimeout?: ReturnType<typeof setTimeout>;

  profileUser: ProfileData = {
    name: 'SENA Admin',
    email: 'admin@tdo.gov.co',
    role: 'Administrador',
    entity: 'Servicio Nacional de Aprendizaje (SENA)',
    regional: 'Dirección General - Bogotá D.C.',
    dateJoined: '24/08/2026',
    photoUrl: ''
  };

  users: User[] = [
    { id: 1, name: 'SENA Admin', email: 'admin@tdo.gov.co', password: 'Admin*Password2026', role: 'Admin', status: 'Activo', date: '24/08/2026', initials: 'SA' },
    { id: 2, name: 'Analista TDO', email: 'analista@tdo.gov.co', password: 'Analista*Password2026', role: 'Analista', status: 'Activo', date: '24/08/2026', initials: 'AT' },
  ];

  switchView(view: 'usuarios' | 'perfil') {
    this.currentView = view;
  }

  setNotice(message: string, type: 'success' | 'error' = 'success') {
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout);
    }

    this.notice = message;
    this.noticeType = type;
    this.noticeTimeout = setTimeout(() => this.notice = '', 2800);
  }

  handleNotice(event: { message: string; type: 'success' | 'error' }) {
    this.setNotice(event.message, event.type);
  }

  onProfileSaved(updated: ProfileData) {
    this.profileUser = { ...updated };
    const adminUser = this.users.find(u => u.id === 1);
    if (adminUser) {
      adminUser.name = updated.name;
      adminUser.email = updated.email;
      adminUser.initials = updated.name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    }
    this.setNotice('Perfil actualizado correctamente.');
  }
}

