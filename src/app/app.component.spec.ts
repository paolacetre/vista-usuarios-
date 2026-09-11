/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { UsuariosComponent } from './views/usuarios/usuarios.component';
import { PerfilComponent } from './views/perfil/perfil.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, UsuariosComponent, PerfilComponent]
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
    expect(tabs.length).toBe(2);
    expect(tabs[0].textContent).toContain('Usuarios');
    expect(tabs[1].textContent).toContain('Perfil');
  });

  it('should switch between views when switchView is called', () => {
    expect(app.currentView).toBe('usuarios');

    app.switchView('perfil');
    fixture.detectChanges();
    expect(app.currentView).toBe('perfil');

    const profileEl = fixture.nativeElement.querySelector('app-perfil');
    expect(profileEl).toBeTruthy();

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
      regional: 'Bogotá',
      dateJoined: '24/08/2026',
      photoUrl: ''
    });

    expect(app.profileUser.name).toBe('Super Admin SENA');
    expect(app.profileUser.email).toBe('superadmin@tdo.gov.co');
    expect(app.users[0].name).toBe('Super Admin SENA');
    expect(app.users[0].initials).toBe('SA');
    expect(app.notice).toContain('Perfil actualizado correctamente');
  });
});

