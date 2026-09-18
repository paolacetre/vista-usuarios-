import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, computed, effect, inject } from '@angular/core';
import { UsuariosComponent, User } from './views/usuarios/usuarios.component';
import { PerfilComponent, ProfileData } from './views/perfil/perfil.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsService } from './settings/settings.service';
import { ToastContainerComponent } from './shared/toast/toast-container.component';
import { ToastService } from './shared/toast/toast.service';
import { TranslatePipe } from './shared/i18n/translate.pipe';
import { TranslationService } from './shared/i18n/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UsuariosComponent, PerfilComponent, SettingsComponent, ToastContainerComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly toastService = inject(ToastService);
  private readonly translationService = inject(TranslationService);

  readonly sessionRole = 'Administrador';
  /** Preferencias > "Notificaciones del sistema": muestra u oculta la campana de la barra superior. */
  readonly notificationsEnabled = computed(() => this.settingsService.draft().notifications);
  currentView: 'usuarios' | 'perfil' | 'configuracion' = 'usuarios';
  configurationOpen = false;
  darkMode = false;

  profileUser: ProfileData = {
    name: 'SENA Admin',
    email: 'admin@tdo.gov.co',
    role: 'Administrador',
    entity: 'Servicio Nacional de Aprendizaje (SENA)',
    dateJoined: '24/08/2026',
    photoUrl: ''
  };

  users: User[] = [
    { id: 1, name: 'SENA Admin', email: 'admin@tdo.gov.co', password: 'Admin*Password2026', role: 'Admin', status: 'Activo', date: '24/08/2026', initials: 'SA' },
    { id: 2, name: 'Analista TDO', email: 'analista@tdo.gov.co', password: 'Analista*Password2026', role: 'Analista', status: 'Activo', date: '24/08/2026', initials: 'AT' },
  ];

  constructor() {
    // Los ajustes de Configuración son globales y se aplican en vivo (incluso
    // antes de guardar): este efecto mantiene el modo oscuro del shell
    // sincronizado con el borrador mientras se edita, y con lo guardado el
    // resto del tiempo (SettingsService.draft === SettingsService.saved
    // salvo mientras el panel de Configuración está abierto y sucio).
    effect(() => {
      this.darkMode = this.settingsService.draft().theme === 'oscuro';
    });
  }

  ngOnInit(): void {
    this.settingsService.load().subscribe();
  }

  switchView(view: 'usuarios' | 'perfil' | 'configuracion') {
    this.currentView = view;
    this.configurationOpen = view === 'configuracion';
  }

  closeConfiguration() {
    this.settingsService.discardDraft();
    this.configurationOpen = false;
    this.currentView = 'usuarios';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onConfigurationEscape(event: Event) {
    if (this.configurationOpen) {
      event.preventDefault();
      this.closeConfiguration();
    }
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    try {
      localStorage.setItem('tdo_dark_mode', JSON.stringify(this.darkMode));
    } catch {
      // Ignore local storage error in sandboxes
    }
  }

  notifyNoNewNotifications() {
    this.toastService.info(this.translationService.translate('notifications.none'));
  }

  onProfileSaved(updated: ProfileData) {
    this.profileUser = { ...updated };
    const adminUser = this.users.find(u => u.id === 1);
    if (adminUser) {
      adminUser.name = updated.name;
      adminUser.email = updated.email;
      adminUser.initials = updated.name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    }
  }
}
