/// <reference types="jasmine" />

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should render the users management heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heading = compiled.querySelector('h1');

    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toContain('Gestión de Usuarios');
  });

  it('should have users loaded', () => {
    expect(app.filteredUsers).toBeDefined();
    expect(app.filteredUsers.length).toBeGreaterThan(0);
  });

  it('should filter users by role and search term simultaneously', () => {
    app.searchTerm = 'analista';
    app.selectedRole = 'Analista';
    app.selectedStatus = 'Todos';

    fixture.detectChanges();

    expect(app.filteredUsers.length).toBe(1);
    expect(app.filteredUsers[0].name).toBe('Analista TDO');
  });

  it('should filter users by role', () => {
    app.searchTerm = '';
    app.selectedRole = 'Analista';
    app.selectedStatus = 'Todos';

    fixture.detectChanges();

    expect(app.filteredUsers.every(user => user.role === 'Analista')).toBeTrue();
  });

  it('should filter users by status', () => {
    app.searchTerm = '';
    app.selectedRole = 'Todos';
    app.selectedStatus = 'Activo';

    fixture.detectChanges();

    expect(app.filteredUsers.every(user => user.status === 'Activo')).toBeTrue();
  });

  it('should return all users when filters are set to Todos', () => {
    app.searchTerm = '';
    app.selectedRole = 'Todos';
    app.selectedStatus = 'Todos';

    fixture.detectChanges();

    expect(app.filteredUsers.length).toBe(app.users.length);
  });

  it('should render users in a semantic table', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('table thead tr th')).toBeTruthy();
    expect(compiled.querySelectorAll('table tbody tr.user-row').length).toBe(app.users.length);
  });

  it('should toggle a user status once while the action is pending', fakeAsync(() => {
    const user = app.users[0];

    app.toggleUser(user);
    app.toggleUser(user);
    tick(250);

    expect(user.status).toBe('Inactivo');
    expect(app.notice).toContain('desactivado correctamente');
  }));

  it('should restore access only once while the action is pending', fakeAsync(() => {
    const user = app.users[0];

    app.resetUserAccess(user);
    app.resetUserAccess(user);
    tick(250);

    expect(app.notice).toContain('Acceso de "SENA Admin" restablecido correctamente');
  }));

  it('should delete only the confirmed user', fakeAsync(() => {
    const user = app.users[0];
    const trigger = document.createElement('button');

    app.requestDelete(user, { currentTarget: trigger });
    expect(app.pendingDeletion).toBe(user);
    app.confirmDelete();
    tick(250);

    expect(app.users.some((item) => item.id === user.id)).toBeFalse();
    expect(app.users.length).toBe(1);
  }));
});
