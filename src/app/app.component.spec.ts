/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { UsuariosComponent } from './views/usuarios/usuarios.component';
import { PerfilComponent } from './views/perfil/perfil.component';
import { SettingsComponent } from './settings/settings.component';
import { ToastService } from './shared/toast/toast.service';
import { SettingsService } from './settings/settings.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, UsuariosComponent, PerfilComponent, SettingsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should render the navigation tabs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('.nav-tab');
    expect(tabs.length).toBe(3);
    expect(tabs[0].textContent).toContain('Usuarios');
    expect(tabs[1].textContent).toContain('Perfil');
    expect(tabs[2].textContent).toContain('Configuración');
  });

  it('should switch between views when switchView is called', () => {
    expect(app.currentView).toBe('usuarios');

    app.switchView('perfil');
    fixture.detectChanges();
    expect(app.currentView).toBe('perfil');

    const profileEl = fixture.nativeElement.querySelector('app-perfil');
    expect(profileEl).toBeTruthy();

    app.switchView('configuracion');
    fixture.detectChanges();
    expect(app.currentView).toBe('configuracion');

    const configEl = fixture.nativeElement.querySelector('app-settings');
    expect(configEl).toBeTruthy();

    app.switchView('usuarios');
    fixture.detectChanges();
    expect(app.currentView).toBe('usuarios');

    const usersEl = fixture.nativeElement.querySelector('app-usuarios');
    expect(usersEl).toBeTruthy();
  });

  it('should update profile and admin user when onProfileSaved is called', () => {
    app.onProfileSaved({
      name: 'Super Admin SENA',
      email: 'superadmin@tdo.gov.co',
      role: 'Administrador',
      entity: 'SENA',
      dateJoined: '24/08/2026',
      photoUrl: ''
    });

    expect(app.profileUser.name).toBe('Super Admin SENA');
    expect(app.profileUser.email).toBe('superadmin@tdo.gov.co');
    expect(app.users[0].name).toBe('Super Admin SENA');
    expect(app.users[0].initials).toBe('SA');
  });

  it('should notify through the shared ToastService when there are no new notifications', () => {
    const toastService = TestBed.inject(ToastService);
    spyOn(toastService, 'warning');

    app.notifyNoNewNotifications();

    expect(toastService.warning).toHaveBeenCalledWith('No tienes nuevas notificaciones.');
  });

  it('should translate the sidebar navigation live when the language setting changes (applies to the whole system)', () => {
    const settingsService = TestBed.inject(SettingsService);
    const compiled = fixture.nativeElement as HTMLElement;

    let tabs = compiled.querySelectorAll('.nav-tab');
    expect(tabs[0].textContent).toContain('Usuarios');
    expect(tabs[1].textContent).toContain('Perfil');
    expect(tabs[2].textContent).toContain('Configuración');

    settingsService.updateDraft({ language: 'en' });
    fixture.detectChanges();

    tabs = compiled.querySelectorAll('.nav-tab');
    expect(tabs[0].textContent).toContain('Users');
    expect(tabs[1].textContent).toContain('Profile');
    expect(tabs[2].textContent).toContain('Settings');
  });

  it('should toggle dark mode through SettingsService so it survives opening/closing Configuración', () => {
    const settingsService = TestBed.inject(SettingsService);

    expect(app.darkMode).toBeFalse();
    app.toggleDarkMode();
    fixture.detectChanges();
    expect(app.darkMode).toBeTrue();
    expect(settingsService.saved().theme).toBe('oscuro');

    // Abrir y cerrar Configuración sin tocar Apariencia no debe deshacer el toggle.
    settingsService.discardDraft();
    fixture.detectChanges();
    expect(app.darkMode).toBeTrue();

    app.toggleDarkMode();
    fixture.detectChanges();
    expect(app.darkMode).toBeFalse();
    expect(settingsService.saved().theme).toBe('claro');
  });
});

