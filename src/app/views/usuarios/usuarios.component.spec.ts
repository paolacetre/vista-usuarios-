/// <reference types="jasmine" />

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UsuariosComponent } from './usuarios.component';
import { ToastService } from '../../shared/toast/toast.service';
import { SettingsService } from '../../settings/settings.service';

describe('UsuariosComponent', () => {
  let fixture: ComponentFixture<UsuariosComponent>;
  let comp: UsuariosComponent;
  let toastService: ToastService;
  let settingsService: SettingsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    comp = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    settingsService = TestBed.inject(SettingsService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(comp).toBeTruthy();
  });

  it('should filter users by role and search term simultaneously', () => {
    comp.searchTerm = 'analista';
    comp.selectedRole = 'Analista';
    comp.selectedStatus = 'Todos';

    fixture.detectChanges();

    expect(comp.filteredUsers.length).toBe(1);
    expect(comp.filteredUsers[0].name).toBe('Analista TDO');
  });

  it('should filter users by status', () => {
    comp.searchTerm = '';
    comp.selectedRole = 'Todos';
    comp.selectedStatus = 'Activo';

    fixture.detectChanges();

    expect(comp.filteredUsers.every(user => user.status === 'Activo')).toBeTrue();
  });

  it('should open and save create user form', fakeAsync(() => {
    comp.startCreate();
    comp.formUser = {
      name: 'Usuario Prueba',
      email: 'prueba@tdo.gov.co',
      password: 'MiPassword*2026',
      role: 'Analista'
    };

    comp.saveUser();
    tick(250);

    const created = comp.users.find(u => u.email === 'prueba@tdo.gov.co');
    expect(created).toBeTruthy();
    expect(created?.password).toBe('MiPassword*2026');
  }));

  it('should reject a weak password (missing uppercase, lowercase, number or under 8 chars) when creating a user', fakeAsync(() => {
    comp.startCreate();
    comp.formUser = {
      name: 'Usuario Débil',
      email: 'debil@tdo.gov.co',
      password: 'abc12345', // sin mayúscula
      role: 'Analista'
    };

    comp.saveUser();
    tick(250);

    expect(comp.formError).toContain('mínimo 8 caracteres');
    expect(comp.users.find(u => u.email === 'debil@tdo.gov.co')).toBeFalsy();

    comp.formUser.password = 'Abcdefg1'; // cumple: mayúscula, minúscula, número, 8+ caracteres
    comp.saveUser();
    tick(250);

    expect(comp.users.find(u => u.email === 'debil@tdo.gov.co')).toBeTruthy();
  }));

  it('should keep the current password when editing with the field left blank, but validate it if one is typed', fakeAsync(() => {
    const existing = comp.users[0];
    const originalPassword = existing.password;

    comp.startEdit(existing);
    comp.formUser.password = 'short1A'; // 7 caracteres: no cumple el mínimo de 8
    comp.saveUser();
    tick(250);

    expect(comp.formError).toBeTruthy();
    expect(existing.password).toBe(originalPassword);

    comp.formUser.password = '';
    comp.saveUser();
    tick(250);

    expect(existing.password).toBe(originalPassword);
  }));

  it('should notify success/error through the shared ToastService instead of an @Output', () => {
    spyOn(toastService, 'success');
    spyOn(toastService, 'error');

    comp.emitNotice('Usuario creado correctamente.');
    expect(toastService.success).toHaveBeenCalledWith('Usuario creado correctamente.');

    comp.emitNotice('No se pudo completar la acción.', 'error');
    expect(toastService.error).toHaveBeenCalledWith('No se pudo completar la acción.');
  });

  it('should translate the whole page (heading, table headers, actions) when the language setting changes', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('Gestión de Usuarios');
    expect(el.querySelector('.table-head th')?.textContent).toContain('USUARIO');
    expect(comp.roleBadgeLabel('Admin')).toBe('Admin');
    expect(comp.statusLabel('Activo')).toBe('Activo');

    settingsService.updateDraft({ language: 'en' });
    fixture.detectChanges();

    expect(el.querySelector('h1')?.textContent).toContain('User Management');
    expect(el.querySelector('.table-head th')?.textContent).toContain('USER');
    expect(comp.statusLabel('Activo')).toBe('Active');
    expect(comp.roleFilterLabel('Analista')).toBe('Analysts');

    settingsService.updateDraft({ language: 'pt' });
    fixture.detectChanges();

    expect(el.querySelector('h1')?.textContent).toContain('Gestão de Usuários');
    expect(comp.statusLabel('Inactivo')).toBe('Inativo');
  });

  it('should handle status change modal flow', fakeAsync(() => {
    const user = comp.users[0];
    const btn = document.createElement('button');

    comp.requestStatusChange(user, { currentTarget: btn });
    expect(comp.pendingStatusChange).toBe(user);

    comp.confirmStatusChange();
    tick(250);

    expect(user.status).toBe('Inactivo');
    expect(comp.pendingStatusChange).toBeNull();
  }));

  it('should handle reset access modal flow', fakeAsync(() => {
    const user = comp.users[0];
    const btn = document.createElement('button');

    comp.requestResetAccess(user, { currentTarget: btn });
    expect(comp.pendingResetAccess).toBe(user);

    comp.confirmResetAccess();
    tick(250);

    expect(comp.pendingResetAccess).toBeNull();
  }));

  it('should handle delete user modal flow', fakeAsync(() => {
    const user = comp.users[0];
    const btn = document.createElement('button');

    comp.requestDelete(user, { currentTarget: btn });
    expect(comp.pendingDeletion).toBe(user);

    comp.confirmDelete();
    tick(250);

    expect(comp.users.some(u => u.id === user.id)).toBeFalse();
  }));
});
