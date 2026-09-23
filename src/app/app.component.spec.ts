/// <reference types="jasmine" />

import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

  it('should keep users created or deleted in Usuarios after navigating to Perfil and back', fakeAsync(() => {
    let usuarios = fixture.debugElement.query(By.directive(UsuariosComponent)).componentInstance as UsuariosComponent;
    usuarios.startCreate();
    usuarios.formUser = { name: 'Nueva Persona', email: 'nueva@tdo.gov.co', password: 'Segura123', role: 'Analista' };
    usuarios.saveUser();
    tick(250);
    usuarios.requestDelete(usuarios.users.find((u) => u.id === 2)!, { currentTarget: null });
    usuarios.confirmDelete();
    tick(250);
    fixture.detectChanges();
    flush();

    app.switchView('perfil');
    fixture.detectChanges();
    app.switchView('usuarios');
    fixture.detectChanges();

    usuarios = fixture.debugElement.query(By.directive(UsuariosComponent)).componentInstance as UsuariosComponent;
    expect(usuarios.users.some((u) => u.email === 'nueva@tdo.gov.co')).toBeTrue();
    expect(usuarios.users.some((u) => u.id === 2)).toBeFalse();
    flush();
  }));

  it('should close only the nested dialog on Escape inside Configuración, keeping the panel and unsaved changes', fakeAsync(() => {
    const settingsService = TestBed.inject(SettingsService);
    app.switchView('configuracion');
    fixture.detectChanges();
    settingsService.updateDraft({ accentColor: '#123456' });
    const settings = fixture.debugElement.query(By.directive(SettingsComponent)).componentInstance as SettingsComponent;
    settings.requestSave();
    fixture.detectChanges();
    flush();

    const compiled = fixture.nativeElement as HTMLElement;
    const saveDialog = compiled.querySelector('[aria-labelledby="save-dialog-title"]') as HTMLElement;
    saveDialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    flush();

    expect(settings.pendingSave()).toBeFalse();
    expect(app.configurationOpen).toBeTrue();
    expect(settingsService.draft().accentColor).toBe('#123456');

    const panel = compiled.querySelector('.configuration-modal') as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    flush();

    expect(app.configurationOpen).toBeFalse();
  }));

  it('should show the principal logo together with the app name in the sidebar, and the "T" mark when there is no logo', () => {
    const settingsService = TestBed.inject(SettingsService);
    const compiled = fixture.nativeElement as HTMLElement;
    const logos = settingsService.draft().logos;

    settingsService.updateDraft({ logos: { ...logos, principal: '/assets/logos/logo-simbolo.png' } });
    fixture.detectChanges();
    const img = compiled.querySelector('.brand .brand-logo') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/assets/logos/logo-simbolo.png');
    expect(compiled.querySelector('.brand .brand-name')?.textContent).toContain('Tendencias Ocupacionales');
    expect(compiled.querySelector('.brand .brand-mark')).toBeNull();

    settingsService.updateDraft({ logos: { ...logos, principal: null } });
    fixture.detectChanges();
    expect(compiled.querySelector('.brand .brand-logo')).toBeNull();
    expect(compiled.querySelector('.brand .brand-mark')).not.toBeNull();
    expect(compiled.querySelector('.brand')?.textContent).toContain('Tendencias Ocupacionales');
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

