import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { UsuariosComponent, User, createInitialUsers } from './views/usuarios/usuarios.component';
import { PerfilComponent, ProfileData, createInitialProfile } from './views/perfil/perfil.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsService } from './settings/settings.service';
import { ToastContainerComponent } from './shared/toast/toast-container.component';
import { ToastService } from './shared/toast/toast.service';
import { TranslatePipe } from './shared/i18n/translate.pipe';
import { TranslationService } from './shared/i18n/translation.service';
import { initialsFrom } from './shared/format/initials';
import { DialogDirective } from './shared/dialog/dialog.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UsuariosComponent, PerfilComponent, SettingsComponent, ToastContainerComponent, TranslatePipe, DialogDirective],
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
  /**
   * Aún no hay fuente de notificaciones (no hay backend): 0 oculta el contador
   * de la campana. Antes mostraba un "22" fijo que contradecía el aviso
   * "No tienes nuevas notificaciones".
   */
  readonly unreadNotifications = 0;
  /** Configuración > Logos > "Logo principal": se muestra en el menú lateral, en vivo al cambiarlo. */
  readonly brandLogo = computed(() => this.settingsService.draft().logos.principal);
  currentView: 'usuarios' | 'perfil' | 'configuracion' = 'usuarios';
  configurationOpen = false;
  darkMode = false;

  profileUser: ProfileData = createInitialProfile();

  users: User[] = createInitialUsers();

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

  /**
   * Antes esto solo tocaba un flag local + una clave de localStorage sin
   * relación con SettingsService, así que cualquier interacción con
   * Configuración (incluso solo abrirla y cerrarla sin cambiar nada) volvía
   * a aplicar `draft().theme` vía el effect() del constructor y deshacía el
   * toggle en silencio. Ahora este botón es un atajo que escribe y guarda
   * directamente el mismo `theme` que usa la pestaña Apariencia, así que
   * ambos quedan sincronizados y no se pisan entre sí.
   */
  toggleDarkMode() {
    const nextTheme = this.settingsService.draft().theme === 'oscuro' ? 'claro' : 'oscuro';
    this.settingsService.updateDraft({ theme: nextTheme });
    this.settingsService.save().subscribe({
      error: () => this.toastService.error(this.translationService.translate('settings.toastSaveError'))
    });
  }

  notifyNoNewNotifications() {
    // Solo existen 3 estados (Aprobado/Rechazado/Advertencia): un aviso que no
    // es éxito ni error se muestra como Advertencia.
    this.toastService.warning(this.translationService.translate('notifications.none'));
  }

  onProfileSaved(updated: ProfileData) {
    this.profileUser = { ...updated };
    const adminUser = this.users.find(u => u.id === 1);
    if (adminUser) {
      adminUser.name = updated.name;
      adminUser.email = updated.email;
      adminUser.initials = initialsFrom(updated.name);
    }
  }
}
