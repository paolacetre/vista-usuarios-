/// <reference types="jasmine" />

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UsuariosComponent } from './usuarios.component';

describe('UsuariosComponent', () => {
  let fixture: ComponentFixture<UsuariosComponent>;
  let comp: UsuariosComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    comp = fixture.componentInstance;
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
